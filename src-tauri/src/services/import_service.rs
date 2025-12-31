use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;
use gray_matter::Matter;
use gray_matter::engine::YAML;
use uuid::Uuid;
use chrono::Utc;

pub fn import_files(conn: &Connection, import_path: &Path) -> Result<usize> {
    let mut imported_count = 0;
    let matter = Matter::<YAML>::new();

    for entry in WalkDir::new(import_path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() && entry.path().extension().map_or(false, |ext| ext == "md") {
            let content = fs::read_to_string(entry.path()).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let result = matter.parse(&content);

            let title = entry.file_name().to_string_lossy().to_string().replace(".md", "");
            let body = result.content;
            
            let id = if let Some(data) = result.data {
                data.as_hashmap()
                    .and_then(|h| h.get("id"))
                    .and_then(|v| v.as_string())
                    .unwrap_or_else(|| Uuid::new_v4().to_string())
            } else {
                Uuid::new_v4().to_string()
            };

            let now = Utc::now().to_rfc3339();

            conn.execute(
                "INSERT OR IGNORE INTO notes (id, title, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![id, title, body, now, now],
            )?;
            imported_count += 1;
        }
    }

    Ok(imported_count)
}
