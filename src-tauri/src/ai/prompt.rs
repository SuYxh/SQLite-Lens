use rusqlite::Connection;

pub struct SchemaContext {
    pub tables: Vec<TableContext>,
    pub indexes: Vec<IndexContext>,
}

pub struct TableContext {
    pub name: String,
    pub columns: Vec<ColumnContext>,
    pub row_count: i64,
}

pub struct ColumnContext {
    pub name: String,
    pub data_type: String,
    pub is_nullable: bool,
    pub is_primary_key: bool,
}

pub struct IndexContext {
    pub name: String,
    pub table: String,
    pub columns: Vec<String>,
}

impl SchemaContext {
    pub fn from_connection(conn: &Connection) -> Result<SchemaContext, String> {
        let mut tables = Vec::new();

        let mut table_stmt = conn
            .prepare(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
            )
            .map_err(|e| e.to_string())?;

        let table_names: Vec<String> = table_stmt
            .query_map([], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        for table_name in &table_names {
            let mut columns = Vec::new();

            let mut col_stmt = conn
                .prepare(&format!("PRAGMA table_info(\"{}\")", table_name))
                .map_err(|e| e.to_string())?;

            let cols: Vec<ColumnContext> = col_stmt
                .query_map([], |row| {
                    Ok(ColumnContext {
                        name: row.get(1)?,
                        data_type: row.get(2)?,
                        is_nullable: !row.get::<_, bool>(3)?,
                        is_primary_key: row.get::<_, bool>(5)?,
                    })
                })
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();

            columns.extend(cols);

            let row_count: i64 = conn
                .query_row(
                    &format!("SELECT COUNT(*) FROM \"{}\"", table_name),
                    [],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            tables.push(TableContext {
                name: table_name.clone(),
                columns,
                row_count,
            });
        }

        let mut indexes = Vec::new();

        for table_name in &table_names {
            let mut idx_stmt = conn
                .prepare(&format!("PRAGMA index_list(\"{}\")", table_name))
                .map_err(|e| e.to_string())?;

            let idx_names: Vec<String> = idx_stmt
                .query_map([], |row| row.get(1))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();

            for idx_name in idx_names {
                let mut info_stmt = conn
                    .prepare(&format!("PRAGMA index_info(\"{}\")", idx_name))
                    .map_err(|e| e.to_string())?;

                let idx_columns: Vec<String> = info_stmt
                    .query_map([], |row| row.get(2))
                    .map_err(|e| e.to_string())?
                    .filter_map(|r| r.ok())
                    .collect();

                indexes.push(IndexContext {
                    name: idx_name,
                    table: table_name.clone(),
                    columns: idx_columns,
                });
            }
        }

        Ok(SchemaContext { tables, indexes })
    }
}

pub struct PromptBuilder;

impl PromptBuilder {
    pub fn optimize_sql_system(schema: &SchemaContext) -> String {
        format!(
            r#"You are a SQLite performance optimization expert. Analyze the given SQL query and provide optimization suggestions.

## Database Schema:
{}

## Rules:
1. Analyze the query execution plan and identify performance bottlenecks
2. Suggest index creation if beneficial
3. Recommend query rewrites for better performance
4. Consider SQLite-specific optimizations (covering indexes, WITHOUT ROWID tables, etc.)
5. Provide an optimized version of the SQL query
6. Format your response as:
   - **问题分析**: Brief analysis of the current query issues
   - **优化建议**: Numbered list of suggestions
   - **优化后 SQL**: The optimized SQL query (wrapped in ```sql code block)
   - **预期提升**: Expected performance improvement
7. Use the user's language (Chinese or English based on input)"#,
            Self::format_schema(schema)
        )
    }

    pub fn analyze_table_system(schema: &SchemaContext) -> String {
        format!(
            r#"You are a database analyst expert. Analyze the given table structure and data characteristics to provide insights.

## Database Schema:
{}

## Rules:
1. Infer the table's business purpose from column names, types, and data samples
2. Analyze data quality: null values, duplicates, data distribution
3. Identify potential issues: missing indexes, denormalization, data type mismatches
4. Suggest improvements for the table structure
5. Format your response as:
   - **表用途推测**: What this table likely stores
   - **数据质量**: Analysis of null values, duplicates, anomalies
   - **索引建议**: Recommended indexes based on column patterns
   - **结构优化**: Suggestions for table structure improvements
   - **注意事项**: Any warnings or important notes
6. Use the user's language (Chinese or English based on input)"#,
            Self::format_schema(schema)
        )
    }

    pub fn data_qa_system(schema: &SchemaContext) -> String {
        format!(
            r#"You are a data analysis assistant. Answer user's questions about data by generating and explaining SQL queries.

## Database Schema:
{}

## Rules:
1. Generate a valid SQLite SQL query to answer the user's question
2. After showing the SQL, explain what the query does
3. If the query returns results, summarize the findings in natural language
4. Always wrap SQL in ```sql code blocks
5. If the question is ambiguous, make reasonable assumptions and state them
6. For follow-up questions, consider the conversation context
7. Use the user's language (Chinese or English based on input)
8. If results are provided, analyze them and give a clear summary"#,
            Self::format_schema(schema)
        )
    }

    pub fn summarize_results_system() -> &'static str {
        r#"You are a data analyst. Summarize the query results in natural language.

## Rules:
1. Provide a concise summary of the data
2. Highlight key findings, trends, or patterns
3. If the data is tabular, mention the number of rows and key columns
4. Use the user's language (Chinese or English based on input)
5. Be specific with numbers and values from the results
6. Keep the summary brief but informative"#
    }

    pub fn text_to_sql_system(schema: &SchemaContext) -> String {
        format!(
            r#"You are a SQLite SQL expert. Generate valid SQLite SQL queries based on user's natural language descriptions.

## Database Schema:
{}

## Rules:
1. Only generate valid SQLite SQL syntax
2. Use double quotes for identifiers that may conflict with keywords
3. Always use parameterized-safe patterns
4. For date/time operations, use SQLite date functions (date(), time(), datetime(), strftime())
5. Return ONLY the SQL query, no explanations
6. If the request is ambiguous, generate the most reasonable interpretation
7. Use appropriate JOINs when querying across tables
8. Include LIMIT clause for potentially large result sets"#,
            Self::format_schema(schema)
        )
    }

    pub fn explain_sql_system() -> &'static str {
        r#"You are a SQL tutor. Explain the given SQL query in clear, simple language.

## Rules:
1. Explain each clause (SELECT, FROM, WHERE, JOIN, etc.) separately
2. Describe what the overall query does in one sentence first
3. Point out any potential issues or improvements
4. Use the user's language (Chinese or English based on input)
5. Be concise but thorough"#
    }

    pub fn fix_error_system(schema: &SchemaContext) -> String {
        format!(
            r#"You are a SQLite debugging expert. Fix the SQL error based on the error message and database schema.

## Database Schema:
{}

## Rules:
1. Analyze the error message to identify the root cause
2. Provide the corrected SQL query
3. Briefly explain what was wrong and how you fixed it
4. If there are multiple possible fixes, provide the most likely one
5. Ensure the fixed query is valid SQLite syntax"#,
            Self::format_schema(schema)
        )
    }

    pub fn format_schema(schema: &SchemaContext) -> String {
        let mut output = String::new();
        for table in &schema.tables {
            output.push_str(&format!("### Table: {}\n", table.name));
            output.push_str("| Column | Type | Nullable | Primary Key |\n");
            output.push_str("|--------|------|----------|-------------|\n");
            for col in &table.columns {
                output.push_str(&format!(
                    "| {} | {} | {} | {} |\n",
                    col.name,
                    col.data_type,
                    if col.is_nullable { "YES" } else { "NO" },
                    if col.is_primary_key { "YES" } else { "NO" },
                ));
            }
            output.push_str(&format!("Row count: ~{}\n\n", table.row_count));
        }

        if !schema.indexes.is_empty() {
            output.push_str("### Indexes:\n");
            for idx in &schema.indexes {
                output.push_str(&format!(
                    "- {} ON {}({})\n",
                    idx.name,
                    idx.table,
                    idx.columns.join(", ")
                ));
            }
        }

        output
    }
}
