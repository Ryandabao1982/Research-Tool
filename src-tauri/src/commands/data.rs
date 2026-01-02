use tauri::State;
use std::path::PathBuf;
use crate::services::{db_service, import_service, export_service, backup_service, search_service};
use crate::services::passphrase_service::PassphraseState;
use crate::services::encrypted_note_service;

#[tauri::command]
pub async fn get_notes(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
) -> Result<Vec<db_service::Note>, String> {
    let conn = db_state.0.lock().unwrap();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Use encrypted note service which handles decryption
        let encrypted_notes = encrypted_note_service::get_all_encrypted_notes(&conn, &passphrase_state)?;
        
        // Convert to db_service::Note format
        let notes = encrypted_notes.into_iter().map(|en| db_service::Note {
            id: en.id,
            title: en.title,
            content: en.content,
            created_at: en.created_at,
            updated_at: en.updated_at,
            folder_id: en.folder_id,
            is_encrypted: en.is_encrypted,
        }).collect();
        
        Ok(notes)
    } else {
        // Use regular service
        db_service::get_all_notes(&conn).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn get_note(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
    id: String,
) -> Result<Option<db_service::Note>, String> {
    let conn = db_state.0.lock().unwrap();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Use encrypted note service
        let result = encrypted_note_service::get_encrypted_note(&conn, &passphrase_state, &id)?;
        
        Ok(result.map(|en| db_service::Note {
            id: en.id,
            title: en.title,
            content: en.content,
            created_at: en.created_at,
            updated_at: en.updated_at,
            folder_id: en.folder_id,
            is_encrypted: en.is_encrypted,
        }))
    } else {
        // Use regular service
        db_service::get_note_by_id(&conn, &id).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn create_note(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
    title: String,
    content: String,
) -> Result<String, String> {
    let conn = db_state.0.lock().unwrap();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Use encrypted note service
        encrypted_note_service::create_encrypted_note(&conn, &passphrase_state, &title, &content)
    } else {
        // Use regular service
        db_service::create_note(&conn, &title, &content).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn update_note(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
    id: String,
    title: String,
    content: String,
) -> Result<(), String> {
    let conn = db_state.0.lock().unwrap();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Use encrypted note service
        encrypted_note_service::update_encrypted_note(&conn, &passphrase_state, &id, &title, &content)
    } else {
        // Use regular service
        db_service::update_note(&conn, &id, &title, &content).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn delete_note(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
    id: String,
) -> Result<(), String> {
    let conn = db_state.0.lock().unwrap();
    
    // Delete works the same for both encrypted and plaintext
    // (the encrypted data is just deleted from the database)
    encrypted_note_service::delete_encrypted_note(&conn, &id)
}

#[tauri::command]
pub async fn import_files(
    state: State<'_, db_service::DbState>,
    path: String,
) -> Result<usize, String> {
    let conn = state.0.lock().unwrap();
    import_service::import_files(&conn, &PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_notes(
    state: State<'_, db_service::DbState>,
    path: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    export_service::export_notes(&conn, &PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_backup(
    db_state: State<'_, db_service::DbState>,
    passphrase_state: State<'_, PassphraseState>,
    path: String,
) -> Result<(), String> {
    let conn = db_state.0.lock().unwrap();
    backup_service::create_backup(&conn, &PathBuf::from(path), Some(&passphrase_state))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_notes(
    state: State<'_, db_service::DbState>,
    query: String,
    role: Option<String>,
    global_search: Option<bool>,
) -> Result<search_service::SearchResultWithMetadata, String> {
    let conn = state.0.lock().unwrap();
    let role_str = role.as_deref();
    let global = global_search.unwrap_or(false);
    search_service::search_notes(&conn, &query, role_str, global).map_err(|e| e.to_string())
}

