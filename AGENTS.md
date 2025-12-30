# 🤖 AGENTS.md - KnowledgeBase Pro Development Guide

This document provides essential information for agentic coding agents working on KnowledgeBase Pro codebase. Follow these guidelines to maintain consistency and productivity.

---

## 🚀 Build, Lint & Test Commands

### Core Development Commands
```bash
# Development servers
npm run dev              # Vite dev server (frontend only)
npm run tauri:dev        # Full Tauri development (frontend + backend)

# Production builds  
npm run build            # TypeScript compile + Vite bundle
npm run tauri:build      # Desktop application with installers

# Code quality
npm run type-check       # TypeScript compilation check
npm run lint             # ESLint validation
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting
npm run format:check     # Verify formatting compliance
```

### Testing Commands
```bash
# Run all tests
npm run test              # Vitest test runner
npm run test:ui           # Interactive test UI
npm run test:coverage     # Coverage report generation

# Run single test file
npm run test -- path/to/specific.test.ts
npm run test -- --grep "test description"
npm run test -- --reporter=verbose

# AI integration testing
./test-ai.sh             # Test AI providers and responses
```

### Plugin & Feature Scripts
```bash
npm run plugin:create my-plugin    # Create new plugin
npm run plugin:dev               # Development mode with hot reload
npm run feature:create my-feature   # Scaffold new feature module
```

---

## 📋 Code Style Guidelines

### TypeScript Configuration
- **Strict Mode**: Enabled with `noImplicitAny`, `exactOptionalPropertyTypes`
- **Path Aliases**: `@/*` → `./src/*` for clean imports
- **JSX**: `react-jsx` transform with React 18+ support

### Import Organization
```typescript
// Order: External libraries → Internal shared → Feature-specific → Styles
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/tauri';

// Shared components and services
import { Card, Button } from '@/shared/components';
import { useServices } from '@/shared/services/serviceContext';
import { Note, AIRequest } from '@/shared/types';

// Feature imports
import { ComponentProps } from './types';
import './styles.css';
```

### Component Patterns
```typescript
// Functional components with TypeScript interfaces
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  className?: string;
}

export function Component({ requiredProp, optionalProp, className }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState(initialValue);
  const { data, isLoading } = useQuery(/*...*/);
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // Custom className merging utility
  const finalClassName = cn(baseClasses, className);
  
  return (
    <Card variant="solid" className={finalClassName}>
      {/* Component JSX */}
    </Card>
  );
}
```

### Service Architecture
```typescript
// Interface-based services with type safety
export interface NoteService {
  createNote(note: CreateNoteRequest): Promise<Note>;
  updateNote(id: string, updates: UpdateNoteRequest): Promise<Note>;
  deleteNote(id: string): Promise<void>;
}

// Implementation with proper error handling
export class TauriNoteService implements NoteService {
  async createNote(note: CreateNoteRequest): Promise<Note> {
    try {
      return await invoke('create_note', note);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw new Error(`Note creation failed: ${error}`);
    }
  }
}
```

---

## 🎯 Naming Conventions

### Files & Directories
- **Components**: PascalCase (`AIChatPanel.tsx`, `NoteEditor.tsx`)
- **Services**: camelCase with Service suffix (`aiService.ts`, `noteService.ts`)
- **Hooks**: camelCase with use prefix (`useSearchFilters.ts`, `useAIService.ts`)
- **Types**: camelCase (`shared/types.ts`, `feature/types.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `validateInput.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`, `DEFAULT_CONFIG.ts`)

### Variables & Functions
- **Variables**: camelCase (`selectedConversation`, `isStreaming`, `noteId`)
- **Functions**: camelCase with descriptive verbs (`getUserPermissions`, `calculateTokenUsage`)
- **Interfaces**: PascalCase with descriptive names (`AIRequest`, `SearchFilters`)
- **Types**: PascalCase for unions, camelCase for interfaces

### React Component Props
- **Props Interfaces**: `<Component>Props` pattern (`AIChatPanelProps`)
- **Destructuring**: Prefer named destructuring for clarity
- **Default Props**: Use TypeScript default values instead of defaultProps

---

## 🏗️ Architecture Guidelines

### Feature-Based Structure
```
src/features/[feature]/
├── [FeatureName]Page.tsx     # Main feature component
├── components/                  # Feature-specific components
├── hooks/                       # Feature-specific hooks
├── types.ts                     # Feature-specific types
└── README.md                    # Feature documentation
```

### Shared Layer Organization
```
src/shared/
├── components/              # Reusable UI components (Card, Button, Input)
├── services/               # Business logic services
├── hooks/                  # Global custom hooks
├── utils/                  # Utility functions
├── types.ts               # Shared type definitions
└── theme/                  # Design system (ThemeProvider, globals.css)
```

### Backend (Tauri) Structure
```
src-tauri/src/
├── main.rs                 # Application entry point
├── models.rs                # Data structures and types
├── services/                # Business logic layer
├── commands/                # Tauri command handlers
└── migrations/              # Database schema versions
```

---

## 🧪 Testing Strategy

### Test Framework: Vitest
```typescript
// Test file naming: *.test.ts or *.spec.ts
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should handle user interaction', async () => {
    render(<ComponentName {...props} />);
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
```

### Test Structure
- **Unit Tests**: 70% - Individual functions and components
- **Integration Tests**: 20% - Component interactions
- **E2E Tests**: 10% - Full user workflows
- **Coverage Targets**: Frontend >90%, Backend >95%, Critical paths 100%

### Mocking Patterns
```typescript
// Tauri command mocking
jest.mock('@tauri-apps/api/tauri', () => ({
  invoke: jest.fn(),
}));

// Service mocking
const mockService: MockService = {
  createNote: jest.fn(),
  updateNote: jest.fn(),
};
```

---

## 🎨 Design System Guidelines

### Atmospheric Theme (Glassmorphism)
```typescript
// Custom CSS variables for consistent theming
const theme = {
  colors: {
    'vibe-blue': '#3b82f6',
    'glass-bg': 'rgba(255, 255, 255, 0.05)',
    'glass-border': 'rgba(255, 255, 255, 0.1)',
  },
  effects: {
    'backdrop-blur': 'blur(20px)',
    'depth-shadow': '0 10px 40px rgba(0, 0, 0, 0.3)',
    'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
  }
};
```

### Component Library
```typescript
// Glassmorphic card component
const GlassCard = ({ children, className, ...props }) => (
  <div 
    className={cn(
      "bg-white/5 backdrop-blur-2xl border border-white/10",
      "shadow-atmosphere rounded-2xl",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
```

### Motion Requirements
- **Framer Motion**: Required for all page transitions and modal openings
- **Layout Prop**: Use for smooth enter/exit animations
- **Micro-interactions**: Hover states, button clicks, loading spinners
- **No Static Elements**: Every UI element needs some animation or interaction

---

## ⚡ Performance Requirements

### Optimization Targets
-
