# Plan: NotebookLM-style Synthesis Feature

## Phase 1: Backend Service Layer
- [x] Task: Create `SynthesisService` in Rust for note bundling. 7b71085
    - [ ] Write tests for note bundling logic (multiple notes to single text block).
    - [ ] Implement `bundle_notes_content` in `src-tauri/src/services/ai_service.rs` (or new service).
- [x] Task: Implement `synthesize_notes` Tauri command. 2f3acf0
    - [ ] Write tests for the command handler mocking the AI response.
    - [ ] Implement the command in `src-tauri/src/commands/ai.rs`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Service Layer' (Protocol in workflow.md)

## Phase 2: Frontend Selection State & UI [checkpoint: 9f1cf05]
- [x] Task: Implement multi-select state in Zustand. 48c7681

    - [ ] Write unit tests for the selection store (add/remove/clear).
    - [ ] Create `useSelectionStore` in `src/shared/hooks/`.
- [x] Task: Update Note List to support multi-selection. 6935525
    - [ ] Write tests for the checkbox/selection logic in `NoteList`.
    - [ ] Implement selection checkboxes in the sidebar/note list components.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Selection State & UI' (Protocol in workflow.md)

## Phase 3: Synthesis Panel & AI Integration [checkpoint: dc631b6]
- [x] Task: Create the `SynthesisPanel` component. 485bb59
    - [ ] Write tests for the panel's rendering and empty states.
    - [ ] Implement the glassmorphic panel in `src/features/ai/components/`.
- [x] Task: Connect Synthesis Panel to Backend. 0226d61
    - [ ] Write integration tests for the `synthesize_notes` call from frontend.
    - [ ] Implement the trigger and streaming display in `SynthesisPanel`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Synthesis Panel & AI Integration' (Protocol in workflow.md)

## Phase 4: Refinement & Saving
- [x] Task: Implement "Save as Note" feature for generated content. f265f8f
    - [ ] Write tests for the save operation.
    - [ ] Implement the save button and backend call.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Refinement & Saving' (Protocol in workflow.md)
