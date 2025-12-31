# Story 1.3: Hierarchical Organization

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to organize notes into folders and apply tags,
so that I can structure my knowledge base effectively.

## Acceptance Criteria

1. [x] **Given** the sidebar, **When** I click "New Folder", **Then** a folder is created in the DB.
2. [x] **Given** a note, **When** I drag it into a folder, **Then** its `folder_id` is updated.
3. [x] **Given** a note, **When** I type `#tag`, **Then** a new entry is created in the `tags` table and linked to the note. (Note: Implementation should support many-to-many relationship).
4. [x] **Given** the sidebar, **When** I expand a folder, **Then** I see its nested notes and subfolders.

## Tasks / Subtasks

- [ ] **Backend (Rust)**
  - [ ] Implement `create_folder` command to insert into `folders` table.
  - [ ] Implement `update_note_folder` command to update `folder_id` on a note.
  - [ ] Implement `get_folders` command to list all folders with hierarchy support (if nested).
  - [ ] Implement Tag management: `create_tag`, `link_tag_to_note`, `get_note_tags`.
  - [ ] Update `db_service.rs` to include `folders` and `tags` (and join table `note_tags`) tables.
- [ ] **Frontend (React)**
  - [ ] Create `FolderTree` component in `src/shared/components/`.
  - [ ] Update Sidebar to include "New Folder" action and render `FolderTree`.
  - [ ] Implement drag-and-drop logic for moving notes into folders (use a library like `dnd-kit` or native browser DND).
  - [ ] Create `TagInput` component for managing tags on a note.
  - [ ] Integrate with `useNotesStore` to handle folder and tag state updates.

## Dev Notes

- **Architecture Pattern**: Shared-Nothing Multi-Part Architecture. Use Tauri IPC for all database operations.
- **Database Schema**: 
  - `folders`: `id (text)`, `name (text)`, `parent_id (text, optional)`.
  - `tags`: `id (text)`, `name (text)`.
  - `note_tags`: `note_id (text)`, `tag_id (text)`.
- **UI Architecture**: Sidebar handles global navigation and organization. Follow "Functional Precision" design system.
- **Design System**: 1px borders, hard edges, JetBrains Mono for metadata (tags/IDs).

### Project Structure Notes

- **Backend**: Rust commands should be in `src-tauri/src/commands/` and registered in `main.rs`.
- **Frontend**: Components in `src/shared/components/` or feature-specific folders if applicable.

### References

- [Source: planning-artifacts/epics.md#Story 1.3]
- [Source: planning-artifacts/ux-design-specification.md#Rational Grid]
- [Source: src-tauri/src/services/db_service.rs]

## Dev Agent Record

### Agent Model Used

Antigravity (GPT-4o)

### Debug Log References

### Completion Notes List

### File List
