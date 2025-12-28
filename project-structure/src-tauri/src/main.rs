#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Pool, Sqlite, Row};
use std::sync::Arc;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub folder_id: Option<String>,
    pub is_daily_note: bool,
    pub word_count: i32,
    pub reading_time: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteRequest {
    pub title: String,
    pub content: String,
    pub tags: Option<Vec<String>>,
    pub folder_id: Option<String>,
}

pub struct AppState {
    db: Pool<Sqlite>,
}

#[tauri::command]
async fn list_notes(state: State<'_, Arc<AppState>>) -> Result<Vec<Note>, String> {
    let rows = sqlx::query(
        "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at FROM notes"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let mut notes = Vec::new();
    for row in rows {
        notes.push(Note {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            tags: vec![],
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

#[tauri::command]
async fn get_note(id: String, state: State<'_, Arc<AppState>>) -> Result<Option<Note>, String> {
    let row = sqlx::query(
        "SELECT id, title, content, folder_id, is_daily_note, word_count, reading_time, created_at, updated_at FROM notes WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    match row {
        Some(row) => Ok(Some(Note {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            tags: vec![],
            folder_id: row.get("folder_id"),
            is_daily_note: row.get::<i32, _>("is_daily_note") != 0,
            word_count: row.get("word_count"),
            reading_time: row.get("reading_time"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })),
        None => Ok(None),
    }
}

#[tauri::command]
async fn create_note(request: CreateNoteRequest, state: State<'_, Arc<AppState>>) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let word_count = request.content.split_whitespace().count() as i32;
    let reading_time = (word_count as f32 / 200.0).ceil() as i32;

    sqlx::query(
        "INSERT INTO notes (id, title, content, folder_id, word_count, reading_time, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&request.title)
    .bind(&request.content)
    .bind(&request.folder_id)
    .bind(word_count)
    .bind(reading_time)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

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

#[tauri::command]
async fn update_note(id: String, title: Option<String>, content: Option<String>, state: State<'_, Arc<AppState>>) -> Result<Note, String> {
    let now = Utc::now().to_rfc3339();
    
    if let Some(t) = title {
        sqlx::query("UPDATE notes SET title = ?, updated_at = ? WHERE id = ?")
            .bind(t)
            .bind(&now)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    if let Some(c) = content {
        let word_count = c.split_whitespace().count() as i32;
        let reading_time = (word_count as f32 / 200.0).ceil() as i32;
        sqlx::query("UPDATE notes SET content = ?, word_count = ?, reading_time = ?, updated_at = ? WHERE id = ?")
            .bind(c)
            .bind(word_count)
            .bind(reading_time)
            .bind(&now)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }

    let note = get_note(id, state).await?.ok_or("Note not found after update")?;
    Ok(note)
}

#[tauri::command]
async fn delete_note(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    sqlx::query("DELETE FROM notes WHERE id = ?")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let database_url = "sqlite:knowledge_base.db?mode=rwc";
    let db = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    // Run migrations
    sqlx::query(include_str!("../migrations/001_initial_schema.sql"))
        .execute(&db)
        .await?;

    let state = Arc::new(AppState { db });

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            list_notes,
            get_note,
            create_note,
            update_note,
            delete_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
