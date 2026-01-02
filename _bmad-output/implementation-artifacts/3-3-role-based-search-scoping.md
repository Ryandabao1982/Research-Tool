# Story 3-3: Role-Based Search Scoping

**Epic:** 3 - Adaptive Workflows (Role-Based Contexts)  
**Status:** Ready for Dev  
**Priority:** High  
**Estimate:** 2 hours  
**Created:** 2026-01-02

---

## 🎯 Objective

Implement a role-aware search modal that filters results based on the user's active role (Manager/Learner/Coach), providing contextually relevant search experiences.

---

## 📋 Acceptance Criteria

### Core Functionality
- [ ] **Cmd+K Integration**: Global keyboard shortcut opens search modal
- [ ] **Role-Based Filtering**: Search results filtered by active role
- [ ] **Manager Role**: Sees notes + tasks + projects + team members
- [ ] **Learner Role**: Sees notes + learning materials + courses + flashcards
- [ ] **Coach Role**: See notes + team members + templates + coaching frameworks
- [ ] **Empty State**: Helpful message when no results found
- [ ] **Loading State**: Skeleton loader during search execution

### UI/UX Requirements
- [ ] **Modal Design**: Full-screen overlay with backdrop blur
- [ ] **Search Input**: Auto-focus on open, clear button, loading indicator
- [ ] **Result Items**: Role-specific icons, titles, descriptions, badges
- [ ] **Keyboard Navigation**: Arrow keys to navigate, Enter to select, Esc to close
- [ ] **Recent Searches**: Show last 5 searches (optional stretch goal)
- [ ] **Accessibility**: ARIA labels, keyboard-only navigation, screen reader support

### Performance
- [ ] **Debounced Search**: 300ms debounce on input
- [ ] **Lazy Loading**: Load search index on-demand
- [ ] **Smooth Animations**: Framer Motion for enter/exit transitions
- [ ] **No Jank**: 60fps during typing and navigation

### Testing
- [ ] **Unit Tests**: All search logic tested
- [ ] **Integration Tests**: Modal open/close, keyboard navigation
- [ ] **Role Tests**: Each role sees correct results
- [ ] **Edge Cases**: Empty query, no results, network errors

---

## 🏗️ Implementation Plan

### Phase 1: Core Components (30 min)

**Files to Create:**
- `src/features/search/components/RoleSearchModal.tsx`
- `src/features/search/components/SearchResultItem.tsx`
- `src/features/search/hooks/useRoleSearch.ts`

**Key Features:**
- Cmd+K keyboard shortcut
- Role-based filtering
- Debounced search (300ms)
- Keyboard navigation (↑↓, Enter, Esc)
- Framer Motion animations

### Phase 2: Backend Integration (30 min)

**Files to Create:**
- `src-tauri/src/commands/search_commands.rs`
- `src-tauri/migrations/0007_create_search_index.sql`

**Backend Logic:**
- SQL query with role-based filtering
- Type and role validation
- Full-text search on title/description
- Result limiting and ordering

### Phase 3: Global Integration (20 min)

**Files to Modify:**
- `src/app/App.tsx` (add keyboard shortcut)
- `src-tauri/src/main.rs` (register command)

**Integration:**
- Global Cmd+K trigger
- Modal state management
- Search modal in app tree

### Phase 4: Testing (30 min)

**Files to Create:**
- `src/features/search/tests/RoleSearchModal.test.tsx`
- `src/features/search/tests/useRoleSearch.test.ts`

**Test Coverage:**
- Modal rendering
- Role filtering
- Keyboard navigation
- Debouncing
- Error handling
- Edge cases

---

## 📊 Data Model

### Search Index Table
```sql
CREATE TABLE search_index (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    role TEXT NOT NULL,
    metadata JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_type_role ON search_index(type, role);
CREATE INDEX idx_search_title ON search_index(title);
```

---

## 🎨 UI Design

```
┌─────────────────────────────────────────────────────┐
│  [🔍 Search...]                                    │
├─────────────────────────────────────────────────────┤
│  📝  Project Q4 Review                             │
│      Budget analysis for Q4 2024                   │
│      [manager]                                     │
│                                                     │
│  ✅  Team Standup                                 │
│      Daily sync with engineering team              │
│      [manager]                                     │
├─────────────────────────────────────────────────────┤
│  ⏎ Select  ⎋ Close                    Role: Manager │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Success Metrics

- Cmd+K opens search ✅
- Role filters work ✅
- Keyboard navigation ✅
- Debouncing works ✅
- 100% test coverage ✅
- Performance < 500ms ✅

---

## 🔗 Related Files

**Created:**
- RoleSearchModal.tsx
- SearchResultItem.tsx
- useRoleSearch.ts
- search_commands.rs
- Keyboard shortcut hook

**Modified:**
- App.tsx
- main.rs

---

**Status:** Ready to implement  
**Next:** Start Phase 1
