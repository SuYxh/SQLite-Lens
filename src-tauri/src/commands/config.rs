use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub last_opened: String,
}

#[tauri::command]
pub fn get_config(app_handle: AppHandle) -> Result<serde_json::Value, String> {
    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    let config = store.get("config").unwrap_or(serde_json::Value::Null);
    Ok(config)
}

#[tauri::command]
pub fn set_config(app_handle: AppHandle, config: serde_json::Value) -> Result<(), String> {
    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    store.set("config", config);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_recent_files(app_handle: AppHandle) -> Result<Vec<RecentFile>, String> {
    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    let files = store
        .get("recent_files")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);
    Ok(files)
}

#[tauri::command]
pub fn add_recent_file(app_handle: AppHandle, file: RecentFile) -> Result<(), String> {
    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    let mut files: Vec<RecentFile> = store
        .get("recent_files")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(Vec::new);

    files.retain(|f| f.path != file.path);
    files.insert(0, file);
    files.truncate(20);

    store.set(
        "recent_files",
        serde_json::to_value(&files).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_recent_files(app_handle: AppHandle) -> Result<(), String> {
    let store = app_handle.store("config.json").map_err(|e| e.to_string())?;
    store.set(
        "recent_files",
        serde_json::to_value::<Vec<RecentFile>>(vec![]).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
