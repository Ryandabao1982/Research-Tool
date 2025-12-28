# Database Architecture - KnowledgeBase Pro

KnowledgeBase Pro uses **SQLite** as its primary data store, leveraging the **local-first** philosophy for maximum performance, privacy, and offline reliability.

## 🗄️ Core Tables

### 1. `notes`
The central table for all knowledge content.
- `metadata`: A JSON column for flexible, schema-less properties (inspired by Obsidian Frontmatter).
- `updated_at`: Automatically updated via triggers to maintain sync state.

### 2. `folders`
Provides hierarchical organization.
- `path`: Uses a **materialized path** pattern (e.g., `projects.work.kb_pro`) for lightning-fast subtree queries without recursive CTEs.

### 3. `links`
Encodes the bidirectional relationship between notes.
- Supports future **block-level** references via `source_block_id` and `target_block_id`.

## 🔍 Search Engine (FTS5)

We utilize SQLite's **FTS5 (Full-Text Search)** extension for interactive search speeds.
- **Triggers**: Automated synchronization ensures that when a note is updated, its search index is refreshed instantly.
- **Tokenization**: Uses `porter unicode61` for stem-aware search (searching "coding" finds "code") and diacritic insensitivity.

## 🚀 Performance Optimizations

1.  **Materialized Paths**: Avoids recursive database lookups for folder trees.
2.  **Covering Indexes**: Primary foreign keys are indexed to ensure O(log N) lookup speeds.
3.  **WAL Mode**: SQLite is configured in **Write-Ahead Logging** mode for better concurrent read/write performance in the GUI.

## 🛠️ Schema Management

Migrations are handled by the Rust backend using the `rusqlite_migration` crate.
Initial schema is defined in `src-tauri/migrations/001_initial_schema.sql`.
