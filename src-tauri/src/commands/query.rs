use crate::database::query::QueryExecutor;
use crate::database::types::{QueryResult, TableDataParams, TableDataResult};
use crate::state::AppState;
use rusqlite::types::Value as SqlValue;
use tauri::State;

#[tauri::command]
pub fn execute_query(
    state: State<AppState>,
    db_id: String,
    sql: String,
) -> Result<QueryResult, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    QueryExecutor::execute(conn, &sql).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_table_data(
    state: State<AppState>,
    db_id: String,
    params: TableDataParams,
) -> Result<TableDataResult, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    QueryExecutor::get_table_data(conn, &params).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_cell(
    state: State<AppState>,
    db_id: String,
    table_name: String,
    primary_key_column: String,
    primary_key_value: serde_json::Value,
    column: String,
    value: serde_json::Value,
) -> Result<u64, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;

    let sql = format!(
        "UPDATE \"{}\" SET \"{}\" = ?1 WHERE \"{}\" = ?2",
        table_name, column, primary_key_column
    );

    let val_param = json_value_to_sql_param(&value);
    let pk_param = json_value_to_sql_param(&primary_key_value);

    let affected = conn
        .execute(&sql, rusqlite::params![val_param, pk_param])
        .map_err(|e| e.to_string())?;

    Ok(affected as u64)
}

#[tauri::command]
pub fn insert_row(
    state: State<AppState>,
    db_id: String,
    table_name: String,
    values: serde_json::Map<String, serde_json::Value>,
) -> Result<i64, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;

    let columns: Vec<String> = values.keys().map(|k| format!("\"{}\"", k)).collect();
    let placeholders: Vec<String> = (1..=values.len()).map(|i| format!("?{}", i)).collect();

    let sql = format!(
        "INSERT INTO \"{}\" ({}) VALUES ({})",
        table_name,
        columns.join(", "),
        placeholders.join(", ")
    );

    let params: Vec<SqlValue> = values.values().map(json_value_to_sql_param).collect();
    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        params.iter().map(|p| p as &dyn rusqlite::types::ToSql).collect();

    conn.execute(&sql, param_refs.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn delete_rows(
    state: State<AppState>,
    db_id: String,
    table_name: String,
    primary_key_column: String,
    primary_key_values: Vec<serde_json::Value>,
) -> Result<u64, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;

    let placeholders: Vec<String> = (1..=primary_key_values.len())
        .map(|i| format!("?{}", i))
        .collect();

    let sql = format!(
        "DELETE FROM \"{}\" WHERE \"{}\" IN ({})",
        table_name,
        primary_key_column,
        placeholders.join(", ")
    );

    let params: Vec<SqlValue> = primary_key_values.iter().map(json_value_to_sql_param).collect();
    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        params.iter().map(|p| p as &dyn rusqlite::types::ToSql).collect();

    let affected = conn
        .execute(&sql, param_refs.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(affected as u64)
}

fn json_value_to_sql_param(val: &serde_json::Value) -> SqlValue {
    match val {
        serde_json::Value::Null => SqlValue::Null,
        serde_json::Value::Bool(b) => SqlValue::Integer(if *b { 1 } else { 0 }),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                SqlValue::Integer(i)
            } else if let Some(f) = n.as_f64() {
                SqlValue::Real(f)
            } else {
                SqlValue::Text(n.to_string())
            }
        }
        serde_json::Value::String(s) => SqlValue::Text(s.clone()),
        other => SqlValue::Text(other.to_string()),
    }
}
