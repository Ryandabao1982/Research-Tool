use sqlx::{Pool, Sqlite, Row};
use crate::models::SearchResult;

pub struct SearchService {
    db: Pool<Sqlite>,
}

impl SearchService {
    pub fn new(db: Pool<Sqlite>) -> Self {
        Self { db }
    }

    pub async fn search_notes(&self, query: &str) -> Result<Vec<SearchResult>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT note_id, title, snippet(notes_fts, 2, '<mark>', '</mark>', '...', 20) as content_snippet, 
                    bm25(notes_fts) as rank
             FROM notes_fts
             WHERE notes_fts MATCH ?
             ORDER BY rank
             LIMIT 20"
        )
        .bind(query)
        .fetch_all(&self.db)
        .await?;

        let results = rows.iter().map(|row| SearchResult {
            note_id: row.get("note_id"),
            title: row.get("title"),
            content_snippet: row.get("content_snippet"),
            relevance_score: row.get::<f64, _>("rank"),
        }).collect();

        Ok(results)
    }

    pub async fn search_in_folder(&self, folder_id: &str, query: &str) -> Result<Vec<SearchResult>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT fts.note_id, fts.title, snippet(fts, 2, '<mark>', '</mark>', '...', 20) as content_snippet, 
                    bm25(fts) as rank
             FROM notes_fts fts
             JOIN notes n ON fts.note_id = n.id
             WHERE fts MATCH ? AND n.folder_id = ?
             ORDER BY rank
             LIMIT 20"
        )
        .bind(query)
        .bind(folder_id)
        .fetch_all(&self.db)
        .await?;

        let results = rows.iter().map(|row| SearchResult {
            note_id: row.get("note_id"),
            title: row.get("title"),
            content_snippet: row.get("content_snippet"),
            relevance_score: row.get::<f64, _>("rank"),
        }).collect();

        Ok(results)
    }

    pub async fn search_by_tag(&self, tag_name: &str, query: &str) -> Result<Vec<SearchResult>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT fts.note_id, fts.title, snippet(fts, 2, '<mark>', '</mark>', '...', 20) as content_snippet, 
                    bm25(fts) as rank
             FROM notes_fts fts
             JOIN notes n ON fts.note_id = n.id
             JOIN note_tags nt ON n.id = nt.note_id
             JOIN tags t ON nt.tag_id = t.id
             WHERE fts MATCH ? AND t.name = ?
             ORDER BY rank
             LIMIT 20"
        )
        .bind(query)
        .bind(tag_name)
        .fetch_all(&self.db)
        .await?;

        let results = rows.iter().map(|row| SearchResult {
            note_id: row.get("note_id"),
            title: row.get("title"),
            content_snippet: row.get("content_snippet"),
            relevance_score: row.get::<f64, _>("rank"),
        }).collect();

        Ok(results)
    }

    pub async fn get_search_suggestions(&self, query: &str, limit: u32) -> Result<Vec<String>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT DISTINCT title 
             FROM notes_fts 
             WHERE title MATCH ? || '*'
             LIMIT ?"
        )
        .bind(query)
        .bind(limit as i64)
        .fetch_all(&self.db)
        .await?;

        let suggestions = rows.iter().map(|row| row.get::<String, _>("title")).collect();
        Ok(suggestions)
    }

    pub async fn get_all_notes_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM notes")
            .fetch_one(&self.db)
            .await?;
        Ok(row.get("count"))
    }

    pub async fn get_recent_notes(&self, limit: u32) -> Result<Vec<crate::models::Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at 
             FROM notes ORDER BY updated_at DESC LIMIT ?"
        )
        .bind(limit as i64)
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let note_id: String = row.get("id");

            let tag_rows = sqlx::query(
                "SELECT t.name FROM tags t 
                 JOIN note_tags nt ON t.id = nt.tag_id 
                 WHERE nt.note_id = ?"
            )
            .bind(&note_id)
            .fetch_all(&self.db)
            .await?;

            let tags: Vec<String> = tag_rows.iter().map(|r| r.get("name")).collect();

            notes.push(crate::models::Note {
                id: note_id,
                title: row.get("title"),
                content: row.get("content"),
                tags,
                folder_id: row.get("folder_id"),
                is_daily_note: row.get::<i32, _>("is_daily_note") != 0,
                word_count: row.get("word_count"),
                reading_time: row.get("reading_time"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            });
        }
        Ok(notes)
    }
}
