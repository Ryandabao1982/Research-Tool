use sqlx::{Pool, Sqlite};
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Note, CreateNoteRequest, UpdateNoteRequest};
use crate::services::tag_service::TagService;

pub struct NoteService {
    db: Pool<Sqlite>,
    tag_service: TagService,
}

impl NoteService {
    pub fn new(db: Pool<Sqlite>, tag_service: TagService) -> Self {
        Self { db, tag_service }
    }

    pub async fn list_notes(&self) -> Result<Vec<Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at 
             FROM notes ORDER BY updated_at DESC"
        )
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let note_id: String = row.get("id");
            let tags = self.tag_service.get_note_tags(&note_id).await?;

            notes.push(Note {
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

    pub async fn get_note(&self, id: &str) -> Result<Option<Note>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at 
             FROM notes WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await?;

        if let Some(row) = row {
            let tags = self.tag_service.get_note_tags(id).await?;

            Ok(Some(Note {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                tags,
                folder_id: row.get("folder_id"),
                is_daily_note: row.get::<i32, _>("is_daily_note") != 0,
                word_count: row.get("word_count"),
                reading_time: row.get("reading_time"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn create_note(&self, request: CreateNoteRequest) -> Result<Note, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let word_count = Self::calculate_word_count(&request.content);
        let reading_time = Self::calculate_reading_time(word_count);

        sqlx::query(
            "INSERT INTO notes (id, title, content, folder_id, word_count, reading_time, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&request.title)
        .bind(&request.content)
        .bind(&request.folder_id)
        .bind(word_count)
        .bind(reading_time)
        .bind(&now)
        .bind(&now)
        .execute(&self.db)
        .await?;

        if let Some(tags) = &request.tags {
            for tag_name in tags {
                let tag_id = self.tag_service.get_or_create_tag(tag_name, &now).await?;
                self.tag_service.add_tag_to_note(&id, &tag_id).await?;
            }
        }

        Ok(Note {
            id,
            title: request.title,
            content: request.content,
            tags: request.tags.unwrap_or_default(),
            folder_id: request.folder_id,
            is_daily_note: false,
            word_count,
            reading_time,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub async fn update_note(&self, id: &str, request: UpdateNoteRequest) -> Result<Note, sqlx::Error> {
        let now = Utc::now().to_rfc3339();

        if let Some(title) = &request.title {
            sqlx::query("UPDATE notes SET title = ?, updated_at = ? WHERE id = ?")
                .bind(title)
                .bind(&now)
                .bind(id)
                .execute(&self.db)
                .await?;
        }

        if let Some(content) = &request.content {
            let word_count = Self::calculate_word_count(content);
            let reading_time = Self::calculate_reading_time(word_count);
            sqlx::query("UPDATE notes SET content = ?, word_count = ?, reading_time = ?, updated_at = ? WHERE id = ?")
                .bind(content)
                .bind(word_count)
                .bind(reading_time)
                .bind(&now)
                .bind(id)
                .execute(&self.db)
                .await?;

            if let Some(tags) = &request.tags {
                for tag_name in tags {
                    let tag_id = self.tag_service.get_or_create_tag(tag_name, &now).await?;
                    self.tag_service.add_tag_to_note(id, &tag_id).await?;
                }
            }
        }

        if let Some(folder_id) = &request.folder_id {
            sqlx::query("UPDATE notes SET folder_id = ?, updated_at = ? WHERE id = ?")
                .bind(folder_id)
                .bind(&now)
                .bind(id)
                .execute(&self.db)
                .await?;
        }

        self.get_note(id).await?.ok_or_else(|| sqlx::Error::RowNotFound)
    }

    pub async fn delete_note(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM notes WHERE id = ?")
            .bind(id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn get_notes_by_folder(&self, folder_id: &str) -> Result<Vec<Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at 
             FROM notes WHERE folder_id = ? ORDER BY updated_at DESC"
        )
        .bind(folder_id)
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let note_id: String = row.get("id");
            let tags = self.tag_service.get_note_tags(&note_id).await?;

            notes.push(Note {
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

    pub async fn get_notes_by_tag(&self, tag_name: &str) -> Result<Vec<Note>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT n.id, n.title, n.content, n.folder_id, n.is_daily_note, n.word_count, n.reading_time, 
                    n.created_at, n.updated_at 
             FROM notes n
              JOIN note_tags nt ON n.id = nt.note_id
              JOIN tags t ON nt.tag_id = t.id
              WHERE t.name = ?
              ORDER BY n.updated_at DESC"
        )
        .bind(tag_name)
        .fetch_all(&self.db)
        .await?;

        let mut notes = Vec::new();
        for row in rows {
            let note_id: String = row.get("id");
            let tags = self.tag_service.get_note_tags(&note_id).await?;

            notes.push(Note {
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

    pub async fn find_by_title(&self, title: &str) -> Result<Option<Note>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at 
             FROM notes WHERE title = ?"
        )
        .bind(title)
        .fetch_optional(&self.db)
        .await?;

        if let Some(row) = row {
            let id: String = row.get("id");
            let tags = self.tag_service.get_note_tags(&id).await?;

            Ok(Some(Note {
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
            }))
        } else {
            Ok(None)
        }
    }

    fn calculate_word_count(content: &str) -> i32 {
        content.split_whitespace().count() as i32
    }

    fn calculate_reading_time(word_count: i32) -> i32 {
        (word_count as f32 / 200.0).ceil() as i32
    }
}
