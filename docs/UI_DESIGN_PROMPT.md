🎯 COMPREHENSIVE UI/UX DESIGN PROMPT FOR: AI Designer/Developer
PROJECT: KnowledgeBase Pro (SecondBrain)
TARGET: Power Users, Researchers, Developers
DELIVERABLES: Desktop App UI System + Component Library

📋 PROJECT OVERVIEW
Mission: Create a "Second Brain" operating system that feels like an extension of the user's mind. It must be blazing fast, visually stunning, and interaction-dense without being cluttered.
Core Purpose:
- Effortless capture of ideas and execution.
- Deep synthesis of knowledge via AI.
- Local-first privacy and speed.
- "Party Mode": Collaborative AI agent interactions.

**Technical Backend (READY):**
- **Core:** Rust (Tauri 2.0)
- **Frontend Framework:** React + TypeScript + Vite 5 + TailwindCSS
- **Database:** SQLite (Local FTS5 enabled)
- **State:** Zustand + React Query
- **Architecture:** Modular Plugin System

🎨 DESIGN SPECIFICATIONS
**Vibe:** "Cyberpunk Zen" / "Linear-esque" / "Glassmorphism"
**Theme Mode:** Dark Mode Only (Deep Space)

**Color Palette**
--brain-primary: #6366f1   /* Indigo 500 - Main Brand */
--brain-accent: #06b6d4    /* Cyan 500 - AI/Neural Actions */
--brain-surface: #0f172a   /* Slate 900 - Cards/Panels (Glass) */
--brain-void: #020617      /* Slate 950 - App Background */
--brain-text: #f8fafc      /* Slate 50 - Primary Text */
--brain-muted: #94a3b8     /* Slate 400 - Secondary/Icons */
--brain-success: #10b981   /* Emerald 500 - Synced/Saved */

**Typography**
- **UI:** 'Inter', sans-serif (400/500/600)
- **Code/Data:** 'JetBrains Mono', monospace (Ligatures enabled)
- **Scale:**
    - H1: 1.5rem (24px) - Compact Headers
    - Body: 0.875rem (14px) - Default
    - Tiny: 0.75rem (12px) - Meta data

**Effects & Materials**
- **Glass:** `backdrop-filter: blur(12px)` + `bg-slate-900/60`
- **Borders:** `1px solid rgba(255,255,255, 0.08)` (Subtle white noise)
- **Glows:** Usage of `box-shadow` for active states (Indigo/Cyan blooms)

🏗️ REQUIRED PAGES & LAYOUTS

1️⃣ NEURAL BAR (Quick Capture)
**Purpose:** Always-available floating bar for instant capture.
**Dimensions:** 600px x 80px (Resizable height)
**Window:** Frameless, Transparent, Always-on-top
**Layout:**
┌─────────────────────────────────────────────────────────────┐
│  [✨]  Ask Brain or Capture...                     [⏎]      │
└─────────────────────────────────────────────────────────────┘
- **Interaction:**
    - `Cmd+Space` to summon.
    - Type text -> "Enter" to save note.
    - Type `/` to switch mode (e.g., `/task`, `/ask`).
    - Smart badges appear as you type (e.g., `#idea`, `@agent`).

2️⃣ MAIN DASHBOARD ("The Cortex")
**Purpose:** Daily overview and entry point.
**URL:** `/`
**Layout:**
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar: Nav]       [Search Bar]           [Status: 🟢]    │
│                                                             │
│  Hello, Ryan.                                               │
│  🧠 Memory Index: 12,403 nodes | ⚡ Sync: Active            │
│                                                             │
│  ┌─ Recent Activity ──────┐  ┌─ Quick Actions ──────┐       │
│  │ • Updated "Project X"  │  │ [ + New Note ]       │       │
│  │ • AI Chat: "React..."  │  │ [ 🕸 Graph View ]    │       │
│  │ • 3 Tasks Due Today    │  │ [ 👥 Party Mode ]    │       │
│  │                        │  │                      │       │
│  └────────────────────────┘  └──────────────────────┘       │
│                                                             │
│  ┌─ "Recall" (Random Resurfacing) ───────────────────────┐  │
│  │ 📜 "Philosophy of Software Design" (2 months ago)     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

3️⃣ NOTE EDITOR ("Synapse")
**Purpose:** Distraction-free writing and reading.
**URL:** `/editor/:id`
**Features:**
- **Markdown Pro:** Syntax highlighting for code blocks (Prism), checklist support.
- **Split View:** Option for Source | Preview.
- **AI Sidebar (Collapsible):**
    - "Relevant Context" (RAG results) show up automatically on the right.
    - "Chat with Note" button.

4️⃣ KNOWLEDGE GRAPH
**Purpose:** Visual exploration of connections.
**URL:** `/graph`
**UI:**
- **Canvas:** Full screen WebGL/Canvas (D3/Cosmograph).
- **Controls:** Floating palette (Physics, Gravity, Search Nodes).
- **Node Style:** Glowing dots. Colors represent tags/categories.
- **Hover:** Popover card with note summary.

5️⃣ COMMAND PALETTE
**Purpose:** Keyboard-driven navigation.
**Trigger:** `Cmd+K`
**Layout:**
┌──────────────────────────────────────────────────────┐
│ 🔍 What do you need?                                 │
│──────────────────────────────────────────────────────│
│ 📄 Note: "Sprint Planning"                           │
│ ⚡ Command: "Create new Agent"                       │
│ ⚙️ Setting: "Toggle Dark Mode"                       │
│ 👥 Agent: "Switch to Developer Mode"                 │
└──────────────────────────────────────────────────────┘

6️⃣ PARTY MODE (Multi-Agent Chat)
**Purpose:** Collaborative problem solving with AI agents.
**URL:** `/party`
**Layout:**
- **Stage:** Central chat stream.
- **Participants:** Sidebar showing active agents (Developer, Architect, Writer).
- **Style:** Chat bubbles look like "Dialogue" script rather than SMS.
    - User: Aligned Right.
    - Agents: Aligned Left, distinct avatar & accent color border.

7️⃣ SETTINGS & PLUGINS
**Purpose:** Configuration and extension.
**URL:** `/settings`
**Layout:**
- **Tabs:** General, AI Models, Plugins, Data.
- **Plugin Grid:** Cards showing installed capabilities (FTS5, VectorStore, etc.).

📱 RESPONSIVE & WINDOW BEHAVIOR
- **Desktop First:** Optimized for wide screens and window resizing.
- **Sidebar:** Collapsible (Icon only mode) for focus.
- **Modals:** Use `Radix UI` Dialogs with glass backdrops.
- **Tooltips:** Essential for icon-heavy interfaces.

🎭 COMPONENT LIBRARY (Atomic)
**Buttons:**
- `primary`: Indigo gradient bg, white text, subtle shine.
- `ghost`: Transparent, hover bg-slate-800.
**Inputs:**
- Minimalist, underline or subtle border-only.
- `ring-offset-0` focus styles.
**Cards:**
- `bg-slate-900/40` + `backdrop-blur`.
- `border-white/10`.
**Tags/Badges:**
- Pill shaped, neon borders (cyan, purple, pink).

📊 DESIGN PRINCIPLES
1.  **Speed is Feature #1:** UI must feel instant (`cursor-pointer` vs `default`).
2.  **Keyboard Driven:** Every action must have a hotkey hint displayed in tooltips.
3.  **Data Density:** Show more info, but organize it with typography hierarchy.
4.  **"Alive" UI:** Subtle pulsing for AI processing, smooth layout transitions (Framer Motion).

🚀 TECHNICAL INTEGRATIONS
- **Tauri IPC:** Window controls, File System access.
- **Ollama:** Local LLM streaming (Show tokens appearing).
- **Vector DB:** Similarity scores shown on "Related Notes".

📸 ASSET REQUIREMENTS
- **Icons:** Lucide React (Stroke width 1.5px).
- **Illustrations:** Abstract wireframe/geometric shapes for empty states.

📝 INPUT EXPECTATIONS
The AI Designer should assume access to `shadcn/ui` components and `Tailwind` utilities.
The output code should be React Components (`.tsx`) using `lucide-react` icons.


⏱️ ESTIMATED EFFORT
- **Critical:** Neural Bar, Dashboard, Editor.
- **Standard:** Settings, Graph.

✅ READY TO RENDER
This prompt defines the "SecondBrain" V2 interface: Sleek, Dark, AI-Native.
