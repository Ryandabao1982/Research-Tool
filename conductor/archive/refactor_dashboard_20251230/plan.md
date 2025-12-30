# Plan: Refactor Dashboard

## Phase 1: Structure & Layout [checkpoint: 228d540]
- [x] Task: specificy and create `Dashboard` component structure. eeec0fb
    - [x] Write tests for Dashboard rendering.
    - [x] Implement basic layout with header and grid container.
- [x] Task: Implement Quick Actions widget. 228d540
    - [x] Write tests for action buttons.
    - [x] Implement "New Note", "Search" buttons with icons.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Structure & Layout' (Protocol in workflow.md)

## Phase 2: Data Integration [checkpoint: 4a13ae6]
- [x] Task: Connect Dashboard to `useNotes` store. 4a13ae6
    - [x] Write tests for data loading state.
    - [x] Fetch recent notes and stats.
- [x] Task: Implement Recent Notes widget. 4a13ae6
    - [x] Write tests for empty and populated states.
    - [x] Implement card list for recent notes.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Data Integration' (Protocol in workflow.md)

## Phase 3: Visual Polish [checkpoint: 4f911ba]
- [x] Task: Add Framer Motion animations and refine Glassmorphism styling. 4f911ba
    - [x] Add entrance animations to widgets.
    - [x] Refine gradients, shadows, and borders.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Visual Polish' (Protocol in workflow.md)