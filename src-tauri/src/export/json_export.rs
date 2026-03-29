use rusqlite::Connection;
use serde_json::{json, Map, Value};
use std::fs::File;
use std::io::Write;

pub struct JsonExporter;

impl JsonExporter {
    pub fn export_array(
        conn: &Connection,
        query: &str,
        path: &str,
    ) -> Result<usize, String> {
        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let columns: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|n| n.to_string())
            .collect();

        let column_count = columns.len();

        let rows = stmt
            .query_map([], |row| {
                let mut obj = Map::new();
                for i in 0..column_count {
                    let value = Self::sqlite_to_json(row.get_ref(i).ok());
                    obj.insert(columns[i].clone(), value);
                }
                Ok(Value::Object(obj))
            })
            .map_err(|e| e.to_string())?;

        let mut result = Vec::new();
        for row_result in rows {
            result.push(row_result.map_err(|e| e.to_string())?);
        }

        let row_count = result.len();
        let json_str =
            serde_json::to_string_pretty(&Value::Array(result)).map_err(|e| e.to_string())?;

        let mut file = File::create(path).map_err(|e| e.to_string())?;
        file.write_all(json_str.as_bytes())
            .map_err(|e| e.to_string())?;

        Ok(row_count)
    }

    pub fn export_records(
        conn: &Connection,
        query: &str,
        path: &str,
    ) -> Result<usize, String> {
        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let columns: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|n| n.to_string())
            .collect();

        let column_count = columns.len();

        let rows = stmt
            .query_map([], |row| {
                let mut values = Vec::with_capacity(column_count);
                for i in 0..column_count {
                    values.push(Self::sqlite_to_json(row.get_ref(i).ok()));
                }
                Ok(Value::Array(values))
            })
            .map_err(|e| e.to_string())?;

        let mut data = Vec::new();
        for row_result in rows {
            data.push(row_result.map_err(|e| e.to_string())?);
        }

        let row_count = data.len();
        let output = json!({
            "columns": columns,
            "data": data,
        });

        let json_str = serde_json::to_string_pretty(&output).map_err(|e| e.to_string())?;

        let mut file = File::create(path).map_err(|e| e.to_string())?;
        file.write_all(json_str.as_bytes())
            .map_err(|e| e.to_string())?;

        Ok(row_count)
    }

    fn sqlite_to_json(value: Option<rusqlite::types::ValueRef<'_>>) -> Value {
        match value {
            Some(rusqlite::types::ValueRef::Null) | None => Value::Null,
            Some(rusqlite::types::ValueRef::Integer(i)) => json!(i),
            Some(rusqlite::types::ValueRef::Real(f)) => json!(f),
            Some(rusqlite::types::ValueRef::Text(s)) => {
                Value::String(String::from_utf8_lossy(s).to_string())
            }
            Some(rusqlite::types::ValueRef::Blob(b)) => {
                Value::String(format!("[BLOB: {} bytes]", b.len()))
            }
        }
    }
}
