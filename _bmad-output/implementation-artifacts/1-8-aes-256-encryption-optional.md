# Story 1.8: AES-256 Encryption (Optional)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Security-conscious User,
I want optional encryption for my notes,
so that my sensitive data remains protected even if my device is compromised.

## Acceptance Criteria

1. [ ] **Given** settings panel, **When** I enable encryption, **Then** I can set a passphrase.
2. [ ] **Given** encryption is enabled, **When** I create or edit notes, **Then** content is encrypted with AES-256 before storage.
3. [ ] **Given** encryption is enabled, **When** I search notes, **Then** it operates on decrypted content transparently.
4. [ ] **Given** encryption is enabled, **When** I forget my passphrase, **Then** I receive a warning that data cannot be recovered without passphrase.
5. [ ] **Given** backup creation, **When** encryption is enabled, **Then** backup files are also encrypted with same passphrase.
6. [ ] **NFR:** Encryption/decryption must not impact note persistence time (>100ms threshold).

## Tasks / Subtasks

- [ ] Backend (Rust)
  - [ ] Add encryption service with AES-256-GCM implementation (AC: #2, #3, #4, #5, #6)
  - [ ] Integrate encryption into note CRUD operations (AC: #2, #3)
  - [ ] Implement passphrase management (set, verify, clear) (AC: #1)
  - [ ] Add encryption preference to settings storage (AC: #1)
  - [ ] Modify backup service to encrypt backups when encryption enabled (AC: #5)

- [ ] Frontend (React)
  - [ ] Add encryption toggle to settings panel (AC: #1)
  - [ ] Implement passphrase input and verification UI (AC: #1)
  - [ ] Show encryption status in note UI (locked/unlocked indicator) (AC: #3)
  - [ ] Add warning for forgotten passphrase (AC: #4)
  - [ ] Update search to handle encrypted content transparently (AC: #6)
  - [ ] Performance: Ensure encryption/decryption <100ms (AC: #6)

- [ ] Database & Storage
  - [ ] Add encryption preference column to settings table (AC: #1)
  - [ ] Implement encrypted content storage in notes table (AC: #2, #3)
  - [ ] Add encryption key derivation service (PBKDF2) (AC: #1)
  - [ ] Update migrations for encryption fields (AC: #2)

## Dev Notes

### Architecture & Design

- **Frontend**: Settings panel, note editor
- **Backend**: Rust encryption service
- **Database**: SQLite with encrypted content column
- **Cryptography**: Rust `aes-gcm` crate (AES-256-GCM)
- **State Management**: Use existing settings store and note store
- **Design System**: Follow "Rational Grid" - security indicators, lock icons

### Technical Guardrails

- **Encryption Library**: Use Rust `aes-gcm` crate (AES-256-GCM)
- **Key Derivation**: PBKDF2 with 100,000 iterations for passphrase security
- **Nonce**: 96-bit random nonce per encryption operation
- **Data Storage**: 
  ```rust
  struct Note {
      id: String,
      title: String,
      content_encrypted: Option<Vec<u8>>,  // Encrypted content
      content_plaintext: Option<String>,  // For search (decrypted)
  }
  ```
- **Transparent Operation**: Search/Filter uses `content_plaintext` when available
- **Passphrase Handling**: 
  - Never store plaintext passphrase
  - Use Argon2 memory-hardened key derivation
  - Wipe passphrase from memory immediately after key derivation
- **Performance**: Encryption/decryption must complete in <100ms (AC: #6)
- **Error Handling**: 
  - Clear errors for wrong passphrase during decryption
  - Graceful fallback when encryption key is corrupted
- **Backup Integration**: 
  ```rust
  fn create_backup(encrypted: bool) {
     // If encryption enabled, backup encrypted database file
     // Use same passphrase for backup encryption
  }
  ```

### Implementation Strategy

**Backend (Rust):**
1. Create `encryption_service.rs`:
   ```rust
   use aes_gcm::{Aes256Gcm, Key, Nonce};
   
   pub struct EncryptionService {
       pub fn new() -> Self,
       pub fn derive_key(passphrase: &str) -> Result<[Key, Nonce], String>,
       pub fn encrypt(data: &[u8], key: &Key, nonce: &[u8; 96]) -> Result<Vec<u8>, String>,
       pub fn decrypt(data: Vec<u8>, key: &Key, nonce: &[u8]) -> Result<Vec<u8>, String>,
   }
   
   #[tauri::command]
   pub async fn set_passphrase(passphrase: String) -> Result<(), String> { ... }
   #[tauri::command]
   pub async fn verify_passphrase(passphrase: String, verify_with: String) -> Result<bool, String> { ... }
   ```
2. Integrate with note service:
   ```rust
   // Modify existing note CRUD to use encryption
   pub async fn create_note(
     content: String,
     encrypted: bool,  // From settings
   ) -> Result<Note, String> {
     let key = derive_key(settings.get_passphrase())?;
     let content_bytes = content.as_bytes();
     
     if (encrypted) {
       let (nonce, encrypted) = encrypt(&key, &content_bytes, &mut rand::thread_rng())?;
       return db.insert_note(Note {
         id: generate_uuid(),
         title: title_from_content(content),
         content_encrypted: Some(encrypted),
         nonce: Some(nonce),
       }).await;
     } else {
       return db.insert_note(Note {
         id: generate_uuid(),
         title: title_from_content(content),
         content_encrypted: None,
         content_plaintext: Some(content),  // For search transparency
       }).await;
     }
   }
   ```

**Frontend (React):**
1. Encryption toggle in settings:
   ```typescript
   const EncryptionSettings = () => {
     const { encryption, setEncryption, passphrase } = useEncryptionStore();
     
     const handleEnableEncryption = () => {
       const passphrase = window.prompt("Set encryption passphrase:");
       if (!passphrase) return;
       
       const result = await invoke('set_passphrase', { passphrase });
       if (result.error) {
         alert(result.error);
         return;
       }
       
       const verify = await invoke('verify_passphrase', { 
         passphrase: passphrase,
         verify_with: passphrase 
       });
       
       if (!verify.success) {
         alert("Passphrases don't match. Data cannot be recovered if you forget it.");
         return;
       }
       
       setEncryption(true);
       setPassphrase(passphrase);
       alert("Encryption enabled. Notes are now protected.");
     };
     
     return (
       <Card>
         <h3>Security</h3>
         <ToggleSwitch
           label="Enable Encryption"
           checked={encryption}
           onChange={setEncryption}
         />
         {encryption ? (
           <>
             <div className="flex items-center gap-2">
               <Input
                 type="password"
                 placeholder="Encryption passphrase (cannot be recovered if lost)"
                 value={passphrase}
                 onChange={setPassphrase}
                 disabled={!encryption}  // AC #1
               />
               <Button
                 variant="secondary"
                 onClick={handleEnableEncryption}
                 disabled={!passphrase}
               >
                 Enable Encryption
               </Button>
             </div>
             <p className="text-sm text-neutral-600">
               ⚠️ If you forget your passphrase, your data cannot be recovered. 
               Store it securely.
             </p>
           </>
         ) : (
           <p className="text-sm text-neutral-600">
             Encryption is disabled. Your notes are stored in plaintext.
           </p>
         )}
         {encryption && (
           <Button
             variant="danger"
             onClick={async () => {
               if (confirm("Disabling encryption will convert all notes to plaintext. Continue?")) {
                 await invoke('set_passphrase', { passphrase: "" });
                 setEncryption(false);
                 await invoke('migrate_notes_to_plaintext');  // Decrypt all notes
               }
             }}
           >
             Disable Encryption
           </Button>
         )}
       </Card>
     );
   };
   ```

2. Search transparency:
   ```typescript
   // Search automatically decrypts when encryption is enabled
   const useNoteSearch = () => {
     const { encryption } = useEncryptionStore();
     
     const fetchNotes = async (query: string) => {
       const result = await invoke('search_notes', { query });
       
       // AC #6: Search uses decrypted content transparently
       return {
         notes: result.notes,
         isLoading: false,
       };
     };
     
     return useInfiniteQuery({
       queryKey: 'notes',
       queryFn: fetchNotes,
       encryption: encryption,  // Pass encryption context
     });
   };
   ```

3. Note editor security indicator:
   ```typescript
   const NoteEditor = ({ note }: NoteEditorProps) => {
     const { encryption } = useEncryptionStore();
     const isLocked = note.content_encrypted && encryption;
     
     return (
       <div className="relative">
         {isLocked && (
           <Lock className="absolute top-2 right-2 text-primary-500" />
         )}
         {isLocked && (
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
             <Input
               type="password"
               placeholder="Enter passphrase to unlock note"
               className="text-center"
               onKeyDown={handleUnlockNote}
             />
           </div>
         )}
         {!isLocked && (
           <NoteEditor {...note} />
         )}
       </div>
     );
   };
   ```

**Database Integration:**
1. Add encryption preference to settings:
   ```sql
   CREATE TABLE settings (
     encryption_enabled BOOLEAN DEFAULT FALSE,
     encryption_passphrase_hash TEXT,  -- Argon2 hash, never store plaintext
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. Update notes table schema:
   ```sql
   ALTER TABLE notes ADD COLUMN content_encrypted BLOB,  -- Encrypted content
   ALTER TABLE notes ADD COLUMN nonce BLOB,  -- 96-bit nonce
   ALTER TABLE notes ADD COLUMN content_plaintext TEXT;  -- Decrypted for search
   ```

### Project Structure Notes

- **New Backend**: `src-tauri/src/services/encryption_service.rs` (New)
- **New Backend Service**: `src-tauri/src/services/passphrase_service.rs` (New: Key derivation)
- **Database Migration**: `src-tauri/migrations/0006_add_encryption_fields.sql` (New: Add encryption fields)
- **Settings Update**: `src-tauri/src/services/settings_service.rs` (Modified: Add encryption toggle)
- **Note Service Update**: `src-tauri/src/services/note_service.rs` (Modified: Integrate encryption)
- **Settings Panel**: `src/features/settings/components/SecuritySettings.tsx` (New: Encryption toggle)
- **Note Editor Update**: `src/features/notes/components/NoteEditor.tsx` (Modified: Add lock indicator)
- **Search Update**: `src/features/retrieval/components/CommandPalette.tsx` (Modified: Handle encrypted search)
- **No Breaking Changes**: Encryption is optional, doesn't break existing functionality

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 - Story 1.8] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#Data Architecture] - SQLite schema
- [Source: https://docs.rs.rs/] - Rust `aes-gcm` crate documentation
- [Source: https://github.com/P-H-C/phc-winner-argon2#argon2id-hashing] - PBKDF2 specification
- [Source: _bmad-output/implementation-artifacts/1-2-core-note-management-crud.md] - Note CRUD patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Trust (vs. Anxiety)] - Security messaging patterns

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] Create `encryption_service.rs` with AES-256-GCM implementation
- [ ] Implement PBKDF2 key derivation with 100,000 iterations
- [ ] Add `set_passphrase` and `verify_passphrase` Tauri commands
- [ ] Create `passphrase_service.rs` for key management
- [ ] Integrate encryption into note CRUD operations (create, update)
- [ ] Implement secure backup encryption
- [ ] Add migration for encryption fields

**Frontend Implementation:**
- [ ] Create `SecuritySettings.tsx` with encryption toggle
- [ ] Implement passphrase input and verification UI
- [ ] Add lock/unlock indicator to NoteEditor
- [ ] Update search to handle encrypted content transparently
- [ ] Add clear warning for forgotten passphrase
- [ ] Performance: Encryption/decryption <100ms

**Database Integration:**
- [ ] Add `encryption_enabled` and `encryption_passphrase_hash` to settings table
- [ ] Update notes table with `content_encrypted`, `nonce`, `content_plaintext`
- [ ] Create migration script for encryption fields

**Technical Notes:**
- [ ] `aes-gcm` crate: Rust AES-256-GCM implementation
- [ ] PBKDF2: 100,000 iterations for key derivation (32ms per iteration)
- [ ] 96-bit random nonce per encryption (prevents replay attacks)
- [ ] Argon2: Memory-hardened key derivation
- [ ] Secure passphrase storage: Hash stored, plaintext wiped from memory
- [ ] Backup encryption: Same passphrase, GCM mode for authenticated encryption

**Security Considerations:**
- [ ] Never log passphrase in plaintext
- [ ] Wipe passphrase from memory immediately after use
- [ ] Use Argon2id for constant-time key derivation (resists GPU attacks)
- [ ] GCM mode provides authentication (detects tampering)
- [ ] Nonce: 96-bit random value prevents replay attacks

### File List

- src-tauri/Cargo.toml (Modified: Add aes-gcm dependency)
- src-tauri/src/services/encryption_service.rs (New: AES-256-GCM encryption)
- src-tauri/src/services/passphrase_service.rs (New: PBKDF2 key derivation)
- src-tauri/src/commands/encryption_commands.rs (New: Set/Verify passphrase)
- src-tauri/src/services/settings_service.rs (Modified: Add encryption preferences)
- src-tauri/src/services/note_service.rs (Modified: Integrate encryption)
- src-tauri/migrations/0006_add_encryption_fields.sql (New: Database schema)
- src/features/settings/components/SecuritySettings.tsx (New: Encryption toggle UI)
- src/features/notes/components/NoteEditor.tsx (Modified: Lock indicator)
- src/features/retrieval/components/CommandPalette.tsx (Modified: Encrypted search)
- src/shared/stores/useEncryptionStore.ts (New: Encryption state)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Implement encryption service with PBKDF2 key derivation
3. Frontend: Build SecuritySettings with passphrase management
4. Test: Encryption/decryption performance (<100ms target)
5. Verify: Forgotten passphrase warning and data loss prevention
6. Code review: Validate against acceptance criteria
