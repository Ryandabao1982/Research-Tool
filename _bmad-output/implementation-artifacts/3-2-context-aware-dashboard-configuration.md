# Story 3.2: Context-Aware Dashboard Configuration

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Manager,
I want my dashboard to show different widgets than when I am a Learner,
so that I see relevant information first.

## Acceptance Criteria

1. [ ] **Given** "Manager" role, **When** I view the dashboard, **Then** it shows "Tasks Padding" and "Project Deadlines" widgets
2. [ ] **Given** "Learner" role, **When** I view the dashboard, **Then** it shows "Spaced Repetition Queue" and "Reading List" widgets
3. [ ] **Given** a dashboard, **When** I reorder widgets, **Then** that layout is saved specifically for the active role
4. [ ] **Given** I switch roles, **When** the dashboard loads, **Then** it immediately reflects the role-specific widget configuration
5. [ ] **Given** the role store, **When** I switch roles, **Then** the dashboard updates without requiring a page reload

## Tasks / Subtasks

- [ ] Backend (Rust)
  - [ ] Extend role store to persist dashboard layouts per role (AC: #3)
  - [ ] Create database schema for role-based widget configurations (AC: #3)
  - [ ] Implement Tauri commands for saving/loading role-specific layouts (AC: #3, #5)
  - [ ] Add validation for widget configuration integrity (AC: #3)

- [ ] Frontend (React)
  - [ ] Create Dashboard component that reads active role from global store (AC: #4, #5)
  - [ ] Implement widget registry with role-based filtering (AC: #1, #2)
  - [ ] Build widget layout manager with drag-and-drop (AC: #3)
  - [ ] Persist layout changes to backend when widgets are reordered (AC: #3)
  - [ ] Implement real-time dashboard updates on role switch (AC: #5)
  - [ ] Create role-specific widget components:
    - [ ] Manager widgets: "Tasks Padding", "Project Deadlines"
    - [ ] Learner widgets: "Spaced Repetition Queue", "Reading List"

## Dev Notes

### Architecture & Design

- **Frontend**: Extend existing Dashboard infrastructure from story 2-5 (dashboard rebuild)
- **Backend**: Extend role store service from story 3-1 (Global Role Store)
- **Database**: Add `role_dashboard_layouts` table to persist widget configurations per role
- **Design System**: Follow "Rational Grid" principles (8px spacing, 1px borders, zero border-radius)
- **State Management**: Use existing role store pattern from story 3-1

### Technical Guardrails

- **Role Detection**: Use existing global role store (Zustand) from story 3-1
- **Widget Registry**: Centralized registry mapping widget IDs to components with role metadata
- **Layout Persistence**: Store as JSON array of widget IDs with position/order
- **Database Schema**: 
  ```sql
  CREATE TABLE role_dashboard_layouts (
    role TEXT PRIMARY KEY,
    widget_order JSON NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Performance**: Dashboard switch must complete in <100ms (no page reload)
- **Error Handling**: If role-specific layout missing, fall back to default layout

### Implementation Strategy

**Backend (Rust):**
1. Add `role_dashboard_layouts` table to SQLite schema
2. Implement `save_dashboard_layout(role, widget_order)` command
3. Implement `load_dashboard_layout(role)` command
4. Add validation: widget_order must be valid JSON array of widget IDs
5. Handle migration: existing roles get default layouts on first load

**Frontend (React):**
1. Extend Dashboard component to subscribe to role store changes
2. Create `useDashboardLayout` hook that:
   - Loads layout from backend on mount
   - Subscribes to role changes
   - Updates layout when role changes
3. Implement `WidgetRegistry` with role metadata:
   ```typescript
   const widgetRegistry = {
     'tasks-padding': { 
       component: TasksPaddingWidget, 
       roles: ['manager'],
       name: 'Tasks Padding'
     },
     'project-deadlines': { 
       component: ProjectDeadlinesWidget, 
       roles: ['manager'],
       name: 'Project Deadlines'
     },
     'spaced-repetition': { 
       component: SpacedRepetitionWidget, 
       roles: ['learner'],
       name: 'Spaced Repetition Queue'
     },
     'reading-list': { 
       component: ReadingListWidget, 
       roles: ['learner'],
       name: 'Reading List'
     }
   };
   ```
4. Build drag-and-drop layout manager (use existing patterns from story 2-5)
5. Implement auto-save on layout change with debouncing
6. Add visual feedback when switching roles (instant update indicator)

### Project Structure Notes

- **Backend Extension**: Modify `src-tauri/src/services/role_service.rs` (from story 3-1)
- **Database Migration**: Add `src-tauri/migrations/0005_add_role_dashboard_layouts.sql`
- **Frontend Extension**: Modify `src/features/dashboard/components/Dashboard.tsx` (from story 2-5)
- **New Files**:
  - `src/features/dashboard/hooks/useDashboardLayout.ts` - Hook for layout management
  - `src/features/dashboard/components/WidgetRegistry.ts` - Widget registry with role metadata
  - `src/features/dashboard/components/DraggableWidgetContainer.tsx` - Drag-and-drop wrapper
- **Alignment**: Follows established patterns from story 3-1 for role management and story 2-5 for dashboard

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3 - Story 3.2] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#State Management] - Zustand for global UI state
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System: "Rational Grid"] - 8px grid, 1px borders, zero border-radius
- [Source: _bmad-output/implementation-artifacts/2-4-contextual-sidebar-ambient-ai.md] - Previous dashboard patterns
- [Source: _bmad-output/implementation-artifacts/2-2-advanced-filtering-and-scoping.md] - Frontend state patterns

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] SQLite schema for `role_dashboard_layouts` table
- [ ] Tauri command: `save_dashboard_layout(role, widget_order)`
- [ ] Tauri command: `load_dashboard_layout(role)`
- [ ] Input validation and error handling
- [ ] Database migration script

**Frontend Implementation:**
- [ ] Dashboard component role subscription
- [ ] `useDashboardLayout` hook implementation
- [ ] Widget registry with role filtering
- [ ] Drag-and-drop layout manager
- [ ] Auto-save functionality with debouncing
- [ ] Real-time role switch updates
- [ ] Visual feedback for layout changes

**Database Integration:**
- [ ] Schema: `role_dashboard_layouts(role TEXT PRIMARY KEY, widget_order JSON)`
- [ ] CRUD operations for layout persistence
- [ ] Default layout fallback logic

**Technical Decisions:**
- [ ] Use existing role store from story 3-1 (Zustand)
- [ ] JSON storage for flexible widget ordering
- [ ] Debounced auto-save (300ms) to prevent excessive writes
- [ ] Role-based widget filtering in registry
- [ ] No page reload on role switch (SPA pattern)

### File List

- src-tauri/src/services/role_service.rs (Modified: Add layout persistence methods)
- src-tauri/migrations/0005_add_role_dashboard_layouts.sql (New: Database schema)
- src-tauri/src/commands/dashboard_commands.rs (New: Tauri commands for layouts)
- src/features/dashboard/components/Dashboard.tsx (Modified: Role subscription, layout loading)
- src/features/dashboard/hooks/useDashboardLayout.ts (New: Layout management hook)
- src/features/dashboard/components/WidgetRegistry.ts (New: Widget registry with roles)
- src/features/dashboard/components/DraggableWidgetContainer.tsx (New: Drag-and-drop wrapper)
- src/features/dashboard/components/manager-widgets/TasksPaddingWidget.tsx (New: Manager widget)
- src/features/dashboard/components/manager-widgets/ProjectDeadlinesWidget.tsx (New: Manager widget)
- src/features/dashboard/components/learner-widgets/SpacedRepetitionWidget.tsx (New: Learner widget)
- src/features/dashboard/components/learner-widgets/ReadingListWidget.tsx (New: Learner widget)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Implement database schema and Tauri commands
3. Frontend: Implement role-aware dashboard with widget registry
4. Test: Verify role switching updates dashboard instantly
5. Code review: Validate against acceptance criteria

