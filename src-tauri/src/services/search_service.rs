use rusqlite::{params, Connection, Result, params_from_iter};
use serde::Serialize;
use regex::Regex;
use chrono::{Local, Datelike, Duration};

#[derive(Serialize)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub snippet: String,
}

// Filter structures for advanced search
#[derive(Debug, Clone, PartialEq)]
pub enum SearchFilter {
    Tag(String),
    Created(String),
}

pub fn parse_search_filters(query: &str) -> (String, Vec<SearchFilter>) {
    let mut search_terms = Vec::new();
    let mut filters = Vec::new();

    // Split by whitespace for parsing
    for term in query.split_whitespace() {
        if let Some((filter_type, filter_value)) = term.split_once(':') {
            match filter_type.to_lowercase().as_str() {
                "tag" => {
                    if !filter_value.is_empty() {
                        filters.push(SearchFilter::Tag(filter_value.to_string()));
                    }
                }
                "created" => {
                    if !filter_value.is_empty() {
                        filters.push(SearchFilter::Created(filter_value.to_string()));
                    }
                }
                _ => {
                    // Unknown filter type, treat as search term
                    search_terms.push(term.to_string());
                }
            }
        } else {
            // Not a filter, treat as search term
            search_terms.push(term.to_string());
        }
    }

    let cleaned_query = search_terms.join(" ");
    (cleaned_query, filters)
}

fn parse_date_filter(time_filter: &str) -> Option<String> {
    let now = Local::now();
    let cutoff_date = match time_filter.to_lowercase().as_str() {
        "today" => now - Duration::hours(24),
        "yesterday" => now - Duration::hours(48),
        "week" => now - Duration::days(7),
        "month" => now - Duration::days(30),
        _ => return None,
    };
    cutoff_date.map(|d| d.format("%Y-%m-%d %H:%M:%S").to_string())
}

pub fn search_notes(conn: &Connection, query: &str) -> Result<Vec<SearchResult>> {
    // Parse filters from query
    let (sanitized_query, filters) = parse_search_filters(query);
    
    // Sanitize the search terms for FTS5
    // We keep only alphanumeric characters and spaces to prevent query injection/errors.
    let fts_query = sanitized_query.chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .trim()
        .to_string();

    if fts_query.is_empty() && filters.is_empty() {
        return Ok(Vec::new());
    }

    // Build dynamic SQL query with filter conditions
    let mut where_clauses: Vec<String> = Vec::new();
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    // Add FTS5 match condition if we have search terms
    if !fts_query.is_empty() {
        where_clauses.push("notes_fts MATCH ?".to_string());
        // We search across all columns by default. 
        // SQLite FTS5 does not support leading wildcards (*term), only trailing (term*)
        let fts_query = format!("{}*", fts_query);
        query_params.push(Box::new(fts_query));
    }

    // Add tag filters
    for filter in &filters {
        match filter {
            SearchFilter::Tag(tag_name) => {
                where_clauses.push(
                    "EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE t.name LIKE ? AND nt.note_id = notes.id)".to_string()
                );
                query_params.push(Box::new(format!("%{}%", tag_name)));
            }
            SearchFilter::Created(time_filter) => {
                if let Some(date_cutoff) = parse_date_filter(time_filter) {
                    where_clauses.push("notes.created_at >= ?".to_string());
                    query_params.push(Box::new(date_cutoff));
                }
            }
        }
    }

    // Combine all WHERE clauses with AND
    let where_clause = if where_clauses.is_empty() {
        "1=1".to_string() // Always true if no filters
    } else {
        where_clauses.join(" AND ")
    };

    // Build the full query
    let sql = format!(
        "SELECT n.id, n.title, snippet(notes_fts, 1, '<mark>', '</mark>', '...', 10) 
         FROM notes n 
         JOIN notes_fts f ON n.internal_id = f.rowid 
         WHERE {}
         ORDER BY rank 
         LIMIT 20",
        where_clause
    );

    // Execute query with parameters
    let mut stmt = conn.prepare(&sql)?;
    let results = stmt.query_map(params_from_iter(query_params.iter().map(|p| p.as_str())), |row| {
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

#[cfg(test)]
mod tests;

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
