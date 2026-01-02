# Story 3.3: Role-Based Search Scoping

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Learner,
I want my search results to exclude work project files,
so that I can focus entirely on my studies.

## Acceptance Criteria

1. [ ] **Given** "Learner" role, **When** I search using `Cmd+K`, **Then** the results automatically filter out folders tagged `#work`
2. [ ] **Given** "Manager" role, **When** I search, **Then** results prioritize `#project` tagged notes
3. [ ] **Given** any role, **When** I toggle "Global Search", **Then** the role-based restrictions are temporarily bypassed
4. [ ] **Given** the role store, **When** I switch roles, **Then** the search scope updates immediately without reloading

## Tasks / Subtasks

- [ ] Backend (Rust)
  - [ ] Extend search service to accept role-based filter parameters (AC: #1, #2)
  - [ ] Implement tag-based exclusion logic for Learner role (AC: #1)
  - [ ] Implement tag-based prioritization logic for Manager role (AC: #2)
  - [ ] Add "Global Search" toggle parameter to bypass role filters (AC: #3)
  - [ ] Create database queries for tag filtering in FTS5 search (AC: #1, #2)

- [ ] Frontend (React)
  - [ ] Extend CommandPalette to read active role from global store (AC: #4)
  - [ ] Implement role-based search filter logic in search handler (AC: #1, #2)
  - [ ] Add "Global Search" toggle UI to CommandPalette (AC: #3)
  - [ ] Update search results in real-time on role switch (AC: #4)
  - [ ] Visual indicator showing active role-based filters (AC: #1, #2, #3)

## Dev Notes

### Architecture & Design

- **Frontend**: Extend existing `CommandPalette.tsx` from story 2-1 and 2-2
- **Backend**: Extend `search_service.rs` from story 2-2 (advanced filtering)
- **Database**: Leverage existing `tags` table and `note_tags` junction table
- **State Management**: Use existing role store from story 3-1 (Zustand)
- **Design System**: Follow "Rational Grid" - filter pills with 1px borders, monospace tags

### Technical Guardrails

- **Role Detection**: Use global role store (story 3-1) to determine active role
- **Tag Filtering**: 
  - Learner: Exclude notes with `#work` tag (WHERE NOT EXISTS with tag filter)
  - Manager: Prioritize notes with `#project` tag (ORDER BY CASE when tag exists)
- **Global Search Toggle**: Boolean flag that bypasses all role-based filtering
- **Search Query**: Extend existing FTS5 query with dynamic WHERE clauses
- **Performance**: Role switch must update search scope in <100ms
- **Real-time**: Search results update immediately when role changes

### Implementation Strategy

**Backend (Rust):**
1. Extend `search_notes()` command signature:
   ```rust
   fn search_notes(
     query: String,
     role: Option<String>,  // "manager", "learner", "peace"
     global_search: bool    // Bypass role filters
   ) -> SearchResult
   ```
2. Implement role-based filter builder:
   ```rust
   fn build_role_filters(role: &str) -> (String, Vec<String>) {
     match role {
       "learner" => ("AND NOT EXISTS (...)".to_string(), vec!["work".to_string()]),
       "manager" => ("ORDER BY CASE WHEN ...".to_string(), vec!["project".to_string()]),
       _ => ("".to_string(), vec![])
     }
   }
   ```
3. Modify FTS5 query to include role filters (unless global_search=true)
4. Return filter metadata in search results for UI display

**Frontend (React):**
1. Extend CommandPalette state:
   ```typescript
   const [globalSearch, setGlobalSearch] = useState(false);
   const activeRole = useRoleStore(state => state.activeRole);
   ```
2. Modify search handler to pass role and globalSearch flags:
   ```typescript
   const results = await invoke('search_notes', {
     query: searchInput,
     role: globalSearch ? null : activeRole,
     globalSearch: globalSearch
   });
   ```
3. Add global search toggle UI:
   - Checkbox or toggle switch in CommandPalette
   - Label: "Global Search (bypass role filters)"
   - Visual indicator when active
4. Implement role switch listener:
   ```typescript
   useEffect(() => {
     if (activeRole && searchInput) {
       // Re-run search with new role
       performSearch(searchInput);
     }
   }, [activeRole]);
   ```
5. Add visual filter indicators:
   - Show "Learner Mode: Excluding #work" when in learner role
   - Show "Manager Mode: Prioritizing #project" when in manager role
   - Show "Global Search Active" when toggle is on

### Project Structure Notes

- **Backend Extension**: Modify `src-tauri/src/services/search_service.rs` (from story 2-2)
- **Frontend Extension**: Modify `src/features/retrieval/components/CommandPalette.tsx` (from stories 2-1, 2-2)
- **State Management**: Use `src/shared/stores/roleStore.ts` (from story 3-1)
- **No new files**: This extends existing search and role infrastructure
- **Alignment**: Builds on advanced filtering patterns from story 2-2

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3 - Story 3.3] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#State Management] - Zustand for global state
- [Source: _bmad-output/implementation-artifacts/2-2-advanced-filtering-and-scoping.md] - Filter parsing patterns
- [Source: _bmad-output/implementation-artifacts/2-1-full-text-search-with-command-palette.md] - Command palette base
- [Source: _bmad-output/implementation-artifacts/3-1-global-role-store-and-thematic-switcher.md] - Role store patterns (if exists)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] Extend `search_notes()` command with role and global_search parameters
- [ ] Implement `build_role_filters()` for role-based query modification
- [ ] Learner role: Exclude `#work` tagged notes from results
- [ ] Manager role: Prioritize `#project` tagged notes (ORDER BY)
- [ ] Global search toggle: Bypass all role filters when true
- [ ] Return filter metadata for UI display

**Frontend Implementation:**
- [ ] Extend CommandPalette with global search toggle UI
- [ ] Read active role from role store (story 3-1 pattern)
- [ ] Pass role and globalSearch flags to search command
- [ ] Implement role switch listener for real-time updates
- [ ] Add visual indicators for active role-based filters
- [ ] Update search results immediately on role change

**Database Integration:**
- [ ] Tag-based exclusion: `WHERE NOT EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE t.name = 'work' AND nt.note_id = notes.id)`
- [ ] Tag-based prioritization: `ORDER BY CASE WHEN EXISTS (SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE t.name = 'project' AND nt.note_id = notes.id) THEN 0 ELSE 1 END`
- [ ] Combine with existing FTS5 search conditions

**Technical Decisions:**
- [ ] Use existing search service infrastructure from story 2-2
- [ ] Leverage role store from story 3-1 for active role detection
- [ ] Debounced search preserved (300ms) with role-aware query building
- [ ] Visual indicators show current filter state
- [ ] Global toggle provides escape hatch for role restrictions

### File List

- src-tauri/src/services/search_service.rs (Modified: Add role-based filtering)
- src/features/retrieval/components/CommandPalette.tsx (Modified: Global toggle, role awareness)
- src/shared/stores/roleStore.ts (Read-only: Use existing role store)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Extend search service with role filters
3. Frontend: Add global toggle and role-aware search
4. Test: Verify role switching updates search scope instantly
5. Code review: Validate against acceptance criteria

