use sqlx::{Pool, Sqlite, Row};
use uuid::Uuid;
use chrono::Utc;
use crate::models::{Folder, CreateFolderRequest, UpdateFolderRequest};

pub struct FolderService {
    db: Pool<Sqlite>,
}

impl FolderService {
    pub fn new(db: Pool<Sqlite>) -> Self {
        Self { db }
    }

    pub async fn list_folders(&self) -> Result<Vec<Folder>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, name, parent_id, path, created_at FROM folders ORDER BY name"
        )
        .fetch_all(&self.db)
        .await?;

        let folders = rows.iter().map(|row| Folder {
            id: row.get("id"),
            name: row.get("name"),
            parent_id: row.get("parent_id"),
            path: row.get("path"),
            created_at: row.get("created_at"),
        }).collect();

        Ok(folders)
    }

    pub async fn create_folder(&self, request: CreateFolderRequest) -> Result<Folder, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        let path = if let Some(parent_id) = &request.parent_id {
            let parent_path = self.get_folder_path(parent_id).await?;
            format!("{}.{}", parent_path, request.name.to_lowercase().replace(" ", "_"))
        } else {
            Some(request.name.to_lowercase().replace(" ", "_"))
        };

        sqlx::query(
            "INSERT INTO folders (id, name, parent_id, path, created_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&request.name)
        .bind(&request.parent_id)
        .bind(&path)
        .bind(&now)
        .execute(&self.db)
        .await?;

        Ok(Folder {
            id,
            name: request.name,
            parent_id: request.parent_id,
            path,
            created_at: now,
        })
    }

    pub async fn update_folder(&self, id: &str, request: UpdateFolderRequest) -> Result<Folder, sqlx::Error> {
        let now = Utc::now().to_rfc3339();

        if let Some(name) = &request.name {
            sqlx::query("UPDATE folders SET name = ? WHERE id = ?")
                .bind(name)
                .bind(id)
                .execute(&self.db)
                .await?;
        }

        if let Some(parent_id) = &request.parent_id {
            let path = if let Some(pid) = parent_id {
                let parent_path = self.get_folder_path(pid).await?;
                let folder = self.get_folder(id).await?;
                format!("{}.{}", parent_path, folder.name.to_lowercase().replace(" ", "_"))
            } else {
                let folder = self.get_folder(id).await?;
                Some(folder.name.to_lowercase().replace(" ", "_"))
            };

            sqlx::query("UPDATE folders SET parent_id = ?, path = ? WHERE id = ?")
                .bind(parent_id)
                .bind(&path)
                .bind(id)
                .execute(&self.db)
                .await?;
        }

        self.get_folder(id).await
    }

    pub async fn delete_folder(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM folders WHERE id = ?")
            .bind(id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn get_folder(&self, id: &str) -> Result<Folder, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, name, parent_id, path, created_at FROM folders WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.db)
        .await?;

        row.map(|row| Folder {
            id: row.get("id"),
            name: row.get("name"),
            parent_id: row.get("parent_id"),
            path: row.get("path"),
            created_at: row.get("created_at"),
        }).ok_or_else(|| sqlx::Error::RowNotFound)
    }

    async fn get_folder_path(&self, folder_id: &str) -> Result<String, sqlx::Error> {
        let row = sqlx::query("SELECT path FROM folders WHERE id = ?")
            .bind(folder_id)
            .fetch_one(&self.db)
            .await?;
        Ok(row.get("path"))
    }
}
