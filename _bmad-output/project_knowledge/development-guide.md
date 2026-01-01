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

### Local AI Model Management
The application manages its own LLM models via the `local_llm` service. 
- Models and tokenizers are stored in the `{project-root}/resources/` directory.
- On the first AI query, the system will automatically download the **Qwen 2.5 0.5B** model (~350MB).
- You can manually reset or view the status of the model via the **Settings > Intelligence** page.

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
*Last Updated: 2026-01-01*
