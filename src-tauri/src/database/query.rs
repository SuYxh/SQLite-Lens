use crate::database::types::{
    FilterCondition, FilterOperator, QueryResult, SortColumn, SortDirection, TableDataParams,
    TableDataResult,
};
use crate::error::{AppError, Result};
use rusqlite::Connection;
use std::time::Instant;

pub struct QueryExecutor;

impl QueryExecutor {
    pub fn execute(conn: &Connection, sql: &str) -> Result<QueryResult> {
        let trimmed = sql.trim();
        if trimmed.is_empty() {
            return Err(AppError::InvalidSql("Empty SQL statement".to_string()));
        }

        if Self::is_select_query(trimmed) {
            Self::execute_select(conn, trimmed)
        } else {
            Self::execute_modify(conn, trimmed)
        }
    }

    pub fn get_table_data(conn: &Connection, params: &TableDataParams) -> Result<TableDataResult> {
        let total_rows: i64 = {
            let where_clause = Self::build_where_clause(&params.filters);
            let count_sql = format!(
                "SELECT COUNT(*) FROM \"{}\"{}",
                params.table_name, where_clause
            );
            conn.query_row(&count_sql, [], |row| row.get(0))?
        };

        let where_clause = Self::build_where_clause(&params.filters);
        let order_clause = Self::build_order_clause(&params.sort_columns);
        let offset = (params.page.saturating_sub(1)) * params.page_size;

        let sql = format!(
            "SELECT * FROM \"{}\"{}{}  LIMIT {} OFFSET {}",
            params.table_name, where_clause, order_clause, params.page_size, offset
        );

        let mut stmt = conn.prepare(&sql)?;

        let columns: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|n| n.to_string())
            .collect();

        let column_count = stmt.column_count();
        let rows: Vec<Vec<serde_json::Value>> = stmt
            .query_map([], |row| {
                let mut values = Vec::with_capacity(column_count);
                for i in 0..column_count {
                    let value = Self::sqlite_value_to_json(row.get_ref(i).ok());
                    values.push(value);
                }
                Ok(values)
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(TableDataResult {
            columns,
            rows,
            total_rows,
            page: params.page,
            page_size: params.page_size,
        })
    }

    fn execute_select(conn: &Connection, sql: &str) -> Result<QueryResult> {
        let start = Instant::now();
        let mut stmt = conn.prepare(sql)?;

        let columns: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|n| n.to_string())
            .collect();

        let column_count = stmt.column_count();
        let rows: Vec<Vec<serde_json::Value>> = stmt
            .query_map([], |row| {
                let mut values = Vec::with_capacity(column_count);
                for i in 0..column_count {
                    let value = Self::sqlite_value_to_json(row.get_ref(i).ok());
                    values.push(value);
                }
                Ok(values)
            })?
            .filter_map(|r| r.ok())
            .collect();

        let execution_time_ms = start.elapsed().as_secs_f64() * 1000.0;

        Ok(QueryResult {
            columns,
            rows,
            affected_rows: 0,
            execution_time_ms,
            is_select: true,
        })
    }

    fn execute_modify(conn: &Connection, sql: &str) -> Result<QueryResult> {
        let start = Instant::now();
        let affected_rows = conn.execute(sql, [])?;
        let execution_time_ms = start.elapsed().as_secs_f64() * 1000.0;

        Ok(QueryResult {
            columns: vec![],
            rows: vec![],
            affected_rows,
            execution_time_ms,
            is_select: false,
        })
    }

    fn sqlite_value_to_json(
        value: Option<rusqlite::types::ValueRef<'_>>,
    ) -> serde_json::Value {
        match value {
            Some(rusqlite::types::ValueRef::Null) | None => serde_json::Value::Null,
            Some(rusqlite::types::ValueRef::Integer(i)) => serde_json::json!(i),
            Some(rusqlite::types::ValueRef::Real(f)) => serde_json::json!(f),
            Some(rusqlite::types::ValueRef::Text(s)) => {
                serde_json::Value::String(String::from_utf8_lossy(s).to_string())
            }
            Some(rusqlite::types::ValueRef::Blob(b)) => {
                serde_json::Value::String(format!("[BLOB: {} bytes]", b.len()))
            }
        }
    }

    fn is_select_query(sql: &str) -> bool {
        let upper = sql.trim_start().to_uppercase();
        upper.starts_with("SELECT")
            || upper.starts_with("PRAGMA")
            || upper.starts_with("EXPLAIN")
            || upper.starts_with("WITH")
    }

    fn build_where_clause(filters: &Option<Vec<FilterCondition>>) -> String {
        let filters = match filters {
            Some(f) if !f.is_empty() => f,
            _ => return String::new(),
        };

        let conditions: Vec<String> = filters
            .iter()
            .map(|f| match f.operator {
                FilterOperator::Equals => {
                    format!("\"{}\" = '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::NotEquals => {
                    format!("\"{}\" != '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::Contains => {
                    format!("\"{}\" LIKE '%{}%'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::StartsWith => {
                    format!("\"{}\" LIKE '{}%'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::EndsWith => {
                    format!("\"{}\" LIKE '%{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::GreaterThan => {
                    format!("\"{}\" > '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::LessThan => {
                    format!("\"{}\" < '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::GreaterThanOrEqual => {
                    format!("\"{}\" >= '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::LessThanOrEqual => {
                    format!("\"{}\" <= '{}'", f.column, f.value.replace('\'', "''"))
                }
                FilterOperator::IsNull => format!("\"{}\" IS NULL", f.column),
                FilterOperator::IsNotNull => format!("\"{}\" IS NOT NULL", f.column),
            })
            .collect();

        format!(" WHERE {}", conditions.join(" AND "))
    }

    fn build_order_clause(sort_columns: &Option<Vec<SortColumn>>) -> String {
        let sorts = match sort_columns {
            Some(s) if !s.is_empty() => s,
            _ => return String::new(),
        };

        let clauses: Vec<String> = sorts
            .iter()
            .map(|s| {
                let dir = match s.direction {
                    SortDirection::Asc => "ASC",
                    SortDirection::Desc => "DESC",
                };
                format!("\"{}\" {}", s.column, dir)
            })
            .collect();

        format!(" ORDER BY {}", clauses.join(", "))
    }
}
