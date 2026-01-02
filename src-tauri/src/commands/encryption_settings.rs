use tauri::State;
use crate::services::db_service::DbState;
use crate::services::passphrase_service::PassphraseState;
use crate::services::encrypted_note_service;

/// Get encryption settings from database
#[tauri::command]
pub async fn get_encryption_settings(
    db_state: State<'_, DbState>,
) -> Result<bool, String> {
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
    
    let result: Option<bool> = conn.query_row(
        "SELECT encryption_enabled FROM settings WHERE id = 1",
        [],
        |row| row.get(0)
    ).optional().map_err(|e| e.to_string())?;
    
    Ok(result.unwrap_or(false))
}

/// Set encryption settings in database
#[tauri::command]
pub async fn set_encryption_settings(
    db_state: State<'_, DbState>,
    enabled: bool,
) -> Result<(), String> {
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE settings SET encryption_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        [enabled]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// Migrate all notes to encrypted format
#[tauri::command]
pub async fn migrate_to_encrypted(
    db_state: State<'_, DbState>,
    passphrase_state: State<'_, PassphraseState>,
) -> Result<usize, String> {
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
    encrypted_note_service::migrate_to_encrypted(&conn, &passphrase_state)
}

/// Migrate all notes to plaintext format
#[tauri::command]
pub async fn migrate_to_plaintext(
    db_state: State<'_, DbState>,
    passphrase_state: State<'_, PassphraseState>,
) -> Result<usize, String> {
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
    encrypted_note_service::migrate_to_plaintext(&conn, &passphrase_state)
}

/// Check if all notes can be migrated (passphrase is set)
#[tauri::command]
pub async fn can_migrate(
    passphrase_state: State<'_, PassphraseState>,
) -> Result<bool, String> {
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    Ok(state_guard.is_enabled())
}
