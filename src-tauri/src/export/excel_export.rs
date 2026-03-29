use rusqlite::Connection;
use rust_xlsxwriter::{Format, Workbook};

pub struct ExcelExporter;

impl ExcelExporter {
    pub fn export(conn: &Connection, query: &str, path: &str) -> Result<usize, String> {
        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let columns: Vec<String> = stmt.column_names().iter().map(|n| n.to_string()).collect();

        let column_count = columns.len();

        let mut workbook = Workbook::new();
        let worksheet = workbook.add_worksheet();

        let bold_format = Format::new().set_bold();

        for (col_idx, col_name) in columns.iter().enumerate() {
            worksheet
                .write_string_with_format(0, col_idx as u16, col_name, &bold_format)
                .map_err(|e| e.to_string())?;

            let width = (col_name.len() as f64).clamp(8.0, 50.0);
            worksheet
                .set_column_width(col_idx as u16, width)
                .map_err(|e| e.to_string())?;
        }

        let rows = stmt
            .query_map([], |row| {
                let mut values = Vec::with_capacity(column_count);
                for i in 0..column_count {
                    let value = match row.get_ref(i) {
                        Ok(rusqlite::types::ValueRef::Null) => CellValue::Null,
                        Ok(rusqlite::types::ValueRef::Integer(i)) => CellValue::Number(i as f64),
                        Ok(rusqlite::types::ValueRef::Real(f)) => CellValue::Number(f),
                        Ok(rusqlite::types::ValueRef::Text(s)) => {
                            CellValue::Text(String::from_utf8_lossy(s).to_string())
                        }
                        Ok(rusqlite::types::ValueRef::Blob(b)) => {
                            CellValue::Text(format!("[BLOB: {} bytes]", b.len()))
                        }
                        Err(_) => CellValue::Null,
                    };
                    values.push(value);
                }
                Ok(values)
            })
            .map_err(|e| e.to_string())?;

        let mut row_idx = 1u32;
        for row_result in rows {
            let values = row_result.map_err(|e| e.to_string())?;
            for (col_idx, cell) in values.iter().enumerate() {
                match cell {
                    CellValue::Null => {}
                    CellValue::Number(n) => {
                        worksheet
                            .write_number(row_idx, col_idx as u16, *n)
                            .map_err(|e| e.to_string())?;
                    }
                    CellValue::Text(s) => {
                        worksheet
                            .write_string(row_idx, col_idx as u16, s)
                            .map_err(|e| e.to_string())?;
                    }
                }
            }
            row_idx += 1;
        }

        workbook.save(path).map_err(|e| e.to_string())?;

        Ok((row_idx - 1) as usize)
    }
}

enum CellValue {
    Null,
    Number(f64),
    Text(String),
}
