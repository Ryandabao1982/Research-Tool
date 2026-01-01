# Story 2.4: Contextual Sidebar (Ambient AI)

Status: review

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

- [x] **Task 1: Create ContextualSidebar Component** (AC: #1)
  - [x] Subtask 1.1: Create `ContextualSidebar.tsx` in `src/features/retrieval/components/`
  - [x] Subtask 1.2: Implement debounce hook (2-second delay) for typing pause detection
  - [x] Subtask 1.3: Create RelatedNoteItem component with FTS5 snippet highlighting
      ```tsx
      // Render highlighted snippet using dangerouslySetInnerHTML
      <div 
        dangerouslySetInnerHTML={{ __html: note.snippet }}
        className="text-gray-300 text-sm leading-relaxed"
      />
      ```
  - [x] Subtask 1.4: Implement click handler for side-by-side view navigation
- [x] **Task 2: Backend - Related Notes Search** (AC: #1, #3)
  - [x] Subtask 2.1: Create `get_related_notes` command in `src-tauri/src/commands/related_notes.rs`
  - [x] Subtask 2.2: Extract keywords from current note content (split by spaces, remove special chars)
      ```rust
      // Simple extraction for MVP (FTS5 handles tokenization automatically)
      let keywords = note_content
          .split_whitespace()
          .into_iter()
          .filter(|k| !k.is_empty())
          .take(5)
          .map(|k| k.to_string())
          .collect::<Vec<_>>();
      ```
  - [x] Subtask 2.3: Return top 5-10 related notes with snippet highlighting
  - [x] Subtask 2.4: Ensure <500ms query performance (FTS5 is already optimized)
- [x] **Task 3: Integrate into NotesPage Layout** (AC: #1, #2)
  - [x] Subtask 3.1: Add ContextualSidebar to NotesPage right sidebar
  - [x] Subtask 3.2: Connect typing pause detection to sidebar update trigger
  - [x] Subtask 3.3: Implement side-by-side view layout (or toggle for replace mode)
  - [x] Subtask 3.4: Handle note switching and editor state management
- [x] **Task 4: Settings Integration** (AC: #2)
  - [x] Subtask 4.1: Add preference for "side-by-side" vs "replace" view in metadata
  - [x] Subtask 4.2: Store preference in notes table metadata column or settings table
  - [x] Subtask 4.3: Apply preference when clicking related note
- [x] **Task 5: Testing & Refinement** (NFR: #3)
  - [x] Subtask 5.1: Measure search performance (target <500ms)
  - [x] Subtask 5.2: Verify debounce timing (2-second delay accuracy)
  - [x] Subtask 5.3: Test with various note content types (short, long, technical)

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
- **Performance Target:** <500ms query (FTS5 is already optimized with indexes)

**Integration Patterns:**
- **Tauri IPC:** `invoke('get_related_notes', { note_content, limit: 10 })`
- **NoteForm Integration:** Detect typing activity and trigger debounce hook
- **Layout Integration:** Add ContextualSidebar to right side of NotesPage (similar to SynthesisPanel)

### Component Structure & Interface Definitions

```typescript
// Interface for Related Note
interface RelatedNote {
  id: string;
  title: string;
  snippet: string;  // Highlighted excerpt from FTS5
}

// Props for ContextualSidebar
interface ContextualSidebarProps {
  relatedNotes: RelatedNote[];
  isLoading: boolean;
  onNoteClick: (noteId: string) => void;
}
```

### Side-by-Side View Implementation

**Design Decision:** Create split-screen layout for side-by-side view when user clicks related note.

**Implementation Approach:**
1. **State Management:** Use new local state in NotesPage to track `viewMode: 'single' | 'split'`
2. **Layout Structure:** 
   - Single view: Current editor + NoteList layout (existing)
   - Split view: Editor on left (60%), selected note on right (40%)
3. **Note Switching:** When clicking related note from sidebar:
   - If currently single view → Transition to split view with new note on right
   - If already split view → Replace right panel with clicked note
4. **Responsive Design:** On mobile (<768px), collapse to single view or use stack

**Expected Layout (Split View):**
```tsx
<div className="flex h-full">
  <div className="w-[60%] h-full">{/* Editor + NoteList */}</div>
  <div className="w-[40%] h-full border-l border-white/10">
    <NoteForm note={selectedNote} />
  </div>
</div>
```

### Error Handling & Edge Cases

**Error Scenarios to Handle:**

1. **Empty Search Results:**
   - Show UI message: "No related notes found"
   - Prevent display of empty list component

2. **FTS5 Search Failures:**
   - Catch in Tauri command with try-catch
   - Display error message in sidebar
   - Log to console for debugging

3. **IPC Communication Failures:**
   - Add timeout handling (5 second max)
   - Show retry button on failure
   - Graceful degradation: Continue typing if sidebar fails

4. **Empty Current Note:**
   - Don't trigger related search if current note has no content
   - Show placeholder in sidebar: "Type to see related notes"

5. **Special Characters in Content:**
   - Sanitize input before FTS5 query (use existing sanitize pattern)
   - Handle markdown formatting characters (*, _, #)

**Loading States:**
```typescript
const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Source Tree Components to Touch

**New Files:**
- `src/features/retrieval/components/ContextualSidebar.tsx` (primary component)
- `src/shared/hooks/useTypingPause.ts` (custom debounce hook)
- `src-tauri/src/commands/related_notes.rs` (backend command, if needed)
- `src-tauri/src/services/search_service.rs` (add `get_related_notes()` function)

**Modified Files:**
- `src/app/pages/NotesPage.tsx` (add ContextualSidebar integration, view mode state)
- `src/features/retrieval/components/NoteForm.tsx` (integrate typing pause detection)
- `src-tauri/src/services/search_service.rs` (add related notes search function)

### Backend Implementation Examples

**Tauri Command Signature (related_notes.rs):**
```rust
#[tauri::command]
pub async fn get_related_notes(
    state: State<'_, DbState>,
    note_content: String,
    limit: usize,
) -> Result<Vec<RelatedNote>, String>
```

**SQL Query for Related Notes (add to search_service.rs):**
```sql
SELECT 
    n.id, 
    n.title, 
    snippet(notes_fts, 1, '<mark>', '</mark>', '...', 10) as snippet
FROM notes n 
JOIN notes_fts f ON n.internal_id = f.rowid 
WHERE notes_fts MATCH ? 
    AND n.id != ?  -- Exclude current note
LIMIT ?
```

**Frontend Component Structure (ContextualSidebar.tsx):**
```tsx
export function ContextualSidebar({ 
  relatedNotes, 
  isLoading, 
  onNoteClick 
}: ContextualSidebarProps) {
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col space-y-2">
      <h2 className="text-white text-lg font-bold">Related Notes</h2>
      {relatedNotes.length === 0 ? (
        <p className="text-gray-400 text-sm">No related notes found</p>
      ) : (
        relatedNotes.map((note) => (
          <RelatedNoteItem 
            key={note.id} 
            note={note} 
            onClick={() => onNoteClick(note.id)} 
          />
        ))
      )}
    </div>
  );
}
```

### Testing Standards Summary

- **Frontend Testing:** Vitest for component behavior and debounce timing
- **Integration Testing:** Verify 2-second debounce triggers sidebar updates
- **Performance Testing:** Measure FTS5 query times (<500ms requirement)
- **UX Testing:** Test side-by-side view interaction and note switching
- **Coverage Goal:** >90% for frontend logic (per project standards)

### Test Scenarios

**Edge Cases:**
- **Empty search results:** Display "No related notes found" message
- **Single character input:** Test with single keyword (should work via FTS5)
- **Special characters:** Test with markdown syntax (*, _, #) - ensure sanitization handles
- **Empty current note:** Don't trigger search if current note has no content
- **Large database (10k+ notes):** Verify performance target (<500ms still met)
- **Rapid typing:** Test debounce timing - ensure 2-second delay before triggering
- **Content types:** Test with markdown, HTML tags, code blocks for snippet accuracy

**Result States:**
- No results: Show placeholder UI
- Loading: Show spinner during <500ms query
- Error: Display error message + retry button
- Success: Display list with 5-10 related notes

**UX Interaction Tests:**
- Clicking related note → Transitions to split view
- Note switching → Updates editor in split view
- Close button → Returns to single view
- View mode toggle → Persists preference

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

- **2026-01-01**: Implemented ContextualSidebar component with FTS5 snippet highlighting
- **2026-01-01**: Created useTypingPause hook (2-second debounce for typing pause detection)
- **2026-01-01**: Added get_related_notes Rust command in search_service.rs
- **2026-01-01**: Integrated ContextualSidebar into NotesPage with split-view layout
- **2026-01-01**: Added metadata storage commands for view mode preferences
- **2026-01-01**: Created useSidebarSettings hook for managing preferences
- **2026-01-01**: Code review fixes applied:
  - Added proper keyboard typing detection (onContentChange callback)
  - Added current_note_id parameter to exclude current note from results
  - Removed duplicate dead code from search_service.rs
  - Added XSS sanitization for FTS5 snippets
  - Wrote comprehensive tests for ContextualSidebar and useTypingPause

### Implementation Notes

**Architecture Decisions:**
1. Used FTS5 keyword-based search (vector similarity planned for Epic 4)
2. 2-second debounce delay for typing pause detection
3. 60/40 split view for side-by-side note comparison
4. Metadata column in notes table for storing view preferences

**Performance Optimizations:**
- FTS5 is already indexed and optimized for <500ms queries
- Debouncing prevents excessive API calls during typing
- Snippet highlighting uses FTS5 snippet() function

**Error Handling:**
- Graceful degradation when sidebar fails (continue typing)
- Empty state messaging for no related notes
- IPC timeout handling (5 second max)

### File List

**New Files:**
- `src/features/retrieval/components/ContextualSidebar.tsx` (primary component)
- `src/features/retrieval/components/ContextualSidebar.test.tsx` (component tests)
- `src/features/retrieval/components/ContextualSidebar.edge-cases.test.tsx` (edge case tests)
- `src/shared/hooks/useTypingPause.ts` (custom debounce hook)
- `src/shared/hooks/useSidebarSettings.ts` (settings management)
- `src/shared/hooks/index.ts` (updated exports)
- `src-tauri/src/commands/related_notes.rs` (Tauri command)
- `src-tauri/src/commands/data_settings.rs` (metadata commands)
- `src-tauri/src/commands/mod.rs` (module exports)
- `src-tauri/migrations/0004_add_notes_metadata.sql` (database migration)

**Modified Files:**
- `src/app/pages/NotesPage.tsx` (ContextualSidebar integration, view mode state)
- `src-tauri/src/services/search_service.rs` (get_related_notes function)
- `src-tauri/src/main.rs` (command registration)

### Change Log

- **2026-01-01**: Initial implementation of ContextualSidebar feature
- **2026-01-01**: Added FTS5-based related notes search backend
- **2026-01-01**: Integrated sidebar with NotesPage layout
- **2026-01-01**: Added view mode preference storage via metadata
