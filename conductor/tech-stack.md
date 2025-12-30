# Technology Stack: KnowledgeBase Pro

## 🎨 Frontend
- **Framework:** React 18.3.1 (Functional components, Hooks)
- **Language:** TypeScript 5.6.2 (Strict mode)
- **Styling:** Tailwind CSS 3.4.12 with `tailwindcss-animate` and `clsx/tailwind-merge`
- **Build Tool:** Vite 5.4.7
- **Routing:** React Router 6.26.2
- **State Management:** 
  - **Global:** Zustand 4.5.5
  - **Server/Async:** TanStack Query v5
- **Animations:** Framer Motion 11.5.5
- **Visualization:** D3.js 7.9.0 (Knowledge Graph)
- **Icons:** Lucide React 0.451.0

## ⚙️ Backend (Desktop)
- **Core Framework:** Tauri 1.6.0 (Rust)
- **Language:** Rust 1.75+
- **Asynchronous Runtime:** Tokio 1.0
- **Serialization:** Serde / Serde JSON

## 🗄️ Data Persistence
- **Database:** SQLite 3.x
- **Search Engine:** SQLite FTS5 (Full-Text Search)
- **Database Toolkit:** SQLx 0.7 (Asynchronous, type-safe SQL)
- **Cloud Integration:** Firebase (Optional Data Connect for cross-device sync)

## 🤖 AI Integration
- **API Standard:** OpenAI-Compatible API (Supports OpenAI, local providers like LocalAI/vLLM, and any OAI-compatible gateway)
- **Local Provider:** Ollama (via direct integration or OAI-proxy)
- **Features:** Streaming responses, source-grounded citations, neural linking, and multi-document synthesis

## 🛠️ Infrastructure & Tools
- **Package Manager:** npm / pnpm
- **Code Quality:** ESLint 9.11.1, Prettier 3.3.3
- **Testing:** Vitest 2.1.1 (Frontend), `cargo test` (Backend)
- **Git Hooks:** Husky 9.1.6
