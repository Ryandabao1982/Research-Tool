use sqlx::{Pool, Sqlite, Row};
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Tag, CreateTagRequest, UpdateNoteTagsRequest};

pub struct TagService {
    db: Pool<Sqlite>,
}

impl TagService {
    pub fn new(db: Pool<Sqlite>) -> Self {
        Self { db }
    }

    pub async fn list_tags(&self) -> Result<Vec<Tag>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, name, color, created_at FROM tags ORDER BY name"
        )
        .fetch_all(&self.db)
        .await?;

        let tags = rows.iter().map(|row| Tag {
            id: row.get("id"),
            name: row.get("name"),
            color: row.get("color"),
            created_at: row.get("created_at"),
        }).collect();

        Ok(tags)
    }

    pub async fn create_tag(&self, request: CreateTagRequest) -> Result<Tag, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query("INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)")
            .bind(&id)
            .bind(&request.name)
            .bind(&request.color)
            .bind(&now)
            .execute(&self.db)
            .await?;

        Ok(Tag {
            id,
            name: request.name,
            color: request.color,
            created_at: now,
        })
    }

    pub async fn delete_tag(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM tags WHERE id = ?")
            .bind(id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn add_tag_to_note(&self, note_id: &str, tag_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)")
            .bind(note_id)
            .bind(tag_id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn remove_tag_from_note(&self, note_id: &str, tag_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?")
            .bind(note_id)
            .bind(tag_id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn update_note_tags(&self, request: UpdateNoteTagsRequest) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM note_tags WHERE note_id = ?")
            .bind(&request.note_id)
            .execute(&self.db)
            .await?;

        for tag_id in request.tag_ids {
            sqlx::query("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)")
                .bind(&request.note_id)
                .bind(&tag_id)
                .execute(&self.db)
                .await?;
        }

        Ok(())
    }

    pub async fn get_note_tags(&self, note_id: &str) -> Result<Vec<String>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT t.name FROM tags t
             JOIN note_tags nt ON t.id = nt.tag_id
             WHERE nt.note_id = ?"
        )
        .bind(note_id)
        .fetch_all(&self.db)
        .await?;

        let tags = rows.iter().map(|row| row.get("name")).collect();
        Ok(tags)
    }

    pub async fn get_or_create_tag(&self, tag_name: &str, created_at: &str) -> Result<String, sqlx::Error> {
        let tag_row = sqlx::query("SELECT id FROM tags WHERE name = ?")
            .bind(tag_name)
            .fetch_optional(&self.db)
            .await?;

        if let Some(row) = tag_row {
            Ok(row.get("id"))
        } else {
            let id = Uuid::new_v4().to_string();
            sqlx::query("INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)")
                .bind(&id)
                .bind(tag_name)
                .bind(created_at)
                .execute(&self.db)
                .await?;
            Ok(id)
        }
    }
}
