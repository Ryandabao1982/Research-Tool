use rusqlite::{Connection, Result};
use std::path::Path;
use std::fs;
use crate::services::passphrase_service::PassphraseState;
use std::sync::Mutex;

/// Create a database backup
/// 
/// # Arguments
/// * `conn` - Database connection
/// * `backup_path` - Path where backup will be saved
/// * `passphrase_state` - Optional passphrase state for encrypted backups
/// 
/// # Returns
/// Ok(()) on success
/// 
/// # Encryption
/// If passphrase_state is provided and encryption is enabled, the backup file
/// will be encrypted using the same passphrase.
pub fn create_backup(
    conn: &Connection,
    backup_path: &Path,
    passphrase_state: Option<&Mutex<PassphraseState>>,
) -> Result<()> {
    // Create temporary backup file
    let temp_backup = backup_path.with_extension("tmp");
    
    // Use SQLite's VACUUM INTO for consistent backup
    let query = format!("VACUUM INTO '{}'", temp_backup.to_string_lossy());
    conn.execute(&query, [])?;
    
    // Check if encryption is requested
    if let Some(state) = passphrase_state {
        let state_guard = state.lock().map_err(|e| {
            rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e))
        })?;
        
        if state_guard.is_enabled() {
            // Read the temporary backup file
            let backup_data = fs::read(&temp_backup)
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            // Encrypt the backup data
            let (nonce, encrypted) = state_guard.encrypt(&backup_data)
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            // Write encrypted backup with format: nonce:encrypted_data
            let mut encrypted_file = fs::File::create(backup_path)
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            use std::io::Write;
            write!(&mut encrypted_file, "{}:{}", 
                base64::encode(&nonce), 
                base64::encode(&encrypted)
            ).map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
            
            // Clean up temp file
            let _ = fs::remove_file(&temp_backup);
            
            log::info!("Encrypted backup created at: {:?}", backup_path);
            return Ok(());
        }
    }
    
    // Non-encrypted backup - just move temp file to final location
    fs::rename(&temp_backup, backup_path)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
    
    log::info!("Plaintext backup created at: {:?}", backup_path);
    Ok(())
}

/// Restore a backup (encrypted or plaintext)
/// 
/// # Arguments
/// * `backup_path` - Path to backup file
/// * `target_path` - Path where database will be restored
/// * `passphrase_state` - Optional passphrase state for encrypted backups
/// 
/// # Returns
/// Ok(()) on success
pub fn restore_backup(
    backup_path: &Path,
    target_path: &Path,
    passphrase_state: Option<&Mutex<PassphraseState>>,
) -> Result<()> {
    // Read backup file
    let backup_data = fs::read(backup_path)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
    
    // Check if it's encrypted (format: nonce:encrypted_data)
    let backup_str = String::from_utf8_lossy(&backup_data);
    let decrypted_data = if let Some(state) = passphrase_state {
        if let Some(colon_pos) = backup_str.find(':') {
            // Likely encrypted format
            let state_guard = state.lock().map_err(|e| {
                rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e))
            })?;
            
            if state_guard.is_enabled() {
                let nonce_b64 = &backup_str[..colon_pos];
                let encrypted_b64 = &backup_str[colon_pos + 1..];
                
                let nonce = base64::decode(nonce_b64)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
                let encrypted = base64::decode(encrypted_b64)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
                
                state_guard.decrypt(&encrypted, &nonce)
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?
            } else {
                backup_data // Not encrypted
            }
        } else {
            backup_data // Not encrypted
        }
    } else {
        backup_data // Not encrypted
    };
    
    // Write to target path
    fs::write(target_path, &decrypted_data)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, 0, Box::new(e)))?;
    
    log::info!("Backup restored to: {:?}", target_path);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use tempfile::tempdir;
    
    #[test]
    fn test_plaintext_backup() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let backup_path = dir.path().join("backup.db");
        
        // Create a test database
        let conn = Connection::open(&db_path).unwrap();
        conn.execute("CREATE TABLE test (id INTEGER)", []).unwrap();
        conn.execute("INSERT INTO test VALUES (1)", []).unwrap();
        
        // Create backup
        create_backup(&conn, &backup_path, None).unwrap();
        
        // Verify backup exists
        assert!(backup_path.exists());
        
        // Verify backup is valid SQLite
        let backup_conn = Connection::open(&backup_path).unwrap();
        let count: i32 = backup_conn.query_row("SELECT COUNT(*) FROM test", [], |row| row.get(0)).unwrap();
        assert_eq!(count, 1);
    }
    
    #[test]
    fn test_encrypted_backup() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test.db");
        let backup_path = dir.path().join("backup.enc");
        
        // Create a test database
        let conn = Connection::open(&db_path).unwrap();
        conn.execute("CREATE TABLE test (id INTEGER)", []).unwrap();
        conn.execute("INSERT INTO test VALUES (1)", []).unwrap();
        
        // Set up encryption
        let passphrase_state = PassphraseState::new();
        {
            let mut state = passphrase_state.lock().unwrap();
            state.set_passphrase("test-passphrase").unwrap();
        }
        
        // Create encrypted backup
        create_backup(&conn, &backup_path, Some(&passphrase_state)).unwrap();
        
        // Verify backup exists
        assert!(backup_path.exists());
        
        // Verify it's encrypted (not valid SQLite)
        let content = fs::read_to_string(&backup_path).unwrap();
        assert!(content.contains(':')); // Should have nonce:encrypted format
    }
}

