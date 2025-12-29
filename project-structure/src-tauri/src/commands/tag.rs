use tauri::State;
use std::sync::Arc;
use crate::models::{Tag, CreateTagRequest, UpdateNoteTagsRequest};
use crate::AppState;
use crate::services::TagService;

#[tauri::command]
pub async fn list_tags(state: State<'_, Arc<AppState>>) -> Result<Vec<Tag>, String> {
    state.tag_service
        .list_tags()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_tag(request: CreateTagRequest, state: State<'_, Arc<AppState>>) -> Result<Tag, String> {
    state.tag_service
        .create_tag(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_tag(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.tag_service
        .delete_tag(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note_tags(request: UpdateNoteTagsRequest, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.tag_service
        .update_note_tags(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_tag_to_note(note_id: String, tag_name: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    let tag_id = state.tag_service
        .get_or_create_tag(&tag_name, &now)
        .await
        .map_err(|e| e.to_string())?;
    
    state.tag_service
        .add_tag_to_note(&note_id, &tag_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_tag_from_note(note_id: String, tag_name: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    let tag_id = sqlx::query("SELECT id FROM tags WHERE name = ?")
        .bind(&tag_name)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Tag not found".to_string())?;
    
    state.tag_service
        .remove_tag_from_note(&note_id, &tag_id)
        .await
        .map_err(|e| e.to_string())
}
