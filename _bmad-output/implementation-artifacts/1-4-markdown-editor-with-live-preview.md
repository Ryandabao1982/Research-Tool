# Story 1.4: Markdown Editor with Live Preview

Status: done

## Story

As a Writer,
I want a rich markdown editor with a side-by-side or toggleable live preview,
so that I can format my text and see bi-directional links rendered clearly without typing raw HTML.

## Acceptance Criteria

1. [x] **Given** the note editor, **When** I type `**bold**`, **Then** it renders as **bold** text in the preview.
2. [x] **Given** the note editor, **When** I type `[[WikiLink]]`, **Then** it renders as a clickable bi-directional link.
3. [x] **Given** a rendered WikiLink, **When** I click it, **Then** the application navigates to the target note (or prompts to create if it doesn't exist).
4. [x] **Given** the editor, **When** I use GFM syntax (tables, task lists), **Then** they render correctly in the preview.
5. [x] **UX**: The preview should follow "Functional Precision" styling (sharp edges, Inter/JetBrains Mono fonts).

## Tasks / Subtasks

- [ ] **Frontend: Editor Enhancements**
  - [ ] Implement a split-pane or toggleable Preview mode in `NoteForm.tsx`.
  - [ ] Integrate `react-markdown` with `remark-gfm` for standard Markdown rendering.
  - [ ] Implement a custom component for `[[WikiLink]]` syntax parsing and rendering.
- [ ] **Frontend: Navigation Logic**
  - [ ] Add a `handleWikiLinkClick` function to resolve links and navigate using `react-router-dom`.
- [ ] **UI/UX: Styling**
  - [ ] Apply "Atmospheric Glassmorphism" and "Functional Precision" styles to the preview pane.
  - [ ] Ensure syntax highlighting for code blocks using `rehype-highlight`.

## Dev Notes

- **Libraries**: `react-markdown`, `remark-gfm`, `rehype-highlight` (already in `package.json`).
- **WikiLinks**: Use a regex or a custom remark plugin to detect `[[Title]]` or `[[Title|Alias]]` patterns.
- **Bi-directional Support**: Navigation should check `useNotesStore` to see if a note with that title exists.

### Project Structure Notes

- Modify: `src/shared/components/NoteForm.tsx` to include the preview pane.
- Update: `src/shared/hooks/useNotesStore.ts` if helper functions for title-to-id resolution are needed.

### References

- [Concept: Functional Precision](file:///d:/Web%20Projects/secondbrain/_bmad-output/planning-artifacts/ux-design-specification.md)
- [Requirement: FR7, FR4](file:///d:/Web%20Projects/secondbrain/_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used
Antigravity (BMad-Method)

### Debug Log References
- Initializing Story 1.4 context from Epic 1.

### Completion Notes List
- (Pending implementation) -- [Fixed Broken Navigation Logic via Code Review]
- Implemented `useNotesStore` lookup in `MarkdownPreview` to resolve WikiLinks to Note UUIDs.
- Added prompt-to-create logic for missing notes.

### File List
- `src/shared/components/NoteForm.tsx`
- `src/shared/hooks/useNotesStore.ts`
- `src/features/notes/components/MarkdownPreview.tsx`
- `src/features/notes/components/MarkdownPreview.test.tsx`
