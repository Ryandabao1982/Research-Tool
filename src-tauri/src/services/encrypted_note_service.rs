use rusqlite::{Connection, Result};
use crate::services::passphrase_service::PassphraseState;
use std::sync::Mutex;

/// Note structure supporting both encrypted and plaintext storage
#[derive(Debug, Clone, PartialEq)]
pub struct EncryptedNote {
    pub id: String,
    pub title: String,
    pub content: String, // Decrypted content for return to frontend
    pub created_at: String,
    pub updated_at: String,
    pub folder_id: Option<String>,
    pub is_encrypted: bool, // Whether this note is encrypted
}

/// Create encrypted note
pub fn create_encrypted_note(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
    title: &str,
    content: &str,
) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Encrypt the content
        let (nonce, encrypted) = state_guard.encrypt(content.as_bytes())
            .map_err(|e| format!("Encryption failed: {}", e))?;
        
        // Store encrypted with plaintext copy for search transparency
        // The content_plaintext allows FTS5 to search decrypted content
        conn.execute(
            "INSERT INTO notes (id, title, content, created_at, updated_at, content_encrypted, nonce, content_plaintext) 
             VALUES (?, ?, '', ?, ?, ?, ?, ?)",
            [
                &id,
                title,
                &now,
                &now,
                &base64::encode(&encrypted),
                &base64::encode(&nonce),
                content, // Store plaintext for search index
            ],
        ).map_err(|e| format!("Database error: {}", e))?;
    } else {
        // Store plaintext
        conn.execute(
            "INSERT INTO notes (id, title, content, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?)",
            [&id, title, content, &now, &now],
        ).map_err(|e| format!("Database error: {}", e))?;
    }
    
    Ok(id)
}

/// Update encrypted note
pub fn update_encrypted_note(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
    id: &str,
    title: &str,
    content: &str,
) -> Result<(), String> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // Check if encryption is enabled
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if state_guard.is_enabled() {
        // Encrypt the content
        let (nonce, encrypted) = state_guard.encrypt(content.as_bytes())
            .map_err(|e| format!("Encryption failed: {}", e))?;
        
        // Update with encrypted content and plaintext for search
        conn.execute(
            "UPDATE notes SET title = ?, content = '', updated_at = ?, 
             content_encrypted = ?, nonce = ?, content_plaintext = ? WHERE id = ?",
            [
                title,
                &now,
                &base64::encode(&encrypted),
                &base64::encode(&nonce),
                content, // For search transparency
                id,
            ],
        ).map_err(|e| format!("Database error: {}", e))?;
    } else {
        // Update with plaintext
        conn.execute(
            "UPDATE notes SET title = ?, content = ?, updated_at = ?, 
             content_encrypted = NULL, nonce = NULL, content_plaintext = NULL WHERE id = ?",
            [title, content, &now, id],
        ).map_err(|e| format!("Database error: {}", e))?;
    }
    
    Ok(())
}

/// Get note with automatic decryption
pub fn get_encrypted_note(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
    id: &str,
) -> Result<Option<EncryptedNote>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, content_encrypted, nonce, created_at, updated_at, folder_id 
         FROM notes WHERE id = ?"
    ).map_err(|e| e.to_string())?;
    
    let result = stmt.query_row([id], |row| {
        let content_encrypted: Option<String> = row.get(3)?;
        let nonce: Option<String> = row.get(4)?;
        
        let content = if let Some(enc) = content_encrypted {
            // Encrypted note - decrypt if passphrase available
            let state_guard = passphrase_state.lock().map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            if state_guard.is_enabled() {
                let encrypted_bytes = base64::decode(&enc).unwrap_or_default();
                let nonce_bytes = base64::decode(&nonce.unwrap_or_default()).unwrap_or_default();
                
                match state_guard.decrypt(&encrypted_bytes, &nonce_bytes) {
                    Ok(decrypted) => String::from_utf8_lossy(&decrypted).to_string(),
                    Err(_) => "[ENCRYPTED - PASSPHRASE REQUIRED]".to_string(),
                }
            } else {
                "[ENCRYPTED - PASSPHRASE REQUIRED]".to_string()
            }
        } else {
            // Plaintext note
            row.get(2)?
        };
        
        Ok(EncryptedNote {
            id: row.get(0)?,
            title: row.get(1)?,
            content,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            folder_id: row.get(8)?,
            is_encrypted: content_encrypted.is_some(),
        })
    }).optional().map_err(|e| e.to_string())?;
    
    Ok(result)
}

/// Get all notes with automatic decryption
pub fn get_all_encrypted_notes(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
) -> Result<Vec<EncryptedNote>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, content_encrypted, nonce, created_at, updated_at, folder_id 
         FROM notes ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let notes = stmt.query_map([], |row| {
        let content_encrypted: Option<String> = row.get(3)?;
        let nonce: Option<String> = row.get(4)?;
        
        let content = if let Some(enc) = content_encrypted {
            let state_guard = passphrase_state.lock().map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            if state_guard.is_enabled() {
                let encrypted_bytes = base64::decode(&enc).unwrap_or_default();
                let nonce_bytes = base64::decode(&nonce.unwrap_or_default()).unwrap_or_default();
                
                match state_guard.decrypt(&encrypted_bytes, &nonce_bytes) {
                    Ok(decrypted) => String::from_utf8_lossy(&decrypted).to_string(),
                    Err(_) => "[ENCRYPTED - PASSPHRASE REQUIRED]".to_string(),
                }
            } else {
                "[ENCRYPTED - PASSPHRASE REQUIRED]".to_string()
            }
        } else {
            row.get(2)?
        };
        
        Ok(EncryptedNote {
            id: row.get(0)?,
            title: row.get(1)?,
            content,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            folder_id: row.get(8)?,
            is_encrypted: content_encrypted.is_some(),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for note in notes {
        result.push(note.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

/// Delete encrypted note (same as regular delete)
pub fn delete_encrypted_note(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM notes WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Migrate all notes to encrypted format
pub fn migrate_to_encrypted(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
) -> Result<usize, String> {
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    if !state_guard.is_enabled() {
        return Err("Encryption not enabled".to_string());
    }
    
    // Get all plaintext notes
    let mut stmt = conn.prepare(
        "SELECT id, title, content FROM notes WHERE content_encrypted IS NULL"
    ).map_err(|e| e.to_string())?;
    
    let notes: Vec<(String, String, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;
    
    let mut migrated = 0;
    for (id, title, content) in notes {
        let (nonce, encrypted) = state_guard.encrypt(content.as_bytes())
            .map_err(|e| format!("Encryption failed for note {}: {}", id, e))?;
        
        conn.execute(
            "UPDATE notes SET content = '', content_encrypted = ?, nonce = ? WHERE id = ?",
            [&base64::encode(&encrypted), &base64::encode(&nonce), &id],
        ).map_err(|e| e.to_string())?;
        
        migrated += 1;
    }
    
    Ok(migrated)
}

/// Migrate all notes to plaintext format (disable encryption)
pub fn migrate_to_plaintext(
    conn: &Connection,
    passphrase_state: &Mutex<PassphraseState>,
) -> Result<usize, String> {
    let state_guard = passphrase_state.lock().map_err(|e| e.to_string())?;
    
    // Get all encrypted notes
    let mut stmt = conn.prepare(
        "SELECT id, content_encrypted, nonce FROM notes WHERE content_encrypted IS NOT NULL"
    ).map_err(|e| e.to_string())?;
    
    let notes: Vec<(String, String, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;
    
    let mut migrated = 0;
    for (id, encrypted_b64, nonce_b64) in notes {
        let encrypted = base64::decode(&encrypted_b64)
            .map_err(|e| format!("Invalid base64: {}", e))?;
        let nonce = base64::decode(&nonce_b64)
            .map_err(|e| format!("Invalid base64: {}", e))?;
        
        let decrypted = state_guard.decrypt(&encrypted, &nonce)
            .map_err(|e| format!("Decryption failed for note {}: {}", id, e))?;
        
        let content = String::from_utf8(decrypted)
            .map_err(|e| format!("Invalid UTF-8: {}", e))?;
        
        conn.execute(
            "UPDATE notes SET content = ?, content_encrypted = NULL, nonce = NULL WHERE id = ?",
            [&content, &id],
        ).map_err(|e| e.to_string())?;
        
        migrated += 1;
    }
    
    Ok(migrated)
}
