use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub snippet: String,
}

    // We sanitize the query for FTS5.
    // We keep only alphanumeric characters and spaces to prevent query injection/errors.
    let sanitized_query = query.chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .trim()
        .to_string();

    if sanitized_query.is_empty() {
        return Ok(Vec::new());
    }

    // FTS5 Match Query
    // We join with notes to get the UUID 'id' using rowid/internal_id
    // We use snippet() on the content column (index 1 in notes_fts)
    let mut stmt = conn.prepare(
        "SELECT n.id, n.title, snippet(notes_fts, 1, '<mark>', '</mark>', '...', 10) 
         FROM notes n 
         JOIN notes_fts f ON n.internal_id = f.rowid 
         WHERE notes_fts MATCH ? 
         ORDER BY rank 
         LIMIT 20"
    )?;

    // We search across all columns by default. 
    // SQLite FTS5 does not support leading wildcards (*term), only trailing (term*)
    let fts_query = format!("{}*", sanitized_query);
    
    let results = stmt.query_map(params![fts_query], |row| {
        Ok(SearchResult {
            id: row.get(0)?,
            title: row.get(1)?,
            snippet: row.get(2)?,
        })
    })?;

    let mut list = Vec::new();
    for res in results {
        list.push(res?);
    }

    Ok(list)
}
