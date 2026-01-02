use rusqlite::{params, Connection, Result, params_from_iter};
use serde::Serialize;
use regex::Regex;
use chrono::{Local, Datelike, Duration};

#[derive(Serialize, Clone)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub snippet: String,
}

#[derive(Serialize, Clone)]
pub struct SearchResultWithMetadata {
    pub results: Vec<SearchResult>,
    pub role_filter_applied: bool,
    pub role_filter_type: Option<String>,
    pub global_search_active: bool,
}

// Filter structures for advanced search
#[derive(Debug, Clone, PartialEq)]
pub enum SearchFilter {
    Tag(String),
    Created(String),
}

// Role-based filter configuration
#[derive(Debug, Clone, PartialEq)]
pub enum RoleFilter {
    Learner,
    Manager,
    Coach,
    None,
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

/// Search notes with optional role-based filtering
/// 
/// # Arguments
/// * `conn` - Database connection
/// * `query` - Search query string
/// * `role` - Optional role for role-based filtering ("learner", "manager", "coach")
/// * `global_search` - If true, bypass role-based filters
/// 
/// # Returns
/// * `Result<SearchResultWithMetadata>` - Search results with metadata about applied filters
pub fn search_notes(
    conn: &Connection, 
    query: &str,
    role: Option<&str>,
    global_search: bool,
) -> Result<SearchResultWithMetadata> {
    // Parse filters from query
    let (sanitized_query, filters) = parse_search_filters(query);
    
    // Sanitize search terms for FTS5
    // We keep only alphanumeric characters and spaces to prevent query injection/errors.
    let fts_query = sanitized_query.chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .trim()
        .to_string();

    if fts_query.is_empty() && filters.is_empty() {
        return Ok(SearchResultWithMetadata {
            results: Vec::new(),
            role_filter_applied: false,
            role_filter_type: None,
            global_search_active: global_search,
        });
    }

    // Build dynamic SQL query with filter conditions
    let mut where_clauses: Vec<String> = Vec::new();
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    let mut order_by_clause = String::from("rank");

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

    // Apply role-based filters (unless global_search is true)
    let mut role_filter_applied = false;
    let mut role_filter_type = None;
    
    if !global_search {
        if let Some(role_str) = role {
            match role_str.to_lowercase().as_str() {
                "learner" => {
                    // Exclude notes with #work tag
                    where_clauses.push(
                        "NOT EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE t.name = 'work' AND nt.note_id = notes.id)".to_string()
                    );
                    role_filter_applied = true;
                    role_filter_type = Some("learner".to_string());
                }
                "manager" => {
                    // Prioritize notes with #project tag
                    // Use CASE in ORDER BY to put project-tagged notes first
                    order_by_clause = String::from(
                        "CASE WHEN EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE t.name = 'project' AND nt.note_id = notes.id) THEN 0 ELSE 1 END, rank"
                    );
                    role_filter_applied = true;
                    role_filter_type = Some("manager".to_string());
                }
                "coach" => {
                    // Coach role: prioritize notes with #coaching or #template tags
                    order_by_clause = String::from(
                        "CASE WHEN EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE (t.name = 'coaching' OR t.name = 'template') AND nt.note_id = notes.id) THEN 0 ELSE 1 END, rank"
                    );
                    role_filter_applied = true;
                    role_filter_type = Some("coach".to_string());
                }
                _ => {
                    // Unknown role, no filtering
                }
            }
        }
    } else if global_search && role.is_some() {
        // Global search is active, but we still track what role is set
        role_filter_type = role.map(|s| s.to_string());
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
         ORDER BY {} 
         LIMIT 20",
        where_clause,
        order_by_clause
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

    Ok(SearchResultWithMetadata {
        results: list,
        role_filter_applied,
        role_filter_type,
        global_search_active: global_search,
    })
}

/// Legacy search function for backward compatibility
/// 
/// # Arguments
/// * `conn` - Database connection
/// * `query` - Search query string
/// 
/// # Returns
/// * `Result<Vec<SearchResult>>` - Search results without role filtering
pub fn search_notes_legacy(conn: &Connection, query: &str) -> Result<Vec<SearchResult>> {
    let result = search_notes(conn, query, None, true)?;
    Ok(result.results)
}

/// Get related notes based on note content keywords
/// For MVP: Extract top 5 keywords and search with FTS5
pub fn get_related_notes(
    conn: &Connection,
    note_content: String,
    current_note_id: String,
    limit: usize,
) -> Result<Vec<SearchResult>, String> {
    // Don't trigger search for empty notes
    if note_content.trim().is_empty() {
        return Ok(Vec::new());
    }

    // Extract keywords from note content
    // Split by whitespace, filter special chars, take top 5-10
    let keywords: Vec<String> = note_content
        .split_whitespace()
        .into_iter()
        .filter(|k| {
            // Remove special characters and keep meaningful words
            let cleaned = k.chars()
                .filter(|c| c.is_alphanumeric())
                .collect::<String>();
            !cleaned.is_empty() && cleaned.len() > 2
        })
        .take(5) // Take top 5 keywords for MVP
        .map(|k| k.to_string())
        .collect();

    if keywords.is_empty() {
        return Ok(Vec::new());
    }

    // Build FTS5 query with OR condition for multiple keywords
    let fts_query = keywords.join(" OR ");

    // Exclude current note from results
    let mut where_clauses = vec![
        "notes_fts MATCH ?".to_string(),
        format!("n.id != '{}'", current_note_id), // Safely exclude current note
    ];

    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = vec![
        Box::new(fts_query),
    ];

    // Build SQL query
    let sql = format!(
        "SELECT n.id, n.title, snippet(notes_fts, 1, '<mark>', '</mark>', '...', 10) as snippet
         FROM notes n
         JOIN notes_fts f ON n.internal_id = f.rowid
         WHERE {}
         ORDER BY rank
         LIMIT {}",
        where_clauses.join(" AND "),
        limit,
    );

    // Execute query
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
