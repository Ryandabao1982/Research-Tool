# Story 2.1: Full-Text Search with Command Palette

**Status: ready-for-dev**

## Story
**As a** Power User,
**I want** to search my entire knowledge base with a keyboard shortcut,
**So that** I can find information without taking my hands off the keyboard.

## Acceptance Criteria
- [ ] **Given** any screen, **When** I press `Cmd/Ctrl+K`, **Then** the Command Palette modal opens instantly (<100ms).
- [ ] **Given** the palette, **When** I type a query, **Then** I see results from SQLite FTS5 including note titles and content snippets.
- [ ] **Given** search results, **When** I press Down Arrow + Enter, **Then** I navigate to the selected note in the editor.
- [ ] **Given** the palette, **When** I type `>`, **Then** I see available commands (e.g., "Create New Note", "Data Management").
- [ ] **NFR**: Search results must be returned in <100ms.
- [ ] **UX**: Follow "Functional Precision" design (1px borders, no shadows/blurs, sharp edges, JetBrains Mono for metadata).

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
- [ ] **Backend (Rust)**
    - [ ] Implement `search_notes` command in Rust.
    - [ ] Query `notes_fts` using FTS5 match syntax.
    - [ ] Return a `Vec<SearchResult>` struct (id, title, snippet).
    - [ ] Register command in `main.rs`.
- [ ] **Frontend (React)**
    - [ ] Install/Verify `cmdk` dependency.
    - [ ] Create `CommandPalette.tsx` in `src/features/retrieval/components/`.
    - [ ] Implement global key listener for `Cmd/Ctrl+K`.
    - [ ] Style using "Functional Precision" (1px borders, hard edges, dark/light themes).
    - [ ] Integrate `search_notes` IPC call with debouncing.
    - [ ] Implement note navigation logic on selection.
    - [ ] (Bonus) Support command mode with `>` prefix.

## Dev Agent Record (Debug Log)
- Initializing story from Epic 2.
- FTS5 infrastructure already exists in `db_service.rs`.
- `cmdk` is already in `package.json`.

## Completion Notes
(To be filled by Dev Agent)

## Change Log
- 2025-12-31: Story created and marked ready-for-dev.
