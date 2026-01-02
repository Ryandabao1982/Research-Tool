# Story 1.5: Rapid Capture Modal (Alt+Space)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to capture thoughts instantly from anywhere,
so that I can offload ideas without interrupting my workflow.

## Acceptance Criteria

1. [ ] **Given** any application context, **When** I press `Alt+Space`, **Then** a frameless capture modal opens instantly (<50ms).
2. [ ] **Given** a capture modal, **When** I type content, **Then** it auto-expands vertically to fit content.
3. [ ] **Given** a capture modal, **When** I press `Enter`, **Then** a note is saved with a generated title and modal closes.
4. [ ] **Given** a capture modal, **When** I press `Esc`, **Then** the modal closes without saving.
5. [ ] **Given** a note is saved, **When** I return to the app, **Then** the note appears in Recent Notes.
6. [ ] **NFR:** The entire capture flow from keyboard shortcut to saved note must complete in <200ms.
7. [ ] **NFR:** Modal must work even when app is running in background.

## Tasks / Subtasks

- [ ] Backend (Rust)
  - [ ] Add global keyboard shortcut registration for Alt+Space (AC: #1)
  - [ ] Create Tauri command for quick note creation (AC: #3, #5)
  - [ ] Implement auto-title generation from first line of content (AC: #2)
  - [ ] Add folder assignment from context or last used folder (AC: #2)
  - [ ] Ensure modal command works when app is in background (AC: #7)

- [ ] Frontend (React)
  - [ ] Create global keyboard event listener for Alt+Space (AC: #1)
  - [ ] Implement frameless capture modal component (AC: #1)
  - [ ] Add auto-vertical expansion based on content height (AC: #2)
  - [ ] Implement Enter key to save and close modal (AC: #3)
  - [ ] Implement Esc key to close without saving (AC: #4)
  - [ ] Add note to Recent Notes after save (AC: #5)
  - [ ] Performance: Ensure modal opens in <50ms, completes capture in <200ms (AC: #6)

## Dev Notes

### Architecture & Design

- **Frontend**: New global keyboard infrastructure
- **Backend**: Leverage existing `note_service.rs` for note creation
- **Design System**: Follow "Rational Grid" - frameless modal, 1px borders, minimal chrome
- **State Management**: Use existing note patterns and Zustand stores

### Technical Guardrails

- **Global Keyboard**: Use Tauri `globalShortcutEvent` listener or React `useGlobalKeyboard` hook
- **Modal Design**: Frameless, centered, minimal decoration (no header/footer)
- **Auto-Title**: Generate from first non-empty line or "Untitled Note" if empty
- **Folder Context**: Detect user's current folder context or use last accessed folder
- **Performance**: Open modal <50ms, save <150ms, complete capture <200ms total
- **Background Mode**: Register keyboard shortcut even when window is not focused
- **Recent Notes**: Add new note to beginning of recent notes list

### Implementation Strategy

**Backend (Rust):**
1. Extend `note_service.rs` with quick_create method:
   ```rust
   #[tauri::command]
   pub async fn quick_create_note(content: String) -> Result<Note, String>
   ```
2. Auto-title generation logic:
   ```rust
   let title = if let Some(first_line) = content.lines().next() {
     first_line.trim()
   } else {
     "Untitled Note".to_string()
   };
   ```
3. Return note ID and auto-navigate signal

**Frontend (React):**
1. Global keyboard hook:
   ```typescript
   const { registerShortcut } = useGlobalKeyboard();
   
   useEffect(() => {
     registerShortcut('Alt+Space', (e) => {
       e.preventDefault();
       openCaptureModal();
     });
   }, []);
   ```
2. Capture modal component:
   ```typescript
   const CaptureModal = () => {
     const [content, setContent] = useState('');
     const [isExpanded, setIsExpanded] = useState(false);
     
     return (
       <dialog open={isOpen} onOpenChange={handleClose}>
         <textarea
           className="w-full h-full resize-none"
           style={{ 
             height: isExpanded ? 'auto' : '150px',
             transition: 'height 0.2s ease-out'
           }}
           value={content}
           onChange={(e) => setContent(e.target.value)}
           onKeyDown={handleKeyDown}
         />
       </dialog>
     );
   };
   ```
3. Enter key handler:
   ```typescript
   const handleEnter = async (e) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       const title = generateTitle(content);
       await invoke('quick_create_note', { content, title });
       addToRecentNotes(result);
       closeModal();
     }
   };
   ```
4. Esc key handler:
   ```typescript
   const handleEsc = (e) => {
     if (e.key === 'Escape') {
       closeModal();
     }
   };
   ```
5. Auto-expansion:
   ```typescript
   useEffect(() => {
     if (isOpen) {
       const lines = content.split('\n').length;
       setIsExpanded(lines > 1);
     }
   }, [content]);
   ```

### Project Structure Notes

- **New Backend**: Extend `src-tauri/src/services/note_service.rs` (already exists)
- **New Tauri Command**: `src-tauri/src/commands/quick_commands.rs` (New: Global shortcuts)
- **New Frontend Hook**: `src/shared/hooks/useGlobalKeyboard.ts` (New: Global keyboard registration)
- **New Frontend Component**: `src/app/components/CaptureModal.tsx` (New: Frameless capture modal)
- **No database changes needed**: Uses existing notes table
- **Alignment**: Builds on existing note service patterns from story 1.2

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 - Story 1.5] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#IPC Bridge & Communication] - Tauri Command pattern
- [Source: _bmad-output/implementation-artifacts/1-2-core-note-management-crud.md] - Note creation patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Experience Mechanics] - Keyboard-first interaction patterns

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] Extend `note_service.rs` with `quick_create_note()` method
- [ ] Implement auto-title generation from first line
- [ ] Add folder detection from user context
- [ ] Create Tauri command `quick_create_note(content)`
- [ ] Test global shortcut registration in background mode

**Frontend Implementation:**
- [ ] Create `useGlobalKeyboard` hook for Alt+Space registration
- [ ] Implement `CaptureModal` component with frameless design
- [ ] Add auto-vertical expansion based on content
- [ ] Implement Enter key handler for quick save
- [ ] Implement Esc key handler for close without saving
- [ ] Add note to Recent Notes after successful capture
- [ ] Performance: Modal opens <50ms, saves <150ms, completes in <200ms

**Technical Notes:**
- [ ] Tauri global shortcut API used for background event listening
- [ ] Frameless modal with minimal chrome decoration
- [ ] Auto-expansion uses CSS transition (0.2s ease-out)
- [ ] Title generation: first line or "Untitled Note"
- [ ] Folder context detection from current view

### File List

- src-tauri/src/services/note_service.rs (Modified: Add quick_create method)
- src-tauri/src/commands/quick_commands.rs (New: Global shortcuts)
- src/shared/hooks/useGlobalKeyboard.ts (New: Global keyboard registration hook)
- src/app/components/CaptureModal.tsx (New: Frameless capture modal)
- src-tauri/src/lib.rs (Modified: Register global shortcuts)
- src/app/App.tsx (Modified: Add CaptureModal integration)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Implement quick_create_note and global shortcuts
3. Frontend: Build frameless CaptureModal with auto-expansion
4. Test: Verify Alt+Space works in background, complete capture <200ms
5. Code review: Validate against acceptance criteria
