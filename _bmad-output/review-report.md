**🔥 CODE REVIEW FINDINGS, Ryan!**

**Story:** `1-4-markdown-editor-with-live-preview.md`
**Git vs Story Discrepancies:** 1 found
**Issues Found:** 2 High, 1 Medium, 2 Low

## 🔴 CRITICAL ISSUES
- **Broken Navigation (AC3 Failed)**: `MarkdownPreview.tsx` implements WikiLinks as React Router `<Link>`s to `/notes/Title`. However, `App.tsx` does NOT have a route for `/notes/:id` or `/notes/:title`. `NotesPage` uses `selectedNoteId` state to open notes, not URL parameters. Clicking a link will likely break the app or do nothing.
- **Title vs UUID Mismatch**: WikiLinks rely on Titles (`[[My Note]]`), but the system uses UUIDs (`note.id`). There is no logic implemented to resolve a Title to a UUID to open the correct note.
- **Missing "Prompt to Create" (AC3 Failed)**: Because the navigation is broken, the required logic to "prompt to create if it doesn't exist" is completely missing.

## 🟡 MEDIUM ISSUES
- **Story Discrepancy**: Story File List includes `useNotesStore.ts`, implying changes were needed (likely for Title->ID lookup), but `git status` shows this file was NOT modified. This confirms the missing logic.
- **Regex Edge Cases**: The regex `\[\[(.*?)\]\]` is simplistic and may fail on complex nested structures, though likely acceptable for MVP.

## 🟢 LOW ISSUES
- **Styling**: Links have `border-b` which simulates underline, but Tailwind `underline` utility might be cleaner/more standard.
- **Import Optimization**: `rehype-highlight` is used, but `index.css` manually imports `highlight.js` styles. This is fragile; better to modularize or document.

This is a **BLOCKING** review. The Navigation feature (Task 2) is fundamentally broken due to architecture mismatch.
