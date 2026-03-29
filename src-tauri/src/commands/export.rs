use crate::export::csv_export::CsvExporter;
use crate::export::excel_export::ExcelExporter;
use crate::export::json_export::JsonExporter;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn export_csv(
    state: State<AppState>,
    db_id: String,
    query: String,
    path: String,
    delimiter: Option<String>,
) -> Result<usize, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    let delim = delimiter.and_then(|d| d.as_bytes().first().copied());
    CsvExporter::export(conn, &query, &path, delim)
}

#[tauri::command]
pub fn export_json(
    state: State<AppState>,
    db_id: String,
    query: String,
    path: String,
    format: String,
) -> Result<usize, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    match format.as_str() {
        "array" => JsonExporter::export_array(conn, &query, &path),
        "records" => JsonExporter::export_records(conn, &query, &path),
        _ => Err(format!("Unknown format: {}. Use 'array' or 'records'.", format)),
    }
}

#[tauri::command]
pub fn export_excel(
    state: State<AppState>,
    db_id: String,
    query: String,
    path: String,
) -> Result<usize, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    ExcelExporter::export(conn, &query, &path)
}
