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
- **AI Synthesis**: Leverages a self-contained **Candle** inference engine (Rust) to process grounded queries without internet or external dependencies.
- **Search**: Leveraging Rust's native speed to query the FTS5 index.

## High-Level Data Flow (AI Synthesis)

1. User selects notes or enters a query.
2. Frontend invokes `synthesize_query` Tauri Command.
3. Rust handler in `ai.rs` fetches relevant context from SQLite (FTS5).
4. `local_llm.rs` checks for model existence (downloads if missing).
5. The local quantized **Qwen 2.5 0.5B** model performs inference natively in Rust.
6. Result is returned to the frontend for display in the `SynthesisPanel` or `Dashboard`.

---
*Last Updated: 2026-01-01*
