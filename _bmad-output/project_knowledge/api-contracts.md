# API Contracts (Tauri Commands)

KnowledgeBase Pro utilizes Tauri Commands to bridge the gap between the TypeScript frontend and the Rust native core.

## AI Bridge

### `synthesize_notes`
Synthesizes information across a collection of selected notes.

- **Parameters**:
  - `note_ids`: `Vec<String>`
  - `prompt_type`: `String` (e.g., "summary", "qa", "extraction")
- **Returns**: `Result<String, String>`
- **Handler**: `src-tauri/src/commands/ai.rs`

## Note Management

### `list_notes`
Retrieves a list of available notes with metadata.

- **Parameters**: None
- **Returns**: `Result<Vec<NoteMetadata>, String>`

### `get_note_content`
Fetches the full content of a specific note.

- **Parameters**:
  - `id`: `String`
- **Returns**: `Result<String, String>`

### `save_note`
Persists note changes to the SQLite database.

- **Parameters**:
  - `id`: `String`
  - `content`: `String`
- **Returns**: `Result<bool, String>`

---
*Last Updated: 2025-12-31*
