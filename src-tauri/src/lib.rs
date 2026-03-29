mod ai;
mod commands;
mod config;
mod database;
mod error;
mod export;
mod state;

use state::AppState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            db_manager: Mutex::new(database::connection::DatabaseManager::new()),
            ai_config: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            commands::database::open_database,
            commands::database::close_database,
            commands::database::get_schema,
            commands::query::execute_query,
            commands::query::get_table_data,
            commands::config::get_config,
            commands::config::set_config,
            commands::config::get_recent_files,
            commands::config::add_recent_file,
            commands::config::clear_recent_files,
            commands::ai::get_builtin_platforms_cmd,
            commands::ai::ai_test_connection,
            commands::ai::ai_generate_sql,
            commands::ai::ai_explain_sql,
            commands::ai::ai_fix_error,
            commands::ai::save_ai_config,
            commands::ai::get_ai_config,
            commands::ai::ai_optimize_sql,
            commands::ai::explain_query,
            commands::ai::ai_analyze_table,
            commands::ai::ai_data_qa,
            commands::ai::ai_summarize_results,
            commands::export::export_csv,
            commands::export::export_json,
            commands::export::export_excel,
            commands::query::update_cell,
            commands::query::insert_row,
            commands::query::delete_rows,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
