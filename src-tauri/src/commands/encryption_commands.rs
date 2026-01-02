use tauri::State;
use crate::services::passphrase_service::PassphraseState;

/// Set encryption passphrase
/// 
/// # Arguments
/// * `passphrase` - User-provided passphrase
/// 
/// # Returns
/// Ok(()) on success, error string on failure
/// 
/// # Frontend Usage
/// ```typescript
/// await invoke('set_passphrase', { passphrase: 'my-secret' });
/// ```
#[tauri::command]
pub async fn set_passphrase(
    state: State<'_, PassphraseState>,
    passphrase: String,
) -> Result<(), String> {
    let mut state_guard = state.lock().map_err(|e| e.to_string())?;
    
    if passphrase.is_empty() {
        state_guard.clear_passphrase();
        return Ok(());
    }
    
    state_guard.set_passphrase(&passphrase)
}

/// Verify passphrase matches stored one
/// 
/// # Arguments
/// * `passphrase` - Passphrase to verify
/// 
/// # Returns
/// true if passphrase is correct
/// 
/// # Frontend Usage
/// ```typescript
/// const isValid = await invoke('verify_passphrase', { passphrase: 'my-secret' });
/// ```
#[tauri::command]
pub async fn verify_passphrase(
    state: State<'_, PassphraseState>,
    passphrase: String,
) -> Result<bool, String> {
    let state_guard = state.lock().map_err(|e| e.to_string())?;
    state_guard.verify_passphrase(&passphrase)
}

/// Check if encryption is currently enabled
/// 
/// # Returns
/// true if encryption is active
/// 
/// # Frontend Usage
/// ```typescript
/// const enabled = await invoke('is_encryption_enabled');
/// ```
#[tauri::command]
pub async fn is_encryption_enabled(
    state: State<'_, PassphraseState>,
) -> Result<bool, String> {
    let state_guard = state.lock().map_err(|e| e.to_string())?;
    Ok(state_guard.is_enabled())
}

/// Clear passphrase and disable encryption
/// 
/// # Frontend Usage
/// ```typescript
/// await invoke('clear_passphrase');
/// ```
#[tauri::command]
pub async fn clear_passphrase(
    state: State<'_, PassphraseState>,
) -> Result<(), String> {
    let mut state_guard = state.lock().map_err(|e| e.to_string())?;
    state_guard.clear_passphrase();
    Ok(())
}

/// Encrypt a string (for testing or backup encryption)
/// 
/// # Arguments
/// * `data` - Plaintext data to encrypt
/// 
/// # Returns
/// Base64-encoded encrypted data with nonce
/// 
/// # Frontend Usage
/// ```typescript
/// const result = await invoke('encrypt_string', { data: 'my secret' });
/// ```
#[tauri::command]
pub async fn encrypt_string(
    state: State<'_, PassphraseState>,
    data: String,
) -> Result<String, String> {
    let state_guard = state.lock().map_err(|e| e.to_string())?;
    
    let (nonce, encrypted) = state_guard.encrypt(data.as_bytes())?;
    
    // Encode as base64 for transport: nonce:encrypted
    let nonce_b64 = base64::encode(&nonce);
    let data_b64 = base64::encode(&encrypted);
    
    Ok(format!("{}:{}", nonce_b64, data_b64))
}

/// Decrypt a string (for testing or backup decryption)
/// 
/// # Arguments
/// * `encrypted_data` - Base64-encoded "nonce:encrypted" format
/// 
/// # Returns
/// Decrypted plaintext
/// 
/// # Frontend Usage
/// ```typescript
/// const plaintext = await invoke('decrypt_string', { encryptedData: '...' });
/// ```
#[tauri::command]
pub async fn decrypt_string(
    state: State<'_, PassphraseState>,
    encrypted_data: String,
) -> Result<String, String> {
    let state_guard = state.lock().map_err(|e| e.to_string())?;
    
    // Parse "nonce:encrypted" format
    let parts: Vec<&str> = encrypted_data.split(':').collect();
    if parts.len() != 2 {
        return Err("Invalid encrypted data format".to_string());
    }
    
    let nonce = base64::decode(parts[0])
        .map_err(|e| format!("Invalid nonce: {}", e))?;
    let encrypted = base64::decode(parts[1])
        .map_err(|e| format!("Invalid encrypted data: {}", e))?;
    
    let decrypted = state_guard.decrypt(&encrypted, &nonce)?;
    
    String::from_utf8(decrypted)
        .map_err(|e| format!("Invalid UTF-8: {}", e))
}

// Note: base64 crate needs to be added to Cargo.toml
// We'll use the standard base64 crate
