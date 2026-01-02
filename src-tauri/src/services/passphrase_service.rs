use crate::services::encryption_service::EncryptionService;
use zeroize::Zeroize;
use std::sync::Mutex;
use std::time::Instant;

/// Manages the in-memory encryption key and passphrase verification
/// 
/// # Security Design
/// - Passphrase is never stored in plaintext
/// - Key is derived on-demand and wiped immediately after use
/// - Verification uses encrypted test data
/// - Memory is zeroized on drop
pub struct PassphraseState {
    /// Derived encryption key (32 bytes)
    /// This is the ONLY place the key is stored in memory
    key: Option<[u8; 32]>,
    
    /// Encrypted test data for passphrase verification
    /// Format: (encrypted_data, nonce, expected_plaintext)
    passphrase_test: Option<(Vec<u8>, Vec<u8>, Vec<u8>)>,
    
    /// Whether encryption is enabled
    enabled: bool,
}

impl PassphraseState {
    pub fn new() -> Mutex<Self> {
        Mutex::new(Self {
            key: None,
            passphrase_test: None,
            enabled: false,
        })
    }
    
    /// Set passphrase and derive key
    /// 
    /// # Arguments
    /// * `passphrase` - User-provided passphrase
    /// 
    /// # Returns
    /// Ok(()) on success, error string on failure
    pub fn set_passphrase(&mut self, passphrase: &str) -> Result<(), String> {
        let start = Instant::now();
        
        // Clear existing key if present
        if let Some(ref mut existing_key) = self.key {
            use zeroize::Zeroize;
            existing_key.zeroize();
        }
        
        // Derive new key
        let key = EncryptionService::derive_key(passphrase)?;
        
        // Generate passphrase verification test
        let (encrypted, nonce, plaintext) = EncryptionService::generate_passphrase_test(passphrase)?;
        
        // Store key and test data
        self.key = Some(key);
        self.passphrase_test = Some((encrypted, nonce, plaintext));
        self.enabled = true;
        
        let duration = start.elapsed();
        log::info!("Passphrase set and verified in {:?}", duration);
        
        Ok(())
    }
    
    /// Clear passphrase and key from memory
    pub fn clear_passphrase(&mut self) {
        if let Some(ref mut key) = self.key {
            use zeroize::Zeroize;
            key.zeroize();
        }
        self.key = None;
        self.passphrase_test = None;
        self.enabled = false;
        
        log::info!("Passphrase cleared from memory");
    }
    
    /// Verify that the provided passphrase matches the stored one
    /// 
    /// # Arguments
    /// * `passphrase` - Passphrase to verify
    /// 
    /// # Returns
    /// true if passphrase matches
    pub fn verify_passphrase(&self, passphrase: &str) -> Result<bool, String> {
        let (encrypted, nonce, plaintext) = match &self.passphrase_test {
            Some(test) => test,
            None => return Ok(false), // No passphrase set
        };
        
        EncryptionService::verify_passphrase(passphrase, encrypted, nonce, plaintext)
    }
    
    /// Get the encryption key if available
    /// 
    /// # Returns
    /// Reference to key if passphrase is set
    pub fn get_key(&self) -> Option<&[u8; 32]> {
        self.key.as_ref()
    }
    
    /// Check if encryption is enabled
    pub fn is_enabled(&self) -> bool {
        self.enabled && self.key.is_some()
    }
    
    /// Encrypt data using current key
    /// 
    /// # Returns
    /// (nonce, encrypted_data) or error
    pub fn encrypt(&self, data: &[u8]) -> Result<(Vec<u8>, Vec<u8>), String> {
        let key = self.key.ok_or("Encryption not enabled - no passphrase set")?;
        EncryptionService::encrypt(data, &key)
    }
    
    /// Decrypt data using current key
    /// 
    /// # Returns
    /// Decrypted data or error
    pub fn decrypt(&self, encrypted_data: &[u8], nonce: &[u8]) -> Result<Vec<u8>, String> {
        let key = self.key.ok_or("Encryption not enabled - no passphrase set")?;
        EncryptionService::decrypt(encrypted_data, nonce, &key)
    }
}

impl Drop for PassphraseState {
    fn drop(&mut self) {
        // Securely wipe key from memory
        if let Some(ref mut key) = self.key {
            use zeroize::Zeroize;
            key.zeroize();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_set_and_verify_passphrase() {
        let mut state = PassphraseState::new().into_inner().unwrap();
        
        // Set passphrase
        assert!(state.set_passphrase("test-passphrase-123").is_ok());
        assert!(state.is_enabled());
        
        // Verify correct passphrase
        assert!(state.verify_passphrase("test-passphrase-123").unwrap());
        
        // Verify wrong passphrase
        assert!(!state.verify_passphrase("wrong-passphrase").unwrap());
        
        // Clear and verify disabled
        state.clear_passphrase();
        assert!(!state.is_enabled());
    }
    
    #[test]
    fn test_encrypt_decrypt_with_state() {
        let mut state = PassphraseState::new().into_inner().unwrap();
        state.set_passphrase("test-key").unwrap();
        
        let data = b"Sensitive note content";
        
        // Encrypt
        let (nonce, encrypted) = state.encrypt(data).unwrap();
        assert_ne!(encrypted, data.to_vec());
        
        // Decrypt
        let decrypted = state.decrypt(&encrypted, &nonce).unwrap();
        assert_eq!(decrypted, data.to_vec());
    }
    
    #[test]
    fn test_no_passphrase_error() {
        let state = PassphraseState::new().into_inner().unwrap();
        
        let result = state.encrypt(b"test");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not enabled"));
    }
}
