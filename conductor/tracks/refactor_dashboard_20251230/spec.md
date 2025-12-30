# Specification: Refactor Dashboard

## Overview
Refactor the existing `Dashboard` (or home page) to provide a visually appealing, functional, and "production-ready" entry point for the application. It should align with the "Atmospheric Glassmorphism" design guidelines.

## User Stories
- As a user, I want a welcoming dashboard that shows me my recent activity.
- As a user, I want quick access to creating notes, searching, and viewing stats.
- As a user, I want the dashboard to look polished and professional, not like a CLI or prototype.

## Functional Requirements
1.  **Recent Notes:** Display a list or grid of recently modified notes.
2.  **Quick Actions:** Buttons for "New Note", "Search", "Graph View".
3.  **Stats:** Simple counters for Total Notes, Tags, etc.
4.  **Navigation:** Clear navigation to other parts of the app (Notes, Settings).

## Technical Requirements
-   Refactor `src/app/pages/index.tsx` (or `Dashboard.tsx` if it exists).
-   Use `framer-motion` for entrance animations.
-   Use `lucide-react` for icons.
-   Use `NoteService` (or `useNotes` hook) to fetch data.

## Design Guidelines
-   **Glassmorphism:** Use `bg-white/10`, `backdrop-blur`, and borders.
-   **Typography:** Large, clear headings.
-   **Layout:** Grid-based layout for widgets/cards.
