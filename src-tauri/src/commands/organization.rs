use tauri::State;
use crate::services::{db_service, organization_service};
use crate::services::organization_service::{Folder, Tag};

#[tauri::command]
pub async fn create_folder(
    state: State<'_, db_service::DbState>,
    name: String,
    parent_id: Option<String>,
) -> Result<Folder, String> {
    let conn = state.0.lock().unwrap();
    organization_service::create_folder(&conn, &name, parent_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_folders(
    state: State<'_, db_service::DbState>,
) -> Result<Vec<Folder>, String> {
    let conn = state.0.lock().unwrap();
    organization_service::get_folders(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note_folder(
    state: State<'_, db_service::DbState>,
    note_id: String,
    folder_id: Option<String>,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    organization_service::update_note_folder(&conn, &note_id, folder_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_tag(
    state: State<'_, db_service::DbState>,
    name: String,
) -> Result<Tag, String> {
    let conn = state.0.lock().unwrap();
    organization_service::create_tag(&conn, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn link_tag_to_note(
    state: State<'_, db_service::DbState>,
    note_id: String,
    tag_id: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    organization_service::link_tag_to_note(&conn, &note_id, &tag_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_note_tags(
    state: State<'_, db_service::DbState>,
    note_id: String,
) -> Result<Vec<Tag>, String> {
    let conn = state.0.lock().unwrap();
    organization_service::get_note_tags(&conn, &note_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn unlink_tag_from_note(
    state: State<'_, db_service::DbState>,
    note_id: String,
    tag_id: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    organization_service::unlink_tag_from_note(&conn, &note_id, &tag_id).map_err(|e| e.to_string())
}

