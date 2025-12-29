# KnowledgeBase Pro

<div align="center">

**AI-Powered Desktop Knowledge Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Rust Version](https://img.shields.io/badge/rust-%3E%3D1.75+-orange)](https://www.rust-lang.org/)
[![Version](https://img.shields.io/badge/version-2.0.0-green)](https://github.com/knowledgebase-pro/knowledge-base-pro)

A revolutionary desktop knowledge management application combining the best features from Obsidian, Notion, and Roam Research with local-first AI processing for complete privacy.

</div>

---

## 🎯 Overview

**KnowledgeBase Pro** is a next-generation personal knowledge base built for maximum performance, privacy, and extensibility. It features a production-ready modular backend architecture, comprehensive AI integration, and a plugin system that makes it infinitely customizable.

### ✨ Key Features

- **🤖 AI-Powered**: Local-first AI with multiple providers (Ollama, OpenAI, Anthropic, HuggingFace)
- **⚡ Lightning Fast**: Built with Tauri for native desktop performance
- **🔐 Privacy First**: All data stored locally, optional encryption
- **🔗 Neural Linking**: Automatic concept extraction and relationship mapping
- **📊 Graph Visualization**: D3.js-powered knowledge graph with semantic clustering
- **🔍 Full-Text Search**: SQLite FTS5 search with sub-100ms response times
- **🔌 Plugin System**: Extensible architecture with hot-reload support
- **🎨 Atmospheric Design**: Glassmorphism UI with Framer Motion animations
- **📝 Rich Markdown**: Advanced markdown editor with live preview
- **📱 Cross-Platform**: Windows, macOS, and Linux support

### 🚀 What's New in v2.0

- **Complete AI Integration**: 31 Tauri commands across 6 modules
- **Streaming Responses**: Real-time AI response generation
- **Smart Model Selection**: Automatic routing to optimal models
- **NotebookLM Features**: Document summarization, study guides, FAQ generation
- **Token Tracking**: Complete usage analytics with cost calculations
- **Citation System**: Source-grounded AI responses with document references

---

## 📁 Project Structure

```
knowledge-base-pro/
├── 📂 src/                          # React + TypeScript frontend
│   ├── 📂 app/                      # Application shell (Routing, Layout)
│   ├── 📂 features/                 # Feature-based modules
│   │   ├── 📂 notes/                # Note management
│   │   ├── 📂 search/               # Search functionality
│   │   ├── 📂 ai/                   # AI and LLM integration
│   │   ├── 📂 editor/               # Markdown editor
│   │   ├── 📂 folders/              # Folder organization
│   │   ├── 📂 tags/                 # Tag management
│   │   ├── 📂 links/                # Bidirectional linking
│   │   ├── 📂 graph/                # Graph visualization
│   │   ├── 📂 settings/             # App settings
│   │   └── 📂 import-export/        # Data portability
│   ├── 📂 shared/                   # Shared infrastructure
│   │   ├── 📂 components/           # Reusable UI components
│   │   ├── 📂 hooks/                # Global custom hooks
│   │   ├── 📂 services/             # Core services
│   │   ├── 📂 utils/                # Utility functions
│   │   ├── 📂 types.ts              # Shared type definitions
│   │   └── 📂 theme/                # Design system
│   └── 📂 plugins/                  # Plugin infrastructure
├── 📂 src-tauri/                    # Rust backend
│   ├── 📂 src/
│   │   ├── 📂 commands/             # Tauri command handlers
│   │   │   ├── 📂 notes.rs          # Note operations
│   │   │   ├── 📂 search.rs         # Search operations
│   │   │   ├── 📂 ai.rs             # AI integration
│   │   │   ├── 📂 folders.rs        # Folder operations
│   │   │   ├── 📂 tags.rs           # Tag operations
│   │   │   └── 📂 import_export.rs  # Data portability
│   │   ├── 📂 services/             # Business logic
│   │   │   ├── 📂 database.rs       # Database layer
│   │   │   ├── 📂 search.rs         # Search engine
│   │   │   ├── 📂 ai_service.rs     # AI providers
│   │   │   └── 📂 linker.rs         # Neural linking
│   │   ├── 📂 models/               # Data models
│   │   └── 📂 utils/                # Utility functions
│   └── 📂 migrations/               # Database migrations
├── 📂 docs/                         # Documentation
│   ├── technical-specifications.md
│   ├── development-guide.md
│   ├── llm-selection-guide.md
│   └── notebooklm-features-integration.md
└── 📂 .coderrules/                 # Development standards
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Tailwind CSS | 3.4 | Styling and design system |
| Vite | 5.4 | Build tool and dev server |
| React Router | 6.26 | Client-side routing |
| Zustand | 4.5 | Global state management |
| TanStack Query | 5.56 | Server state sync |
| Lucide React | 0.451 | Icon system |
| D3.js | 7.9 | Graph visualization |
| Framer Motion | 11.5 | Premium animations |
| React Markdown | 9.0 | Markdown rendering |
| Monaco Editor | 0.46 | Code editor |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.75+ | Backend language |
| Tauri | 1.6+ | Desktop framework |
| SQLite | 3.x | Database with FTS5 |
| Rusqlite | 0.32+ | SQLite bindings |
| Serde | 1.0+ | Serialization |
| Tokio | 1.0+ | Async runtime |

### AI Integration
- **Ollama**: Local LLM hosting (Phi-3.1 Mini, Gemma2, CodeLlama)
- **OpenAI**: GPT models
- **Anthropic**: Claude models
- **HuggingFace**: Open-source models
- **LocalLLM**: Custom local inference

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
cd knowledge-base-pro/project-structure

# Install dependencies
npm install

# Install Ollama (for local AI)
# Download from https://ollama.ai/

# Pull recommended models
ollama pull phi3.1
ollama pull gemma2:2b
ollama pull codellama:7b
```

### Development

```bash
# Start development server
npm run tauri:dev

# Start Vite dev server only
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test
npm run test:ui
npm run test:coverage
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

### Atmospheric Theme

KnowledgeBase Pro uses a custom atmospheric design system with:

- **Glassmorphism**: Backdrop blur with transparency effects
- **Depth Shadows**: Multi-layered shadows for elevation
- **Motion**: Framer Motion for fluid interactions
- **Custom Colors**: Atmospheric palette with depth and vibrancy

### Component Library

- **AtmosphericButton**: Glassmorphic buttons with glow effects
- **GlassCard**: Elevated cards with depth shadows
- **NoiseOverlay**: Subtle texture overlays for atmosphere
- **MotionContainer**: Containers with entrance animations

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
import { KnowledgeBasePlugin, PluginContext } from '@/plugins/core';

export default class AutoTaggerPlugin implements KnowledgeBasePlugin {
  id = 'auto-tagger';
  name = 'Auto Tag Suggestions';
  version = '1.0.0';
  permissions = ['notes:read', 'notes:write'];
  
  hooks = {
    async onNoteCreate(note, context) {
      // AI-powered tag suggestions
      const tags = await this.context.services.ai.analyzeContent(note.content);
      await this.context.services.notes.updateNote(note.id, { tags });
    },
    
    async onNoteUpdate(note, context) {
      // Re-analyze on update
      const suggestions = await this.context.services.ai.suggestTags(note.content);
      return suggestions;
    }
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
const response = await invoke('generate_ai_response', {
  query: 'Explain quantum computing',
  options: {
    model: 'phi3.1',
    stream: true
  }
});

// Search related documents
const related = await invoke('search_related_documents', {
  noteId: note.id,
  limit: 10
});

// Generate study guide
const guide = await invoke('generate_study_guide', {
  noteIds: [noteId1, noteId2]
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
invoke('create_note', {
  title: 'My Note',
  content: '# Markdown content',
  folderId: null
})

// Update note
invoke('update_note', {
  id: 'note-id',
  title: 'Updated Title',
  content: 'Updated content'
})

// Get note
invoke('get_note', { id: 'note-id' })

// List notes
invoke('list_notes', {
  folderId: null,
  tags: ['tag1', 'tag2'],
  limit: 50
})
```

### Search

```typescript
// Full-text search
invoke('search_notes', {
  query: 'search term',
  options: {
    limit: 20,
    fuzzy: true
  }
})

// Advanced search
invoke('advanced_search', {
  filters: {
    tags: ['research'],
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
  }
})
```

### AI Operations

```typescript
// Generate response
invoke('generate_ai_response', {
  query: 'Explain...',
  conversationId: null,
  model: 'phi3.1'
})

// Stream response
const channel = await invoke('generate_ai_response_stream', {
  query: 'Explain...',
  model: 'phi3.1'
})

for await (const chunk of channel) {
  console.log(chunk)
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

## 🔧 Configuration

### Tauri Configuration

Located in `src-tauri/tauri.conf.json`:

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

| Operation | Time | Notes |
|-----------|------|-------|
| Cold Start | <2s | Full application launch |
| Warm Start | <500ms | Subsequent launches |
| Search | <100ms | FTS5 indexed search |
| Note Creation | <100ms | Input to persistence |
| AI Response | <1s | First token streaming |
| Graph Render | <200ms | 1000 nodes |

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
