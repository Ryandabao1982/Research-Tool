# Development Guide

This guide provides the necessary instructions to set up, develop, and test **KnowledgeBase Pro**.

## Prerequisites

- **Node.js**: >= 20.0.0 (pnpm recommended)
- **Rust Toolchain**: Latest stable (via rustup)
- **C/C++ Build Tools**: Required for Tauri native compilation

## Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Launch Development Environment**:
   ```bash
   pnpm tauri dev
   ```
   This command starts the Vite dev server and the Tauri native window simultaneously.

## Development Workflow

- **Frontend Development**: Use `pnpm dev` for rapid UI iteration (hot-reloading enabled).
- **Native Backend**: Modify Rust files in `src-tauri/src`. Tauri will automatically recompile and restart the app on change.
- **Linting & Formatting**:
  ```bash
  pnpm lint
  pnpm format
  ```

## Testing Strategy

- **Frontend Tests**: Vitest + React Testing Library.
  ```bash
  pnpm test
  ```
- **Backend Tests**: Rust native tests.
  ```bash
  cd src-tauri
  cargo test
  ```

## Environment Configuration

- Copy `.env.example` to `.env` (if applicable) to configure AI API keys and other environment-specific variables.

---
*Last Updated: 2025-12-31*
