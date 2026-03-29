use crate::database::schema::SchemaReader;
use crate::database::types::{DatabaseInfo, SchemaInfo};
use crate::state::AppState;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn open_database(state: State<AppState>, file_path: String) -> Result<DatabaseInfo, String> {
    let id = Uuid::new_v4().to_string();
    let mut manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    manager.open(&id, &file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn close_database(state: State<AppState>, db_id: String) -> Result<(), String> {
    let mut manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    manager.close(&db_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_schema(state: State<AppState>, db_id: String) -> Result<SchemaInfo, String> {
    let manager = state.db_manager.lock().map_err(|e| e.to_string())?;
    let conn = manager.get(&db_id).map_err(|e| e.to_string())?;
    SchemaReader::read_schema(conn).map_err(|e| e.to_string())
}
