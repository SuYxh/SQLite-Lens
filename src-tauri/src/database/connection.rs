use crate::database::schema::SchemaReader;
use crate::database::types::DatabaseInfo;
use crate::error::{AppError, Result};
use chrono::Utc;
use rusqlite::Connection;
use std::collections::HashMap;
use std::path::Path;

pub struct DatabaseManager {
    connections: HashMap<String, Connection>,
}

impl DatabaseManager {
    pub fn new() -> Self {
        Self {
            connections: HashMap::new(),
        }
    }

    pub fn open(&mut self, id: &str, path: &str) -> Result<DatabaseInfo> {
        let conn = Connection::open(path)?;

        conn.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA cache_size=-64000;
             PRAGMA foreign_keys=ON;",
        )?;

        let schema = SchemaReader::read_schema(&conn)?;

        let file_path = Path::new(path);
        let file_name = file_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let file_size = std::fs::metadata(path)?.len();

        let info = DatabaseInfo {
            id: id.to_string(),
            file_path: path.to_string(),
            file_name,
            file_size,
            tables: schema.tables.len(),
            views: schema.views.len(),
            indexes: schema.indexes.len(),
            opened_at: Utc::now().to_rfc3339(),
        };

        self.connections.insert(id.to_string(), conn);

        Ok(info)
    }

    pub fn close(&mut self, id: &str) -> Result<()> {
        self.connections
            .remove(id)
            .ok_or_else(|| AppError::DatabaseNotFound(id.to_string()))?;
        Ok(())
    }

    pub fn get(&self, id: &str) -> Result<&Connection> {
        self.connections
            .get(id)
            .ok_or_else(|| AppError::DatabaseNotFound(id.to_string()))
    }
}
