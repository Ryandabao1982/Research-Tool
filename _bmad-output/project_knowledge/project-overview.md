# Project Overview: KnowledgeBase Pro

KnowledgeBase Pro is an AI-powered, local-first desktop knowledge management application designed for software developers and content creators. It combines the flexibility of block-based editing with advanced AI-driven research capabilities, all within a premium "Atmospheric Glassmorphism" interface.

## Core Value Proposition

- **True Offline Intelligence**: Zero internet dependency for AI operations. Inference occurs natively in Rust via the Candle framework.
- **Zero-Configuration**: Models are automatically managed, downloaded, and cached by the system on first run.
- **Local-First Privacy**: All data and AI operations occur on the user's machine using SQLite and local models.
- **Ambient Intelligence**: AI interactions are non-intrusive, living in collapsible sidebars and dedicated panels for synthesis and research.
- **Neural Linkage**: Visual concept mapping using interactive D3.js graph visualizations.

## Technology Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **State Management**| Zustand (Global), TanStack Query (Server) |
| **Editor** | Block-based with Markdown support |
| **Native Core** | Rust (Tauri), SQLite (FTS5) |
| **Data Flow** | Tauri IPC Bridge (Commands/Events) |

## Repository Structure

The project follows a multi-part architecture:

- **Root Directory**: Contains the React/Vite frontend application.
- **src-tauri/**: Contains the Rust backend, Tauri configuration, and native command handlers.
- **_bmad/**: Contains the BMAD (Basic Multi-Agent Deployment) configuration for AI-assisted development.

## Documentation Navigation

- [Architecture Guide](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide.md)
- [AI Synthesis Feature](./docs/notebooklm-features-integration.md) (Existing)

---
*Last Updated: 2026-01-01*
