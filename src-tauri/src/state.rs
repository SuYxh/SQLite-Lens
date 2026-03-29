use crate::ai::AiProviderConfig;
use crate::database::connection::DatabaseManager;
use std::sync::Mutex;

pub struct AppState {
    pub db_manager: Mutex<DatabaseManager>,
    pub ai_config: Mutex<Option<AiProviderConfig>>,
}
