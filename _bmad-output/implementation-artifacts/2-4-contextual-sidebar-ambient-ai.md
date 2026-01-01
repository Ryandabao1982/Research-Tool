# Story 2.4: Contextual Sidebar (Ambient AI)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Writer,
I want to see related notes automatically while I type,
so that I can rediscover relevant past ideas without searching.

## Acceptance Criteria

1. [ ] **Given** I am typing in a note, **When** I pause for 2 seconds, **Then** Sidebar updates with "Related Notes" based on vector similarity or keyword matching.
2. [ ] **Given** sidebar, **When** I click a related note, **Then** it opens in a side-by-side view (or replaces current view based on settings).
3. [ ] **NFR:** Similarity search must happen locally or via highly optimized vector lookup (<500ms).

## Tasks / Subtasks

- [ ] **Task 1: Create ContextualSidebar Component** (AC: #1)
  - [ ] Subtask 1.1: Create `ContextualSidebar.tsx` in `src/features/retrieval/components/`
  - [ ] Subtask 1.2: Implement debounce hook (2-second delay) for typing pause detection
  - [ ] Subtask 1.3: Create RelatedNotes list component with FTS5 snippet highlighting
  - [ ] Subtask 1.4: Implement click handler for side-by-side view navigation
- [ ] **Task 2: Backend - Related Notes Search** (AC: #1, #3)
  - [ ] Subtask 2.1: Create `get_related_notes` command in `src-tauri/src/commands/data.rs`
  - [ ] Subtask 2.2: Use existing FTS5 search with keyword extraction from current note content
  - [ ] Subtask 2.3: Return top 5-10 related notes with snippet highlighting
  - [ ] Subtask 2.4: Ensure <500ms query performance (FTS5 is already optimized)
- [ ] **Task 3: Integrate into NotesPage Layout** (AC: #1, #2)
  - [ ] Subtask 3.1: Add ContextualSidebar to NotesPage right sidebar
  - [ ] Subtask 3.2: Connect typing pause detection to sidebar update trigger
  - [ ] Subtask 3.3: Implement side-by-side view layout (or toggle for replace mode)
  - [ ] Subtask 3.4: Handle note switching and editor state management
- [ ] **Task 4: Settings Integration** (AC: #2)
  - [ ] Subtask 4.1: Add preference for "side-by-side" vs "replace" view in metadata
  - [ ] Subtask 4.2: Store preference in notes table metadata column or settings table
  - [ ] Subtask 4.3: Apply preference when clicking related note
- [ ] **Task 5: Testing & Refinement** (NFR: #3)
  - [ ] Subtask 5.1: Measure search performance (target <500ms)
  - [ ] Subtask 5.2: Verify debounce timing (2-second delay accuracy)
  - [ ] Subtask 5.3: Test with various note content types (short, long, technical)

## Dev Notes

### Architecture & Design Patterns

**Frontend:**
- **Component Location:** `src/features/retrieval/components/ContextualSidebar.tsx`
- **State Management:** Use custom hook `useTypingPause` for 2-second debounce detection
- **UI Library:** Framer Motion for smooth transitions
- **Icons:** Lucide React (consistent with project)
- **Design System:** Atmospheric Glassmorphism (blur, gradients, glows)

**Backend:**
- **Command Location:** `src-tauri/src/commands/data.rs` or dedicated `src-tauri/src/commands/related_notes.rs`
- **Service Layer:** Extend `search_service.rs` with `get_related_notes()` function
- **Search Method:** Use existing FTS5 with `snippet()` for highlighting
- **Performance Target:** <500ms query (FTS5 already optimized with indexes)

**Integration Patterns:**
- **Tauri IPC:** `invoke('get_related_notes', { note_content, limit: 10 })`
- **NoteForm Integration:** Detect typing activity and trigger debounce hook
- **Layout Integration:** Add ContextualSidebar to right side of NotesPage (similar to SynthesisPanel)

### Source Tree Components to Touch

**New Files:**
- `src/features/retrieval/components/ContextualSidebar.tsx` (primary component)
- `src/shared/hooks/useTypingPause.ts` (custom debounce hook)
- `src-tauri/src/commands/related_notes.rs` (backend command, if needed)
- `src-tauri/src/services/search_service.rs` (add `get_related_notes()` function)

**Modified Files:**
- `src/app/pages/NotesPage.tsx` (add ContextualSidebar integration)
- `src/features/retrieval/components/NoteForm.tsx` (integrate typing pause detection)
- `src-tauri/src/services/search_service.rs` (add related notes search function)

### Testing Standards Summary

- **Frontend Testing:** Vitest for component behavior and debounce timing
- **Integration Testing:** Verify 2-second debounce triggers sidebar updates
- **Performance Testing:** Measure FTS5 query times (<500ms requirement)
- **UX Testing:** Test side-by-side view interaction and note switching
- **Coverage Goal:** >90% for frontend logic (per project standards)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Component follows `src/features/[feature]/components/` pattern
- ✅ Custom hooks in `src/shared/hooks/` pattern (consistent with useSelectionStore, useNotesStore)
- ✅ Rust commands in `src-tauri/src/commands/` pattern
- ✅ Services in `src-tauri/src/services/` pattern
- ✅ Using existing FTS5 infrastructure from `search_service.rs`

**Detected Conflicts or Variances:**
- ⚠️ **No Conflicts Detected:** This feature integrates naturally into existing architecture
- ℹ️ **Design Decision:** Using FTS5 keyword-based search instead of vector embeddings for MVP. Vector similarity (Epic 4, Story 4.1) can be added later as enhancement.
- ℹ️ **Layout Pattern:** Similar to SynthesisPanel (floating panel), ContextualSidebar can be integrated as right sidebar component

### References

- [Source: epics.md#Story-2.4] - User story and acceptance criteria
- [Source: project_knowledge/architecture.md#IPC-Bridge-&-Communication] - Tauri command patterns
- [Source: docs/design/database-architecture.md#Search-Engine-(FTS5)] - FTS5 optimization and snippet function
- [Source: implementation-artifacts/2-1-full-text-search-with-command-palette.md] - Previous story patterns (FTS5, CommandPalette integration)
- [Source: src/features/ai/components/SynthesisPanel.tsx] - Panel component pattern reference

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (via Anthropic API)

### Debug Log References

<!-- Add timestamps and notes during implementation -->

### Completion Notes List

<!-- Track what was completed, issues found, solutions applied -->

### File List

<!-- List all files created/modified during implementation -->
