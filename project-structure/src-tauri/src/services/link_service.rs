use sqlx::{Pool, Sqlite, Row};
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Link, CreateLinkRequest};
use crate::services::link_parser::LinkParser;
use crate::services::note_service::NoteService;

pub struct LinkService {
    db: Pool<Sqlite>,
    note_service: NoteService,
    link_parser: LinkParser,
}

impl LinkService {
    pub fn new(db: Pool<Sqlite>, note_service: NoteService) -> Self {
        Self { 
            db, 
            note_service,
            link_parser: LinkParser::new(),
        }
    }

    pub async fn list_links(&self) -> Result<Vec<Link>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, source_note_id, target_note_id, source_block_id, target_block_id, link_type, created_at 
             FROM links"
        )
        .fetch_all(&self.db)
        .await?;

        let links = rows.iter().map(|row| Link {
            id: row.get("id"),
            source_note_id: row.get("source_note_id"),
            target_note_id: row.get("target_note_id"),
            source_block_id: row.get("source_block_id"),
            target_block_id: row.get("target_block_id"),
            link_type: row.get("link_type"),
            created_at: row.get("created_at"),
        }).collect();

        Ok(links)
    }

    pub async fn create_link(&self, request: CreateLinkRequest) -> Result<Link, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let link_type = request.link_type.unwrap_or_else(|| "wikilink".to_string());

        sqlx::query(
            "INSERT INTO links (id, source_note_id, target_note_id, source_block_id, target_block_id, link_type, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&request.source_note_id)
        .bind(&request.target_note_id)
        .bind(&request.source_block_id)
        .bind(&request.target_block_id)
        .bind(&link_type)
        .bind(&now)
        .execute(&self.db)
        .await?;

        Ok(Link {
            id,
            source_note_id: request.source_note_id,
            target_note_id: request.target_note_id,
            source_block_id: request.source_block_id,
            target_block_id: request.target_block_id,
            link_type,
            created_at: now,
        })
    }

    pub async fn delete_link(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM links WHERE id = ?")
            .bind(id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn get_backlinks(&self, note_id: &str) -> Result<Vec<crate::models::Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT n.id, n.title, n.content, n.folder_id, n.is_daily_note, n.word_count, n.reading_time, 
                    n.created_at, n.updated_at
             FROM notes n
             JOIN links l ON n.id = l.source_note_id
             WHERE l.target_note_id = ?
             ORDER BY n.updated_at DESC"
        )
        .bind(note_id)
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let id: String = row.get("id");

            let tag_rows = sqlx::query(
                "SELECT t.name FROM tags t 
                 JOIN note_tags nt ON t.id = nt.tag_id 
                 WHERE nt.note_id = ?"
            )
            .bind(&id)
            .fetch_all(&self.db)
            .await?;

            let tags: Vec<String> = tag_rows.iter().map(|r| r.get("name")).collect();

            notes.push(crate::models::Note {
                id,
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

    pub async fn get_forward_links(&self, note_id: &str) -> Result<Vec<crate::models::Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT n.id, n.title, n.content, n.folder_id, n.is_daily_note, n.word_count, n.reading_time, 
                    n.created_at, n.updated_at
             FROM notes n
             JOIN links l ON n.id = l.target_note_id
             WHERE l.source_note_id = ?
             ORDER BY n.updated_at DESC"
        )
        .bind(note_id)
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let id: String = row.get("id");

            let tag_rows = sqlx::query(
                "SELECT t.name FROM tags t 
                 JOIN note_tags nt ON t.id = nt.tag_id 
                 WHERE nt.note_id = ?"
            )
            .bind(&id)
            .fetch_all(&self.db)
            .await?;

            let tags: Vec<String> = tag_rows.iter().map(|r| r.get("name")).collect();

            notes.push(crate::models::Note {
                id,
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

    pub async fn parse_and_create_links(&self, note_id: &str, content: &str) -> Result<Vec<Link>, sqlx::Error> {
        let wikilinks = self.link_parser.extract_wikilinks(content);
        let mut created_links = Vec::new();

        for link_text in wikilinks {
            let (target_title, _) = self.link_parser.parse_link_text(&link_text);
            
            if let Some(target_note) = self.note_service.find_by_title(&target_title).await? {
                let link = self.create_link(CreateLinkRequest {
                    source_note_id: note_id.to_string(),
                    target_note_id: target_note.id,
                    source_block_id: None,
                    target_block_id: None,
                    link_type: Some("wikilink".to_string()),
                }).await?;
                created_links.push(link);
            }
        }

        Ok(created_links)
    }

    pub async fn get_link_count(&self, note_id: &str) -> Result<i64, sqlx::Error> {
        let row = sqlx::query(
            "SELECT 
                (SELECT COUNT(*) FROM links WHERE source_note_id = ?) as forward_links,
                (SELECT COUNT(*) FROM links WHERE target_note_id = ?) as backlinks"
        )
        .bind(note_id)
        .bind(note_id)
        .fetch_one(&self.db)
        .await?;

        let forward: i64 = row.get("forward_links");
        let backlinks: i64 = row.get("backlinks");
        Ok(forward + backlinks)
    }
}
