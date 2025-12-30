# Project Structure Guide

## Overview

This document describes the fixed and optimized directory structure for KnowledgeBase Pro.

## Current Project Structure

```
knowledge-base-pro/
├── src/                          # React + TypeScript frontend
│   ├── 📂 app/                   # Application shell
│   │   ├── layout.tsx           # Root layout wrapper with providers
│   │   └── 📂 pages/            # Route components
│   │       ├── index.tsx        # Home/Dashboard page
│   │       └── NotesPage.tsx    # Notes management page
│   ├── 📂 shared/               # Shared infrastructure
│   │   ├── 📂 components/       # Reusable UI components
│   │   │   ├── NoteForm.tsx    # Note creation/editing form
│   │   │   └── index.ts        # Component exports
│   │   ├── 📂 hooks/           # Custom React hooks
│   │   │   └── useNotes.ts     # Notes state management hook
│   │   ├── 📂 services/        # Business logic services
│   │   │   └── noteService.ts  # Note CRUD operations
│   │   └── types.ts            # TypeScript type definitions
│   └── main.tsx                 # Application entry point
├── src-tauri/                   # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs            # Application entry point
│   │   ├── commands/          # Tauri command handlers
│   │   ├── services/          # Business logic layer
│   │   ├── models/            # Data models
│   │   └── migrations/        # Database migrations
│   └── Cargo.toml             # Rust dependencies
├── docs/                        # Documentation
│   ├── development-guide.md
│   ├── technical-specifications.md
│   ├── api-documentation.md
│   ├── llm-selection-guide.md
│   └── notebooklm-features-integration.md
├── .coderrules/                 # Development standards
│   ├── Global.md
│   ├── Agents.md
│   └── 📂 .guides/             # Agent prompts
├── package.json                 # Frontend dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.mjs          # Tailwind CSS configuration
├── tauri.conf.json             # Tauri configuration
└── README.md                    # Project documentation
```

## Directory Purpose Guide

### `src/app/` - Application Shell

Contains the main application pages and layout.

| File/Directory | Purpose |
|---------------|---------|
| `layout.tsx` | Root layout with providers and global UI |
| `pages/` | Route components for each page |
| `index.tsx` | Home/Dashboard page |
| `NotesPage.tsx` | Notes management interface |

### `src/shared/` - Shared Infrastructure

Reusable code shared across the application.

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `components/` | Reusable UI components | NoteForm, buttons, cards, inputs |
| `hooks/` | Custom React hooks | useNotes, useSearch, useAI |
| `services/` | Business logic | noteService, aiService, searchService |
| `types.ts` | TypeScript definitions | Note, User, AIResponse interfaces |

### `src-tauri/src/` - Rust Backend

Tauri desktop backend with Rust.

| Directory | Purpose |
|-----------|---------|
| `main.rs` | Application entry point |
| `commands/` | Tauri command handlers (IPC) |
| `services/` | Business logic implementation |
| `models/` | Data structures and types |
| `migrations/` | SQLite database migrations |

## File Naming Conventions

### Components

- PascalCase: `NotesPage.tsx`, `NoteForm.tsx`
- Co-located styles: `NotesPage.module.css`

### Hooks

- Prefix with "use": `useNotes.ts`, `useSearch.ts`
- CamelCase: `useNotes.ts`

### Services

- Suffix with "Service": `noteService.ts`, `aiService.ts`
- CamelCase: `noteService.ts`

### Types

- PascalCase: `Note`, `UserSettings`, `AIResponse`
- Single file: `src/shared/types.ts`

## Import Patterns

### Good Imports

```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal shared
import { Note } from '@/shared/types';
import { useNotes } from '@/shared/hooks/useNotes';
import { NoteForm } from '@/shared/components/NoteForm';

// Internal app
import { Layout } from '@/app/layout';
import { NotesPage } from '@/app/pages/NotesPage';
```

### Import Order

1. React and external libraries
2. Internal shared (components, hooks, services, types)
3. Internal app (layout, pages)
4. Styles (if needed)

## Component Structure

### Page Component Example

```typescript
// src/app/pages/NotesPage.tsx
import React, { useState } from 'react';
import { Layout } from '../layout';
import { NoteForm } from '../components/NoteForm';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../types';

export function NotesPage() {
  const { notes, createNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button onClick={() => createNote('New Note', '')}>
          Create Note
        </button>
        {/* Note list and form */}
      </div>
    </Layout>
  );
}
```

### Component Example

```typescript
// src/shared/components/NoteForm.tsx
import React, { useState } from 'react';
import type { Note } from '../types';

interface NoteFormProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: note?.id || '', title, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

### Hook Example

```typescript
// src/shared/hooks/useNotes.ts
import { useState } from 'react';
import type { Note } from '../types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  const createNote = (title: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
```

## Type Definitions

### Core Types

```typescript
// src/shared/types.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
```

## Export Patterns

### Barrel Exports

```typescript
// src/shared/components/index.ts
export { NoteForm } from './NoteForm';
// Add new exports here
```

### Re-exports from App

```typescript
// src/app/pages/index.tsx
export { NotesPage } from './NotesPage';
```

## Next Steps

1. **Add more pages**: Create new directories in `src/app/pages/`
2. **Add components**: Add reusable components to `src/shared/components/`
3. **Add hooks**: Add custom hooks to `src/shared/hooks/`
4. **Add services**: Add business logic to `src/shared/services/`
5. **Update exports**: Export new components from `src/shared/components/index.ts`

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Import errors | Check path aliases in `tsconfig.json` |
| Type errors | Ensure types are exported from `src/shared/types.ts` |
| Component not found | Check barrel export in `src/shared/components/index.ts` |
| Hook not working | Ensure hook follows `use*` naming convention |

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/app/*": ["src/app/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```
