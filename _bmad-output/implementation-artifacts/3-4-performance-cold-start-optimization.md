# Story 3.4: Performance & Cold Start Optimization

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want application to start quickly and stay responsive,
so that I can access my knowledge base instantly when needed.

## Acceptance Criteria

1. [ ] **Given** application is closed, **When** I launch it, **Then** it fully functional interface loads in <2 seconds (cold start).
2. [ ] **Given** application is running, **When** I switch between notes, **When** I switch completes in <100ms.
3. [ ] **Given** application window, **When** I minimize and restore, **Then** it returns instantly without reloading content.
4. [ ] **Given** 10,000+ notes, **When** I use the application, **Then** it remains responsive (no UI blocking) during AI synthesis.
5. [ ] **NFR:** Memory usage must not exceed 100MB base, 500MB with 10,000 notes.
6. [ ] **NFR:** The app must remain responsive (no UI blocking) during AI synthesis operations.

## Tasks / Subtasks

- [ ] Performance Analysis & Profiling (Backend)
  - [ ] Profile application startup time (target: <2s) (AC: #1)
  - [ ] Profile note switch time (target: <100ms) (AC: #2)
  - [ ] Profile memory usage with 10,000 notes (AC: #5)
  - [ ] Identify bottlenecks in AI synthesis (AC: #4)

- [ ] Backend Optimization (Rust)
  - [ ] Lazy load notes on app start (AC: #1)
  - [ ] Implement SQLite connection pooling for better performance (AC: #2)
  - [ ] Optimize database queries with proper indexing (AC: #3)
  - [ ] Cache frequently accessed data in memory (AC: #3)
  - [ ] Implement efficient FTS5 search indexing (AC: #3)

- [ ] Frontend Optimization (React)
  - [ ] Implement code splitting for faster initial load (AC: #1)
  - [ ] Add React.memo() to expensive components (AC: #1)
  - [ ] Implement virtualization for large note lists (AC: #1, #4)
  - [ ] Optimize re-renders with useMemo/useCallback (AC: #2)
  - [ ] Add loading skeletons while data loads (AC: #5)

- [ ] AI Synthesis Non-Blocking (Both)
  - [ ] Ensure AI operations run in background thread (AC: #4)
  - [ ] Implement streaming responses to prevent UI freezing (AC: #4)
  - [ ] Add progress indicators for AI operations (AC: #5)
  - [ ] Cache AI responses in memory for quick access (AC: #3)

## Dev Notes

### Architecture & Design

- **Frontend**: Optimize all components for performance
- **Backend**: Rust performance improvements, database optimization
- **Design System**: Maintain "Rational Grid" while optimizing (no animations that hurt performance)
- **Performance Targets**: <2s cold start, <100ms switch, 100MB base memory

### Technical Guardrails

- **Code Splitting**: Use `React.lazy()` for route-based components
- **Virtualization**: Implement windowing for lists >100 items to prevent DOM thrashing
- **React Optimizations**: 
  - React.memo() for components that don't re-render often
  - useMemo() for expensive calculations
  - useCallback() for event handlers to prevent recreation
- **Database Optimization**:
  - SQLite prepared statements with proper indexing
  - Connection pooling (reuse database connections)
  - LIMIT queries to prevent loading all notes at once
  - FTS5 index kept up-to-date
- **Memory Management**:
  - Implement soft memory limits (warn at 80MB, error at 500MB)
  - Clear old cache data when memory pressure detected
  - Lazy loading for large datasets (load on demand)
- **Performance Targets**:
  - Cold start: <2 seconds (measure time from process start to first render)
  - Note switch: <100ms (measure time from click to render)
  - Memory: <100MB base, <500MB with 10,000 notes
  - AI operations: No UI blocking (stream responses)

### Implementation Strategy

**Backend Performance Analysis:**
1. Add profiling instrumentation:
   ```rust
   #[cfg(feature = "profiling")]
   use std::time::Instant;
   
   pub struct PerformanceMetrics {
       pub startup_time_ms: u64,
       pub note_switch_ms: u64,
       pub peak_memory_mb: u64,
   }
   ```
2. Lazy load implementation:
   ```rust
   #[tauri::command]
   pub async fn load_initial_notes_batch(limit: usize) -> Result<Vec<Note>, PerformanceMetrics> {
       let start = Instant::now();
       let notes = db.fetch_notes_with_limit(limit)?;
       let elapsed = start.elapsed().as_millis();
       metrics = PerformanceMetrics { startup_time_ms: elapsed, ... };
       Ok(notes, metrics)
   }
   ```

**Frontend Optimization:**
1. Code splitting with React.lazy():
   ```typescript
   import { lazy } from 'react';
   
   const Dashboard = lazy(() => import('./Dashboard'));
   const NoteEditor = lazy(() => import('./NoteEditor'));
   const GraphView = lazy(() => import('./GraphView'));
   ```
2. Virtualization for large lists:
   ```typescript
   import { FixedSizeList } from 'react-window';
   
   const NoteList = ({ notes }: NoteListProps) => {
     return (
       <FixedSizeList
         height={600}
         itemCount={notes.length}
         width="100%"
         itemSize={50}  // Fixed height per item
       >
         {(visibleNotes) => (
           <NoteCard key={note.id} note={note} />
         )}
       </FixedSizeList>
     );
   };
   ```
3. Memoization:
   ```typescript
   import { memo, useMemo, useCallback } from 'react';
   
   const NoteCard = memo(({ note }: NoteCardProps) => {
     const handleClick = useCallback(() => {
       navigateToNote(note.id);
     }, [note.id]);
     
     return <div onClick={handleClick}>...</div>;
   });
   ```
4. Loading skeletons:
   ```typescript
   const NoteListSkeleton = () => (
     <div className="space-y-3">
       {[1, 2, 3, 4, 5].map((i) => (
         <div className="h-20 animate-pulse" key={i}>
           <div className="h-4 bg-neutral-100 rounded"></div>
         </div>
       ))}
     </div>
   );
   ```

**AI Non-Blocking:**
1. Background thread for AI operations:
   ```typescript
   // AI synthesis runs in Rust worker or separate thread
   const handleSynthesis = async (prompt: string) => {
     // UI remains responsive, updates come via events
     const response = await invoke('synthesize_query', {
       prompt,
       background: true  // AC #4: Run in background
     });
     handleStreamingResponse(response);  // AC #4: Stream results
   };
   ```
2. Progress indicators:
   ```typescript
   const SynthesisPanel = () => {
     const { isSynthesizing, progress } = useSynthesisStore();
     
     return (
       <div>
         {isSynthesizing && (
           <div className="animate-pulse">AI thinking...</div>
         )}
         {progress > 0 && (
           <ProgressBar progress={progress} />  // AC #5: Show progress
         )}
       </div>
     );
   };
   ```

**Memory Management:**
1. Implement memory monitoring:
   ```typescript
   const { memoryUsage, clearCache } = usePerformanceStore();
   
   useEffect(() => {
     if (memoryUsage > 500000000) {  // 500MB in bytes
       alert("Memory limit reached. Some features may be limited.");
       clearCache();  // Free memory
     }
   }, [memoryUsage]);
   ```
2. Lazy loading strategies:
   ```typescript
   const { visibleNotes } = useNoteStore();
   
   // Only render what's visible on screen
   const displayedNotes = useMemo(() => {
     return notes.slice(0, visibleLimit);
   }, [notes, visibleLimit]);
   ```

### Project Structure Notes

- **Backend New Services**: `src-tauri/src/services/performance_service.rs` (New)
- **Backend Commands**: `src-tauri/src/commands/performance_commands.rs` (New: Profiling)
- **Frontend Optimizations**: Update existing components with memo, virtualization
- **Performance Monitoring**: `src/shared/stores/performanceStore.ts` (New: Memory usage, metrics)
- **No Breaking Changes**: All optimizations are additive, maintain existing functionality
- **Alignment**: Builds on existing component patterns from stories 1.2, 1.3, 1.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3 - Story 3.4] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#Performance Requirements] - Memory targets, responsiveness
- [Source: https://react.dev/learn/render-and-performance] - React optimization best practices
- [Source: _bmad-output/implementation-artifacts/2-3-multi-document-ai-synthesis.md] - AI non-blocking patterns (just created)
- [Source: _bmad-output/implementation-artifacts/2-1-full-text-search-with-command-palette.md] - Efficient list rendering (if exists)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] Add performance profiling instrumentation
- [ ] Implement lazy load batch for app startup
- [ ] Optimize SQLite queries with connection pooling
- [ ] Add FTS5 index maintenance and optimization
- [ ] Implement caching layer for frequently accessed data

**Frontend Implementation:**
- [ ] Implement React.lazy() code splitting for routes
- [ ] Add FixedSizeList virtualization for large note lists
- [ ] Add React.memo() to expensive components
- [ ] Implement useMemo/useCallback optimizations
- [ ] Add loading skeletons for better perceived performance
- [ ] Optimize re-renders with proper dependencies

**AI Non-Blocking:**
- [ ] Ensure AI operations run in background thread
- [ ] Implement streaming responses to prevent UI freezing
- [ ] Add progress indicators for AI synthesis
- [ ] Cache AI responses for quick access

**Performance Monitoring:**
- [ ] Create `performanceStore` for memory tracking
- [ ] Add memory warning system (80MB warn, 500MB error)
- [ ] Implement lazy loading for large datasets
- [ ] Add performance metrics dashboard (optional)
- [ ] Create performance mode toggle for low-end devices

**Technical Notes:**
- [ ] Code splitting reduces initial bundle size by ~40%
- [ ] Virtualization prevents DOM thrashing with >1000 items
- [ ] Connection pooling reduces query latency by ~30%
- [ ] React.memo() prevents unnecessary re-renders for pure components
- [ ] AI in background thread: use Tauri async commands
- [ ] Streaming: Update UI via events, not blocking renders

### File List

- src-tauri/src/services/performance_service.rs (New: Performance monitoring service)
- src-tauri/src/commands/performance_commands.rs (New: Profiling commands)
- src-tauri/Cargo.toml (Modified: Add feature flag for profiling)
- src/features/dashboard/components/Dashboard.tsx (Modified: React.lazy for code splitting)
- src/features/notes/components/NoteList.tsx (Modified: FixedSizeList virtualization)
- src/features/notes/components/NoteCard.tsx (Modified: React.memo optimization)
- src/shared/stores/performanceStore.ts (New: Memory usage tracking)
- src/app/App.tsx (Modified: Add performance monitoring)
- src/features/ai/components/SynthesisPanel.tsx (Modified: Streaming, progress indicators)
- src/features/retrieval/components/CommandPalette.tsx (Modified: Loading skeletons)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Implement performance profiling and optimizations
3. Frontend: Code splitting, virtualization, memoization
4. Test: Measure cold start time (<2s target)
5. Test: Verify <100ms note switching
6. Code review: Validate memory usage and AI non-blocking
