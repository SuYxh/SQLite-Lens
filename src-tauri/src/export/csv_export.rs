use rusqlite::Connection;
use std::fs::File;
use std::io::Write;

pub struct CsvExporter;

impl CsvExporter {
    pub fn export(
        conn: &Connection,
        query: &str,
        path: &str,
        delimiter: Option<u8>,
    ) -> Result<usize, String> {
        let delim = delimiter.unwrap_or(b',') as char;
        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let columns: Vec<String> = stmt
            .column_names()
            .iter()
            .map(|n| n.to_string())
            .collect();

        let column_count = columns.len();

        let mut file = File::create(path).map_err(|e| e.to_string())?;

        let header_fields: Vec<String> = columns.iter().map(|c| Self::escape_field(c, delim)).collect();
        writeln!(file, "{}", header_fields.join(&delim.to_string())).map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                let mut values = Vec::with_capacity(column_count);
                for i in 0..column_count {
                    let value: String = match row.get_ref(i) {
                        Ok(rusqlite::types::ValueRef::Null) => String::new(),
                        Ok(rusqlite::types::ValueRef::Integer(i)) => i.to_string(),
                        Ok(rusqlite::types::ValueRef::Real(f)) => f.to_string(),
                        Ok(rusqlite::types::ValueRef::Text(s)) => {
                            String::from_utf8_lossy(s).to_string()
                        }
                        Ok(rusqlite::types::ValueRef::Blob(b)) => {
                            format!("[BLOB: {} bytes]", b.len())
                        }
                        Err(_) => String::new(),
                    };
                    values.push(value);
                }
                Ok(values)
            })
            .map_err(|e| e.to_string())?;

        let mut row_count = 0usize;
        for row_result in rows {
            let values = row_result.map_err(|e| e.to_string())?;
            let fields: Vec<String> = values.iter().map(|v| Self::escape_field(v, delim)).collect();
            writeln!(file, "{}", fields.join(&delim.to_string())).map_err(|e| e.to_string())?;
            row_count += 1;
        }

        Ok(row_count)
    }

    fn escape_field(value: &str, delimiter: char) -> String {
        if value.contains(delimiter)
            || value.contains('\n')
            || value.contains('\r')
            || value.contains('"')
        {
            let escaped = value.replace('"', "\"\"");
            format!("\"{}\"", escaped)
        } else {
            value.to_string()
        }
    }
}
