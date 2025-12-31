# Source Tree Analysis

This document provides a guided tour of the **KnowledgeBase Pro** codebase, highlighting critical directories and implementation patterns.

## Directory Structure

```text
secondbrain/
├── .agent/              # AI Agent configurations
├── conductor/           # Product guidelines and project tracking
├── docs/                # Technical specifications and guides
├── plans/               # Project and feature plans
├── src/                 # Frontend (React/Vite) application
│   ├── app/             # Application shell, routing, and layout
│   │   ├── components/  # Layout atoms (Sidebar, TopBar)
│   │   ├── pages/       # Main view entry points (Dashboard, Notes)
│   │   └── styles/      # Tailwind and Global CSS
│   ├── features/        # Business logic organized by domain
│   │   ├── ai/          # Synthesis panel and AI interactions
│   │   └── notes/       # Note listing and editor components
│   └── shared/          # Reusable hooks, utils, and atoms
│       ├── components/  # Atomic UI elements (NoteForm, Modals)
│       ├── hooks/       # Global stores (useSelectionStore)
│       └── services/    # Frontend-side service abstractions
├── src-tauri/           # Native Backend (Rust)
│   ├── src/
│   │   ├── commands/    # IPC Bridge (Tauri Command Handlers)
│   │   └── services/    # Native logic (Synthesis, Storage)
│   └── tauri.conf.json  # Tauri app configuration
└── package.json         # Project manifests and dependencies
```

## Critical Files

| Path | Purpose |
| :--- | :--- |
| `src/main.tsx` | Frontend entry point. |
| `src-tauri/src/main.rs` | Backend entry point. |
| `src/app/App.tsx` | Main routing and provider setup. |
| `src-tauri/src/commands/ai.rs` | AI synthesis IPC bridge. |
| `src/shared/hooks/useSelectionStore.ts` | Note selection global state. |

## Implementation Patterns

- **Feature-Based Modularity**: Logic is encapsulated within `src/features/` to ensure scalability.
- **IPC Bridge**: High-performance interaction between JS and Rust via Tauri commands.
- **Atmospheric Styling**: Tailwind layers used to define glassmorphism and depth shadows in `index.css`.

---
*Last Updated: 2025-12-31*
