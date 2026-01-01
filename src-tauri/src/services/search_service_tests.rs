#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;
    use tempfile::tempdir;
    use std::path::PathBuf;

    fn setup_test_db() -> Connection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let conn = Connection::open(db_path.to_str().unwrap()).unwrap();
        
        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                folder_id TEXT,
                is_daily_note BOOLEAN DEFAULT FALSE,
                properties TEXT,
                word_count INTEGER DEFAULT 0,
                reading_time INTEGER DEFAULT 0
            )",
            [],
        ).unwrap();
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        ).unwrap();
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )",
            [],
        ).unwrap();
        
        conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                    title,
                    content,
                    tags,
                    properties,
                    content='notes',
                    content_rowid='internal_id'
                )",
            [],
        ).unwrap();
        
        // Create triggers
        conn.execute_batch("
            CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
              INSERT INTO notes_fts(rowid, title, content, properties) 
              VALUES (new.internal_id, new.title, new.content, new.properties);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
              INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
              VALUES('delete', old.internal_id, old.title, old.content, old.properties);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
              INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
              VALUES('delete', old.internal_id, old.title, old.content, old.properties);
              INSERT INTO notes_fts(rowid, title, content, properties) 
              VALUES (new.internal_id, new.title, new.content, new.properties);
            END;
        ")?;
        
        conn
    }

    #[test]
    fn test_parse_search_filters_tag_only() {
        let query = "tag:work";
        let (search_query, filters) = parse_search_filters(query);
        
        assert!(search_query.is_empty(), "Search query should be empty with tag filter only");
        assert_eq!(filters.len(), 1, "Should have 1 filter");
        assert_eq!(filters[0], SearchFilter::Tag("work".to_string()));
    }

    #[test]
    fn test_parse_search_filters_created_only() {
        let query = "created:today";
        let (search_query, filters) = parse_search_filters(query);
        
        assert!(search_query.is_empty(), "Search query should be empty with created filter only");
        assert_eq!(filters.len(), 1, "Should have 1 filter");
        assert_eq!(filters[0], SearchFilter::Created("today".to_string()));
    }

    #[test]
    fn test_parse_search_filters_multiple_filters() {
        let query = "tag:work created:week";
        let (search_query, filters) = parse_search_filters(query);
        
        assert!(search_query.is_empty(), "Search query should be empty with filters only");
        assert_eq!(filters.len(), 2, "Should have 2 filters");
        assert_eq!(filters[0], SearchFilter::Tag("work".to_string()));
        assert_eq!(filters[1], SearchFilter::Created("week".to_string()));
    }

    #[test]
    fn test_parse_search_filters_mixed_query_and_filters() {
        let query = "important tag:work";
        let (search_query, filters) = parse_search_filters(query);
        
        assert_eq!(search_query, "important", "Search query should contain search term");
        assert_eq!(filters.len(), 1, "Should have 1 filter");
        assert_eq!(filters[0], SearchFilter::Tag("work".to_string()));
    }

    #[test]
    fn test_parse_search_filters_no_filters() {
        let query = "test query without filters";
        let (search_query, filters) = parse_search_filters(query);
        
        assert_eq!(search_query, "test query without filters", "Search query should be preserved");
        assert_eq!(filters.len(), 0, "Should have 0 filters");
    }

    #[test]
    fn test_parse_date_filter_today() {
        let date_str = "today";
        let result = parse_date_filter(date_str);
        
        assert!(result.is_some(), "Should parse 'today' date");
        let cutoff = result.unwrap();
        assert!(cutoff.contains("-"), "Date should be formatted");
    }

    #[test]
    fn test_parse_date_filter_yesterday() {
        let date_str = "yesterday";
        let result = parse_date_filter(date_str);
        
        assert!(result.is_some(), "Should parse 'yesterday' date");
    }

    #[test]
    fn test_parse_date_filter_invalid() {
        let date_str = "invalid";
        let result = parse_date_filter(date_str);
        
        assert!(result.is_none(), "Should return None for invalid date");
    }

    #[test]
    fn test_search_notes_with_tag_filter() {
        let conn = setup_test_db();
        
        // Create test notes with tags
        conn.execute(
            "INSERT INTO notes (id, title, content) VALUES (?1, ?2, ?3)",
            ["note1", "Work Note", "Content 1"]
        ).unwrap();
        conn.execute(
            "INSERT INTO tags (id, name) VALUES (?1, ?2)",
            ["tag1", "work"]
        ).unwrap();
        conn.execute(
            "INSERT INTO tags (id, name) VALUES (?1, ?2)",
            ["tag2", "personal"]
        ).unwrap();
        conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
            ["note1", "tag1"]
        ).unwrap();
        
        // Note with different tag
        conn.execute(
            "INSERT INTO notes (id, title, content) VALUES (?1, ?2, ?3)",
            ["note2", "Personal Note", "Content 2"]
        ).unwrap();
        conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
            ["note2", "tag2"]
        ).unwrap();
        
        // Wait for FTS trigger
        std::thread::sleep(std::time::Duration::from_millis(100));
        
        // Search with tag filter
        let results = search_notes(&conn, "tag:work").unwrap();
        assert_eq!(results.len(), 1, "Should find 1 note with 'work' tag");
        assert_eq!(results[0].id, "note1");
    }

    #[test]
    fn test_search_notes_with_multiple_filters() {
        let conn = setup_test_db();
        
        // Create note with 'work' tag
        conn.execute(
            "INSERT INTO notes (id, title, content, created_at) VALUES (?1, ?2, ?3, datetime('now', '-2 days'))",
            ["note1", "Recent Work Note", "Content 1"]
        ).unwrap();
        conn.execute(
            "INSERT INTO tags (id, name) VALUES (?1, ?2)",
            ["tag1", "work"]
        ).unwrap();
        conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
            ["note1", "tag1"]
        ).unwrap();
        
        // Create old note with 'work' tag
        conn.execute(
            "INSERT INTO notes (id, title, content, created_at) VALUES (?1, ?2, ?3, datetime('now', '-10 days'))",
            ["note2", "Old Work Note", "Content 2"]
        ).unwrap();
        conn.execute(
            "INSERT INTO tags (id, name) VALUES (?1, ?2)",
            ["tag2", "work"]
        ).unwrap();
        conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
            ["note2", "tag2"]
        ).unwrap();
        
        // Wait for FTS trigger
        std::thread::sleep(std::time::Duration::from_millis(100));
        
        // Search with tag + created filters
        let results = search_notes(&conn, "tag:work created:week").unwrap();
        assert_eq!(results.len(), 1, "Should find 1 recent note with 'work' tag");
        assert_eq!(results[0].id, "note1");
    }
}
