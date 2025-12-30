# KnowledgeBase Pro

<div align="center">

**AI-Powered Desktop Knowledge Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Rust Version](https://img.shields.io/badge/rust-%3E%3D1.75+-orange)](https://www.rust-lang.org/)
[![Version](https://img.shields.io/badge/version-2.0.0-green)](https://github.com/knowledgebase-pro/knowledge-base-pro)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/knowledgebase-pro/knowledge-base-pro/actions/workflows/main.yml)

A revolutionary desktop knowledge management application combining best features from Obsidian, Notion, and Roam Research with local-first AI processing for complete privacy.

---

## 🎯 Overview

**KnowledgeBase Pro** is a production-ready AI-powered desktop knowledge management application with a modular backend architecture, comprehensive AI integration, and a plugin system for maximum extensibility.

### ✨ Key Features

- **🤖 AI-Powered**: Multi-provider support with streaming responses, source-grounded citations, and neural linking
- **⚡ Lightning Fast**: Tauri native desktop performance with <2s startup time
- **🔐 Privacy First**: Complete local data storage with optional encryption, no cloud dependencies
- **🔗 Neural Linking**: Automatic concept extraction, relationship mapping, and knowledge graph integration
- **📊 Graph Visualization**: D3.js-powered interactive knowledge graph
- **🔍 Full-Text Search**: SQLite FTS5 with sub-100ms search, smart filtering, and suggestions
- **🔌 Plugin System**: Extensible modular architecture with hot-reload support
- **🎨 Atmospheric Design**: Glassmorphism UI with Framer Motion animations and custom theming
- **📝 Rich Markdown**: Advanced editor with live preview, syntax highlighting, and smart completion
- **📱 Cross-Platform**: Windows, macOS, and Linux with native installers

### 🚀 Implementation Status

**Completed Features:**

- ✅ **Professional Layout Architecture**: Fixed left sidebar with multi-level navigation and contextual TopBar.
- ✅ **High-Fidelity Dashboard**: Interactive calendar, feature highlights grid, and contextual status sidebar.
- ✅ **NoteMaster Pro Theme**: Premium blue-centric design system with glassmorphism and motion.
- ✅ **Modular Backend Architecture**: 7 service modules with clean separation of concerns.
- ✅ **31 Tauri Commands**: Note, folder, tag, search, link, and AI operations.
- ✅ **Complete AI Integration**: Multi-provider support with streaming responses.
- ✅ **Neural Linking**: Concept extraction and relationship mapping.
- ✅ **Database Schema**: 2 migrations with AI features and FTS5 search.
- ✅ **Frontend Services**: Complete service layer with React Context.

**AI Features:**

- ✅ **Source-Grounded Synthesis**: RAG-based insight generation from selected notes with streaming UI.
- ✅ **Streaming Chat**: Real-time AI responses with token tracking.
- ✅ **Multi-Provider Support**: Ollama, OpenAI, Anthropic, HuggingFace.
- ✅ **Source-Grounded Responses**: Citation system with confidence scores.
- ✅ **Note Processing**: Concept extraction, auto-tagging, sentiment analysis.
- ✅ **Model Selection**: Intelligent routing based on query type.

**Core Modules:**

- Note Management (CRUD + folder organization)
- Full-Text Search (FTS5 with suggestions)
- Tagging System (with colors and filtering)
- Bidirectional Linking (wiki-style links + backlinks)
- AI Integration (streaming + citations)
- Neural Network (concept relationships)
- Import/Export (Markdown + JSON formats)

---

## 📁 Project Structure

```
knowledge-base-pro/
├── 📂 src/                         # React + TypeScript frontend
│   ├── 📂 app/                     # Application shell
│   │   ├── layout.tsx             # Sidebar-driven main layout
│   │   ├── 📂 components/         # Layout-specific components
│   │   │   └── 📂 layout/         # Sidebar, TopBar
│   │   └── 📂 pages/              # Route components
│   │       ├── index.tsx          # Redirects to Dashboard
│   │       ├── Dashboard.tsx      # High-fidelity dashboard
│   │       └── NotesPage.tsx      # Multi-select notes management
│   ├── 📂 shared/                 # Shared infrastructure
│   │   ├── 📂 components/         # Reusable UI components
│   │   │   ├── 📂 dashboard/      # FeatureCard, Calendar, Sidebar
│   │   │   ├── 📂 modals/         # FeedbackModal, search
│   │   │   └── NoteForm.tsx       # Polished note capture
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   │   └── useNotesStore.ts   # Zustand state management
│   │   ├── 📂 services/           # Business logic services
│   │   └── types.ts               # TypeScript interfaces
├── 📂 src-tauri/                  # Rust backend (Tauri)
│   ├── 📂 src/                    # Backend source
│   │   ├── main.rs               # Application entry point
│   │   ├── commands/             # Tauri command handlers
│   │   └── services/             # Business logic layer
│   └── Cargo.toml                # Rust dependencies
├── 📂 docs/                       # Documentation
└── tailwind.config.mjs            # NoteMaster Pro design tokens
```

### Directory Purpose

| Directory | Purpose |
|-----------|---------|
| `src/app/components/layout/` | Sidebar, TopBar, and Navigation |
| `src/shared/components/dashboard/` | High-fidelity dashboard elements |
| `src/shared/components/modals/` | High-end survey and feedback forms |
| `src/shared/hooks/` | Zustand stores and service hooks |
| `src/features/ai/components/` | Synthesis panel and LLM interfaces |

### Key Files

| File | Purpose |
|------|---------|
| `src/app/pages/NotesPage.tsx` | Main notes management interface |
| `src/shared/components/NoteForm.tsx` | Reusable note form component |
| `src/shared/hooks/useNotes.ts` | Notes state management hook |
| `src/shared/services/noteService.ts` | Note business logic service |
| `src/shared/types.ts` | Core TypeScript interfaces |
| `src/app/layout.tsx` | Main application layout |

---

## 🎯 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with Tauri (desktop)
npm run tauri:dev

# Build for production
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run tauri:dev` | Start Tauri desktop app |
| `npm run tauri:build` | Build desktop installer |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests |
| `npm run test:coverage` | Generate coverage report |
knowledge-base-pro/
├── 📂 project-structure/           # Main application code
│   ├── 📂 src-tauri/             # Rust backend
│   │   ├── 📂 src/
│   │   │   ├── main.rs       # Application entry
│   │   │   ├── commands/     # Tauri command handlers (31 commands across 6 modules)
│   │   │   │   ├── note.rs       # Note CRUD operations
│   │   │   │   ├── folder.rs      # Folder hierarchy management
│   │   │   │   ├── tag.rs         # Tag operations
│   │   │   │   ├── search.rs      # FTS5 search engine
│   │   │   │   ├── link.rs        # Bidirectional links
│   │   │   │   └── ai.rs          # AI integration
│   │   ├── 📂 services/     # Business logic layer
│   │   │   │   ├── ai_service.rs    # Multi-provider AI
│   │   │   │   ├── note_service.rs  # Note operations
│   │   │   │   ├── folder_service.rs # Folder management
│   │   │   │   ├── tag_service.rs    # Tag operations
│   │   │   │   ├── search_service.rs  # Search engine
│   │   │   │   ├── link_service.rs   # Link management
│   │   │   │   ├── link_parser.rs    # WikiLink parsing
│   │   │   │   └── database.rs     # SQLite connection
│   │   ├── 📂 models/       # Data models and types
│   │   ├── 📂 migrations/    # Database schema versions
│   │   │   │   ├── 001_initial_schema.sql
│   │   │   │   └── 002_ai_features.sql
│   │   └── Cargo.toml    # Rust dependencies
│   ├── 📂 src/                 # React + TypeScript frontend
│   │   ├── 📂 app/          # Application shell
│   │   ├── 📂 features/     # Feature-based modules
│   │   │   ├── 📂 notes/        # Note management UI
│   │   │   ├── 📂 search/       # Search functionality
│   │   │   ├── 📂 ai/           # AI chat interface
│   │   │   ├── 📂 editor/       # Markdown editor
│   │   │   ├── 📂 graph/        # Graph visualization
│   │   │   ├── 📂 settings/     # App settings
│   │   │   ├── 📂 tags/         # Tag management
│   │   │   └── 📂 import-export/ # Data portability
│   │   ├── 📂 shared/       # Shared infrastructure
│   │   │   ├── 📂 components/   # Reusable UI components
│   │   │   ├── 📂 services/     # Service layers
│   │   │   │   ├── aiService.ts
│   │   │   │   ├── noteService.ts
│   │   │   │   ├── searchService.ts
│   │   │   │   ├── aiNoteProcessor.ts
│   │   │   │   ├── pluginService.ts
│   │   │   │   ├── fileSystemService.ts
│   │   │   │   └── serviceContext.tsx
│   │   │   └── 📂 types.ts     # Shared type definitions
│   │   └── main.tsx       # Application entry
│   ├── 📂 docs/              # Documentation
│   │   ├── design/         # Design specifications
│   │   ├── technical-specifications.md
│   │   ├── development-guide.md
│   │   ├── api-documentation.md
│   │   ├── llm-selection-guide.md
│   │   └── notebooklm-features-integration.md
│   ├── 📂 plans/            # Project planning
│   ├── 📂 .coderrules/      # Development standards
│   ├── 📂 package.json      # Dependencies
│   ├── 📂 tsconfig.json      # TypeScript config
│   └── 📂 tailwind.config.mjs # Styling
```

knowledge-base-pro/
├── 📂 src/ # React + TypeScript frontend
│ ├── 📂 app/ # Application shell (Routing, Layout)
│ ├── 📂 features/ # Feature-based modules
│ │ ├── 📂 notes/ # Note management
│ │ ├── 📂 search/ # Search functionality
│ │ ├── 📂 ai/ # AI and LLM integration
│ │ ├── 📂 editor/ # Markdown editor
│ │ ├── 📂 folders/ # Folder organization
│ │ ├── 📂 tags/ # Tag management
│ │ ├── 📂 links/ # Bidirectional linking
│ │ ├── 📂 graph/ # Graph visualization
│ │ ├── 📂 settings/ # App settings
│ │ └── 📂 import-export/ # Data portability
│ ├── 📂 shared/ # Shared infrastructure
│ │ ├── 📂 components/ # Reusable UI components
│ │ ├── 📂 hooks/ # Global custom hooks
│ │ ├── 📂 services/ # Core services
│ │ ├── 📂 utils/ # Utility functions
│ │ ├── 📂 types.ts # Shared type definitions
│ │ └── 📂 theme/ # Design system
│ └── 📂 plugins/ # Plugin infrastructure
├── 📂 src-tauri/ # Rust backend
│ ├── 📂 src/
│ │ ├── 📂 commands/ # Tauri command handlers
│ │ │ ├── 📂 notes.rs # Note operations
│ │ │ ├── 📂 search.rs # Search operations
│ │ │ ├── 📂 ai.rs # AI integration
│ │ │ ├── 📂 folders.rs # Folder operations
│ │ │ ├── 📂 tags.rs # Tag operations
│ │ │ └── 📂 import_export.rs # Data portability
│ │ ├── 📂 services/ # Business logic
│ │ │ ├── 📂 database.rs # Database layer
│ │ │ ├── 📂 search.rs # Search engine
│ │ │ ├── 📂 ai_service.rs # AI providers
│ │ │ └── 📂 linker.rs # Neural linking
│ │ ├── 📂 models/ # Data models
│ │ └── 📂 utils/ # Utility functions
│ └── 📂 migrations/ # Database migrations
├── 📂 docs/ # Documentation
│ ├── technical-specifications.md
│ ├── development-guide.md
│ ├── llm-selection-guide.md
│ └── notebooklm-features-integration.md
└── 📂 .coderrules/ # Development standards

````

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.2 | Type safety |
| Tailwind CSS | 3.4.12 | Styling and design system |
| Vite | 5.4.7 | Build tool and dev server |
| React Router | 6.26.2 | Client-side routing |
| Zustand | 4.5.5 | Global state management |
| TanStack Query | 5.56.2 | Server state sync |
| Lucide React | 0.451.0 | Icon system |
| D3.js | 7.9.0 | Graph visualization |
| Framer Motion | 11.5.5 | Premium animations |
| React Markdown | 9.0.3 | Markdown rendering |
| React Hook Form | 7.53.0 | Form management |
| Class Variance | 0.7.0 | Variant utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.75+ | Backend language |
| Tauri | 1.6.0+ | Desktop framework |
| SQLite | 3.x | Database with FTS5 |
| SQLx | 0.7 | SQL toolkit |
| Serde | 1.0 | Serialization |
| Serde Json | 1.0 | JSON serialization |
| Tokio | 1.0 | Async runtime |
| Chrono | 0.4 | Date/time handling |
| UUID | 1.7 | Unique identifiers |
| Reqwest | 0.11 | HTTP client |
| DashMap | 5.5 | In-memory data structures |
| LRU | 0.12 | Caching |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| Rust | 1.75+ | Backend runtime |
| Vite | 5.4.7 | Frontend bundler |
| ESLint | 9.11.1 | Linting |
| Prettier | 3.3.3 | Code formatting |
| TypeScript | 5.6.2 | Type checking |
| Husky | 9.1.6 | Git hooks |

### AI Integration
- **Local**: Ollama (Phi-3.1 Mini, Gemma2:2B, CodeLlama 7B, Whisper Small)
- **Cloud**: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude)
- **HuggingFace**: Various open-source models
- **Features**: Streaming responses, citations, neural linking, token tracking

---

## 🗄️ Database & Architecture

### Database Schema

**Migrations:**
- `001_initial_schema.sql`: Core PKM tables (notes, folders, tags, links, FTS5)
- `002_ai_features.sql`: AI-powered tables (conversations, messages, concepts, relationships)

**Architecture Layers:**
- **Frontend**: React 18+ with TypeScript, state via React Context + TanStack Query
- **IPC Layer**: Tauri commands for frontend-backend communication
- **Backend**: Rust services with clean separation of concerns (7 service modules)
- **Database**: SQLite with FTS5 for sub-100ms full-text search
- **Extensions**: Firebase integration for optional cloud sync

**Service Modules:**
- NoteService: Note CRUD with tag integration
- FolderService: Hierarchy management with path generation
- TagService: Tag operations with get_or_create optimization
- SearchService: FTS5 search, suggestions, recent notes
- LinkService: Bidirectional links with wikilink parsing
- AIService: Multi-provider AI with streaming responses
- LinkParser: WikiLink regex parser with comprehensive tests

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **Rust**: >= 1.75
- **Ollama**: For local AI (optional but recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/knowledgebase-pro/knowledge-base-pro.git
cd knowledge-base-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Start Tauri desktop app
npm run tauri:dev
```

### Development

```bash
# Clone repository
git clone https://github.com/knowledgebase-pro/knowledge-base-pro.git
cd knowledge-base-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test
npm run test:ui
npm run test:coverage

# Test AI integration
./test-ai.sh
```

### Build

```bash
# Build for production
npm run build

# Build desktop application
npm run tauri:build

# Output will be in src-tauri/target/release/bundle/
```

---

## 🎨 Design System

### NoteMaster Pro Theme

KnowledgeBase Pro features a premium, developer-focused "Pro" aesthetic:

- **Color Palette**: Deep atmospheric background (`#0f0f0f`), layered surfaces (`#121212` to `#2a2a2a`), and professional blue accents (`#0070f3`).
- **Glassmorphism**: Advanced backdrop blurs (`blur-3xl`) with micro-thin borders (`white/5`).
- **High-End Typography**: Using `Plus Jakarta Sans` for display and `Inter` for content, focusing on bold weight hierarchies.
- **Motion System**: Fluid page transitions and interactive hover states via Framer Motion.
- **Component Library**: 
    - **FeatureCard**: Large imagery with progress tracking.
    - **CalendarGrid**: Interactive 7-column knowledge schedule.
    - **ProSidebar**: Fixed navigation with active motion indicators.
    - **TopBar**: Contextual search and user administration.

---

## 🔌 Plugin Development

### Creating a Plugin

```bash
# Create new plugin
npm run plugin:create my-awesome-plugin
```

### Plugin Structure

```typescript
// features/notes/plugins/auto-tagger/index.ts
import { KnowledgeBasePlugin, PluginContext } from "@/plugins/core";

export default class AutoTaggerPlugin implements KnowledgeBasePlugin {
  id = "auto-tagger";
  name = "Auto Tag Suggestions";
  version = "1.0.0";
  permissions = ["notes:read", "notes:write"];

  hooks = {
    async onNoteCreate(note, context) {
      // AI-powered tag suggestions
      const tags = await this.context.services.ai.analyzeContent(note.content);
      await this.context.services.notes.updateNote(note.id, { tags });
    },

    async onNoteUpdate(note, context) {
      // Re-analyze on update
      const suggestions = await this.context.services.ai.suggestTags(
        note.content,
      );
      return suggestions;
    },
  };
}
```

### Plugin Hooks

- `onNoteCreate`: Called when a note is created
- `onNoteUpdate`: Called when a note is updated
- `onNoteDelete`: Called when a note is deleted
- `onSearch`: Called before search execution
- `onExport`: Called before data export
- `onImport`: Called after data import

---

## 🤖 AI Integration

### Supported Providers

- **Ollama**: Local models (recommended for privacy)
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude models
- **HuggingFace**: Various open-source models

### Smart Model Selection

The AI service automatically selects the optimal model based on query type:

- **Code queries** → CodeLlama 7B
- **Short queries** → Fast models (Gemma2:2B)
- **Complex queries** → Primary models (Phi-3.1:Mini)
- **GPU preference** → Hardware-optimized routing

### AI Features

- **Streaming Responses**: Real-time text generation
- **Citation System**: Source references with confidence scores
- **Concept Extraction**: Automatic knowledge graph entities
- **Neural Linking**: Automatic relationship mapping
- **Note Summarization**: AI-powered content previews
- **Study Guides**: Generate educational materials
- **FAQ Generation**: Auto-create Q&A from notes

### AI Commands

```typescript
// Generate AI response
const response = await invoke("generate_ai_response", {
  query: "Explain quantum computing",
  options: {
    model: "phi3.1",
    stream: true,
  },
});

// Search related documents
const related = await invoke("search_related_documents", {
  noteId: note.id,
  limit: 10,
});

// Generate study guide
const guide = await invoke("generate_study_guide", {
  noteIds: [noteId1, noteId2],
});
```

---

## 📊 Database Schema

### Core Tables

- **notes**: Note content and metadata
- **folders**: Hierarchical folder structure
- **tags**: Tag definitions
- **note_tags**: Many-to-many relationship
- **links**: Bidirectional links between notes
- **blocks**: Block-level content for referencing
- **ai_conversations**: AI chat history
- **ai_messages**: Individual messages
- **concepts**: Knowledge graph entities
- **concept_relationships**: Neural connections

### Full-Text Search

Uses SQLite FTS5 for sub-100ms search performance:

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title,
    content,
    tags,
    note_id UNINDEXED,
    content='notes'
);
```

---

## 📝 API Documentation

### Note Management

```typescript
// Create note
invoke("create_note", {
  title: "My Note",
  content: "# Markdown content",
  folderId: null,
});

// Update note
invoke("update_note", {
  id: "note-id",
  title: "Updated Title",
  content: "Updated content",
});

// Get note
invoke("get_note", { id: "note-id" });

// List notes
invoke("list_notes", {
  folderId: null,
  tags: ["tag1", "tag2"],
  limit: 50,
});
```

### Search

```typescript
// Full-text search
invoke("search_notes", {
  query: "search term",
  options: {
    limit: 20,
    fuzzy: true,
  },
});

// Advanced search
invoke("advanced_search", {
  filters: {
    tags: ["research"],
    dateRange: { start: "2024-01-01", end: "2024-12-31" },
  },
});
```

### AI Operations

```typescript
// Generate response
invoke("generate_ai_response", {
  query: "Explain...",
  conversationId: null,
  model: "phi3.1",
});

// Stream response
const channel = await invoke("generate_ai_response_stream", {
  query: "Explain...",
  model: "phi3.1",
});

for await (const chunk of channel) {
  console.log(chunk);
}
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Testing Strategy

- **Unit Tests**: 70% - Individual functions and components
- **Integration Tests**: 20% - Component interactions
- **E2E Tests**: 10% - Full user workflows

Target Coverage:

- Frontend: >90%
- Backend: >95%
- Critical Paths: 100%

---

## 📖 Documentation

- **[Technical Specifications](docs/technical-specifications.md)** - System architecture and technical details
- **[Development Guide](docs/development-guide.md)** - Development setup and workflows
- **[LLM Selection Guide](docs/llm-selection-guide.md)** - AI model selection and configuration
- **[NotebookLM Features](docs/notebooklm-features-integration.md)** - AI-powered learning features
- **[API Documentation](docs/api-documentation.md)** - Complete API reference

---

## 🗂️ Code Architecture

### Frontend Structure

The frontend follows a feature-based architecture:

```
src/
├── app/                    # Application pages
│   ├── layout.tsx         # Root layout with providers
│   └── pages/             # Route components
│       ├── index.tsx      # Home/Dashboard
│       └── NotesPage.tsx  # Notes management
├── shared/                # Shared infrastructure
│   ├── components/        # Reusable UI components
│   │   ├── NoteForm.tsx  # Form for notes
│   │   └── index.ts      # Component exports
│   ├── hooks/             # Custom React hooks
│   │   └── useNotes.ts   # Notes state logic
│   ├── services/          # Business logic
│   │   └── noteService.ts
│   └── types.ts           # TypeScript definitions
```

### Key Patterns

1. **Component Pattern**: Functional components with TypeScript interfaces
2. **State Management**: React hooks (useState, useEffect) + custom hooks
3. **Service Layer**: Separate business logic from UI
4. **Type Safety**: Explicit interfaces for all props and data

### Type Definitions

```typescript
// Core Note type
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note service interface
interface NoteService {
  createNote(note: CreateNoteRequest): Promise<Note>;
  updateNote(id: string, updates: UpdateNoteRequest): Promise<Note>;
  deleteNote(id: string): Promise<void>;
}
```

---

## 🔧 Development Standards

### Code Style

- **TypeScript**: Strict mode, no `any` types
- **Import Order**: External → Internal → Styles
- **Naming**: PascalCase for components, camelCase for functions
- **Documentation**: TSDoc for public APIs

### Component Example

```typescript
// src/shared/components/NoteForm.tsx
interface NoteFormProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  // Component implementation
}
```

### Custom Hook Example

```typescript
// src/shared/hooks/useNotes.ts
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  
  const createNote = async (title: string, content: string) => {
    // Implementation
  };
  
  return { notes, createNote, /* ... */ };
}
```

---

## 🔧 Configuration

### Tauri Configuration

Located in `src-tauri/tauri.conf.json` or `tauri.conf.json`:

```json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:5173"
  },
  "tauri": {
    "bundle": {
      "identifier": "pro.knowledgebase.app",
      "targets": ["all"]
    }
  }
}
```

### AI Configuration

AI providers can be configured in Settings > AI:

```typescript
{
  "ollama": {
    "endpoint": "http://localhost:11434",
    "models": ["phi3.1", "gemma2:2b", "codellama:7b"]
  },
  "openai": {
    "apiKey": "sk-...",
    "model": "gpt-4"
  },
  "preferences": {
    "streaming": true,
    "maxTokens": 4096,
    "temperature": 0.7
  }
}
```

---

## 🚀 Performance

### Benchmarks

| Operation     | Time   | Notes                   |
| ------------- | ------ | ----------------------- |
| Cold Start    | <2s    | Full application launch |
| Warm Start    | <500ms | Subsequent launches     |
| Search        | <100ms | FTS5 indexed search     |
| Note Creation | <100ms | Input to persistence    |
| AI Response   | <1s    | First token streaming   |
| Graph Render  | <200ms | 1000 nodes              |

### Optimization

- **Code Splitting**: Lazy route and component loading
- **Virtual Scrolling**: Efficient list rendering
- **Memoization**: React.memo and useMemo
- **Database Indexing**: Optimized SQLite indexes
- **Asset Compression**: Minified bundles

---

## 🤝 Contributing

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** development standards in `.coderrules/`
4. **Commit** with clear messages
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Code Standards

- **Type Safety**: Strict TypeScript, no `any` types
- **Documentation**: TSDoc for all public APIs
- **Testing**: Comprehensive test coverage
- **Linting**: Follow ESLint and Prettier rules

### Adding New Features

1. Create component in appropriate directory:
   - `src/app/pages/` for new pages
   - `src/shared/components/` for reusable components
   - `src/shared/hooks/` for stateful logic
   - `src/shared/services/` for business logic

2. Export from `src/shared/components/index.ts`

3. Update routing in main app file

4. Add tests for new functionality

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by Obsidian, Notion, and Roam Research
- Built with [Tauri](https://tauri.app/)
- Icons by [Lucide](https://lucide.dev/)
- Database powered by [SQLite](https://www.sqlite.org/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/knowledgebase-pro/knowledge-base-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/knowledgebase-pro/knowledge-base-pro/discussions)
- **Documentation**: [Full Documentation](https://docs.knowledgebase.pro)

---

<div align="center">

**Built with ❤️ following the Global Vibe Coding Constitution**

[⬆ Back to Top](#knowledgebase-pro)

</div>
