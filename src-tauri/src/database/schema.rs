use crate::database::types::{ColumnInfo, IndexInfo, SchemaInfo, TableInfo, ViewInfo};
use crate::error::Result;
use rusqlite::Connection;

pub struct SchemaReader;

impl SchemaReader {
    pub fn read_schema(conn: &Connection) -> Result<SchemaInfo> {
        let tables = Self::read_tables(conn)?;
        let views = Self::read_views(conn)?;
        let indexes = Self::read_indexes(conn)?;

        Ok(SchemaInfo {
            tables,
            views,
            indexes,
        })
    }

    fn read_tables(conn: &Connection) -> Result<Vec<TableInfo>> {
        let mut stmt = conn.prepare(
            "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        )?;

        let table_names: Vec<(String, Option<String>)> = stmt
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
            .filter_map(|r| r.ok())
            .collect();

        let mut tables = Vec::new();
        for (name, create_sql) in table_names {
            let columns = Self::read_columns(conn, &name)?;
            let row_count = Self::get_row_count(conn, &name)?;
            tables.push(TableInfo {
                name,
                columns,
                row_count,
                create_sql,
            });
        }

        Ok(tables)
    }

    fn read_views(conn: &Connection) -> Result<Vec<ViewInfo>> {
        let mut stmt = conn.prepare(
            "SELECT name, sql FROM sqlite_master WHERE type='view' ORDER BY name",
        )?;

        let views = stmt
            .query_map([], |row| {
                Ok(ViewInfo {
                    name: row.get(0)?,
                    create_sql: row.get(1)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(views)
    }

    fn read_indexes(conn: &Connection) -> Result<Vec<IndexInfo>> {
        let mut stmt = conn.prepare(
            "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        )?;

        let index_basics: Vec<(String, String)> = stmt
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
            .filter_map(|r| r.ok())
            .collect();

        let mut indexes = Vec::new();
        for (name, table_name) in index_basics {
            let mut info_stmt =
                conn.prepare(&format!("PRAGMA index_list(\"{}\")", table_name))?;
            let is_unique = info_stmt
                .query_map([], |row| {
                    let idx_name: String = row.get(1)?;
                    let unique: bool = row.get(2)?;
                    Ok((idx_name, unique))
                })?
                .filter_map(|r| r.ok())
                .find(|(n, _)| n == &name)
                .map(|(_, u)| u)
                .unwrap_or(false);

            let mut col_stmt =
                conn.prepare(&format!("PRAGMA index_info(\"{}\")", name))?;
            let columns: Vec<String> = col_stmt
                .query_map([], |row| row.get(2))?
                .filter_map(|r| r.ok())
                .collect();

            indexes.push(IndexInfo {
                name,
                table_name,
                columns,
                is_unique,
            });
        }

        Ok(indexes)
    }

    fn read_columns(conn: &Connection, table_name: &str) -> Result<Vec<ColumnInfo>> {
        let mut stmt = conn.prepare(&format!("PRAGMA table_info(\"{}\")", table_name))?;

        let columns = stmt
            .query_map([], |row| {
                Ok(ColumnInfo {
                    name: row.get(1)?,
                    data_type: row.get::<_, String>(2).unwrap_or_default(),
                    is_primary_key: row.get::<_, i32>(5).unwrap_or(0) > 0,
                    is_nullable: row.get::<_, i32>(3).unwrap_or(0) == 0,
                    default_value: row.get(4)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(columns)
    }

    fn get_row_count(conn: &Connection, table_name: &str) -> Result<i64> {
        let count: i64 = conn.query_row(
            &format!("SELECT COUNT(*) FROM \"{}\"", table_name),
            [],
            |row| row.get(0),
        )?;
        Ok(count)
    }
}
