# System Architecture

KnowledgeBase Pro is built on a high-performance **Tauri** foundations, utilizing **React** for its sophisticated UI and **Rust** for its robust native operations.

## Architecture Pattern

The application follows a **Shared-Nothing Multi-Part Architecture**:

- **Frontend (Renderer Process)**: A React-based SPA that handles the user interface, state management, and user interaction. It communicates with the backend solely through the Tauri IPC bridge.
- **Backend (Main Process)**: A Rust-based native core that handles file system access, SQLite persistence, and high-performance services (like AI synthesis bundling).

## Data Architecture

- **Primary Storage**: SQLite with FTS5 for lightning-fast full-text search.
- **State Management**:
  - **Zustand**: Used for global UI state, such as selection modes, modal toggles, and sidebar states.
  - **TanStack Query**: Used for data synchronization between the frontend and the Rust backend.

## IPC Bridge & Communication

All native functionality is exposed via **Tauri Commands**. This ensures that the frontend remains decoupled from the specific implementation details of the Rust services.

- **Note Syncing**: Commands for fetching, saving, and listing notes.
- **AI Synthesis**: Specialized commands for bundling note content and generating synthesis.
- **Search**: Leveraging Rust's native speed to query the FTS5 index.

## High-Level Data Flow

1. User selects notes in the `NoteList`.
2. `useSelectionStore` tracks the IDs in the frontend.
3. User clicks "Generate Synthesis" in `SynthesisPanel`.
4. Frontend invokes `synthesize_notes` Tauri Command.
5. Rust handler in `ai.rs` fetches content via `synthesis_service.rs`.
6. Result is streamed/returned to the frontend for display.

---
*Last Updated: 2025-12-31*
