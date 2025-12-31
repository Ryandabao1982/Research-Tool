# Story 2.1: Full-Text Search with Command Palette

**Status: done**

## Story
**As a** Power User,
**I want** to search my entire knowledge base with a keyboard shortcut,
**So that** I can find information without taking my hands off the keyboard.

## Acceptance Criteria
- [x] **Given** any screen, **When** I press `Cmd/Ctrl+K`, **Then** the Command Palette modal opens instantly (<100ms).
- [x] **Given** the palette, **When** I type a query, **Then** I see results from SQLite FTS5 including note titles and content snippets.
- [x] **Given** search results, **When** I press Down Arrow + Enter, **Then** I navigate to the selected note in the editor.
- [x] **Given** the palette, **When** I type `>`, **Then** I see available commands (e.g., "Create New Note", "Data Management").
- [x] **NFR**: Search results must be returned in <100ms.
- [x] **UX**: Follow "Functional Precision" design (1px borders, no shadows/blurs, sharp edges, JetBrains Mono for metadata).

## Developer Context
### Architecture & Design
- **Frontend**: Use `cmdk` for the palette implementation.
- **Library**: `lucide-react` for icons.
- **UI Architecture**: Place `CommandPalette` at the root level (e.g., in `App.tsx` or `Layout.tsx`) so it's globally accessible.
- **Backend**: Implement a Rust command `search_notes` in `src-tauri/src/commands/data.rs` or a dedicated search module.
- **Database**: Use the existing `notes_fts` table created in `db_service.rs`.

### Technical Guardrails
- **Design System**: Hard edges (no `rounded`), 1px borders (`border-zinc-200` light / `border-zinc-800` dark).
- **Typography**: Inter for titles, JetBrains Mono for snippets/IDs.
- **Performance**: Use `Debounce` (300ms) for search input to prevent overloading the IPC bridge during rapid typing.
- **FTS5 Query**: Use `SNIPPET(notes_fts, 1, '...', '...', '...', 10)` to get contextually relevant highlights.

## Tasks
- [x] **Backend (Rust)**
    - [x] Implement `search_notes` command in Rust.
    - [x] Query `notes_fts` using FTS5 match syntax.
    - [x] Return a `Vec<SearchResult>` struct (id, title, snippet).
    - [x] Register command in `main.rs`.
- [x] **Frontend (React)**
    - [x] Install/Verify `cmdk` dependency.
    - [x] Create `CommandPalette.tsx` in `src/features/retrieval/components/`.
    - [x] Implement global key listener for `Cmd/Ctrl+K`.
    - [x] Style using "Functional Precision" (1px borders, hard edges, dark/light themes).
    - [x] Integrate `search_notes` IPC call with debouncing.
    - [x] Implement note navigation logic on selection.
    - [x] (Bonus) Support command mode with `>` prefix.

## Dev Agent Record (Debug Log)
- Initializing story from Epic 2.
- FTS5 infrastructure already exists in `db_service.rs`.
- `cmdk` is already in `package.json`.
- Refined FTS5 query in `search_service.rs` to fix invalid leading wildcard syntax.
- Integrated JetBrains Mono and Inter fonts from Google Fonts in `index.html`.
- Added custom highlight styles for `<mark>` tags in `index.css`.
- Verified `CommandPalette` integration in `App.tsx`.
- **Review Fixes Applied**:
    - Improved FTS5 query sanitization (alphanumeric filter).
    - Added missing `/settings` and `/notes/new` routes in `App.tsx`.
    - Created `Settings.tsx` placeholder page.
    - Fixed `CommandPalette.tsx` debounce (300ms), types (`String` -> `string`), and added loading spinner.
    - Standardized interaction styles (removed hover/aria mismatch).

### File List
- `src-tauri/src/services/search_service.rs` (Modified: search logic and sanitization)
- `src/features/retrieval/components/CommandPalette.tsx` (Modified: UI fixes, types, debounce)
- `src/app/App.tsx` (Modified: Routing updates)
- `src/app/pages/Settings.tsx` (New: Settings page placeholder)
- `index.html` (Modified: Font loading)
- `src/index.css` (Modified: Custom styles)

## Completion Notes
The Full-Text Search and Command Palette feature is now fully complete and verified. 
- Fast global search (Cmd+K) using SQLite FTS5.
- "Functional Precision" design with sharp edges and premium typography (Inter/JetBrains Mono).
- Smart highlighting in search snippets using custom `<mark>` styles.
- Integrated command mode (`>` prefix) with functional routing for all system actions.

## Change Log
- 2025-12-31: Story created and marked ready-for-dev.
- 2025-12-31: Completed implementation.
- 2025-12-31: Peer review auto-fixes applied (Routing, Types, Sanitization).
