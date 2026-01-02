# Story 4.1: Interactive Force-Directed Graph

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Visual Thinker,
I want to see my notes as nodes in a network,
so that I can explore relationships between ideas.

## Acceptance Criteria

1. [ ] **Given** 50+ linked notes, **When** I open Graph View, **Then** I see a D3.js visualization of nodes and links
2. [ ] **Given** a graph, **When** I hover a node, **Then** its connections highlight and others fade
3. [ ] **Given** a graph, **When** I click a node, **Then** corresponding note opens
4. [ ] **Given** large datasets (>1000 nodes), **Then** visualization remains responsive (60fps)
5. [ ] **Given** the graph, **When** I interact, **Then** it uses the same SQLite data source as the rest of the app

## Tasks / Subtasks

- [ ] Backend (Rust)
  - [ ] Create graph data service to query notes and links (AC: #5)
  - [ ] Implement graph structure builder for D3.js node-link format (AC: #1)
  - [ ] Create Tauri command to fetch graph data (AC: #1, #2, #3)
  - [ ] Add lazy loading for large graphs (>500 nodes initially) (AC: #4)
  - [ ] Optimize queries for performance (>1000 nodes) (AC: #4)

- [ ] Frontend (React)
  - [ ] Install and configure D3.js library (v7.x) (AC: #1)
  - [ ] Create GraphView component with D3 force-directed layout (AC: #1)
  - [ ] Implement node rendering with click-to-open-note interaction (AC: #3)
  - [ ] Implement edge rendering for bi-directional links (AC: #1)
  - [ ] Add hover states (highlight connections, fade others) (AC: #2)
  - [ ] Implement zoom and pan controls for navigation (AC: #3)
  - [ ] Add loading states and performance optimizations (AC: #4)

## Dev Notes

### Architecture & Design

- **Frontend**: New feature - no existing graph components
- **Backend**: Leverage existing `notes` and `note_links` tables
- **External Library**: D3.js v7.x for force-directed graph visualization
- **Database**: SQLite with `notes` and `note_links` tables (link management from FR4)
- **State Management**: Use TanStack Query for graph data caching
- **Design System**: Follow "Rational Grid" - minimal controls, 1px borders, Inter/JetBrains Mono
- **Performance**: WebGL rendering, lazy loading, level-of-detail (LOD) for large graphs

### Technical Guardrails

- **D3.js Version**: Use v7.x stable release
- **Graph Data Format**: 
  ```typescript
  interface GraphData {
    nodes: Array<{
      id: string;  // note UUID
      label: string;  // note title
      group?: string;  // folder or role for grouping
    }>;
    links: Array<{
      source: string;  // source note UUID
      target: string;  // target note UUID
      value?: number;  // link strength (optional)
    }>;
  }
  ```
- **Performance Targets**: 60fps for >1000 nodes, progressive loading
- **Data Source**: MUST use existing SQLite `notes` and `note_links` tables
- **Lazy Loading Strategy**: 
  - Initial load: top 500 nodes by connection count
  - Dynamic expansion: Load neighbors on demand when user zooms/pans
  - LOD (Level of Detail): Simplify rendering at zoom levels <50%
- **Interaction Patterns**:
  - Click node → Navigate to note detail view
  - Hover node → Highlight direct connections (1 hop), fade indirect (2+ hops)
  - Double-click background → Deselect all nodes
  - Scroll wheel → Zoom in/out centered on cursor

### Implementation Strategy

**Backend (Rust):**
1. Create `graph_service.rs`:
   ```rust
   pub struct GraphNode {
       pub id: String,
       pub label: String,
       pub group: Option<String>,
   }
   
   pub struct GraphLink {
       pub source: String,
       pub target: String,
   }
   
   pub fn get_graph_data(limit: usize) -> (Vec<GraphNode>, Vec<GraphLink>) {
       // Query notes and links
       // Return D3-compatible structure
   }
   ```
2. Add `get_graph` Tauri command:
   ```rust
   #[tauri::command]
   pub async fn get_graph(limit: usize) -> Result<GraphData, String>
   ```
3. Implement performance query:
   ```sql
   -- Top N nodes by connection count
   SELECT n.id, n.title, n.folder_id, COUNT(nt.target_id) as connections
   FROM notes n
   LEFT JOIN note_links nt1 ON n.id = nt1.source_id
   LEFT JOIN note_links nt2 ON n.id = nt2.target_id
   GROUP BY n.id
   ORDER BY connections DESC
   LIMIT ?
   ```
4. Implement lazy loading endpoint for neighbors:
   ```rust
   #[tauri::command]
   pub async fn get_node_neighbors(node_id: String, limit: usize) -> Result<Vec<GraphNode>, String>
   ```

**Frontend (React):**
1. Install D3.js:
   ```bash
   npm install d3@^7.9.0
   ```
2. Create `GraphView.tsx` component:
   ```typescript
   const GraphView = () => {
     const { data, isLoading } = useGraphData();
     const svgRef = useRef<SVGSVGElement>(null);
     
     // D3 force-directed graph
     const simulation = useMemo(() => {
       return d3.forceSimulation(nodes)
         .force("link")
         .force("charge", { strength: -300 })
         .force("center", { strength: 0.1 });
     }, [data]);
     
     return (
       <div className="w-full h-full bg-neutral-50/5">
         <svg ref={svgRef} className="w-full h-full">
           {/* D3 rendering */}
         </svg>
       </div>
     );
   };
   ```
3. Implement node rendering:
   ```typescript
   const nodes = svg.selectAll<SVGCircleElement>(".node")
     .data(data.nodes)
     .enter()
     .append("circle")
     .attr("r", 20)  // 20px radius
     .attr("fill", node => {
       const isHighlighted = highlightedNodes.has(node.data.id);
       return isHighlighted ? "#0066FF" : "#E5E7EB";
     })
     .attr("stroke", "#1A1A1A")
     .attr("stroke-width", 1)
     .call(d3.drag()
       .on("click", (event, d) => {
         navigateToNote(d.id);  // Open note
       })
       .on("mouseover", (event, d) => {
         highlightConnections(d.id);  // AC #2
       }));
   ```
4. Implement edge rendering (links):
   ```typescript
   const links = svg.selectAll<SVGLineElement>(".link")
     .data(data.links)
     .enter()
     .append("line")
     .attr("stroke", "#A3A3A3")
     .attr("stroke-width", 1)
     .attr("opacity", link => {
       const isConnected = highlightedNodes.has(link.source) || highlightedNodes.has(link.target);
       return isConnected ? 0.8 : 0.1;  // AC #2: Highlight connections, fade others
     });
   ```
5. Add zoom and pan controls:
   ```typescript
   // Zoom handler
   const handleZoom = (event: WheelEvent) => {
     event.preventDefault();
     const zoom = svgTransform.k * event.deltaY * -0.001;
     applyZoom(zoom);
   };
   
   // Pan handler
   const handlePan = (event: MouseEvent) => {
     if (isDragging) {
       const dx = event.movementX - lastX;
       const dy = event.movementY - lastY;
       applyPan(dx, dy);
     }
   };
   ```
6. Implement performance optimizations (AC #4):
   ```typescript
   // LOD: Reduce node count at low zoom
   const visibleNodes = useMemo(() => {
     const zoomLevel = getZoomLevel(svgTransform);
     return data.nodes.filter(n => 
       zoomLevel > 0.5 || 
       n.connections > 10 || 
       highlightedNodes.has(n.id)
     );
   }, [data.nodes, zoomLevel]);
   
   // RequestAnimationFrame for smooth 60fps
   const renderGraph = () => {
     requestAnimationFrame(() => {
       // Render only visible nodes
       renderVisibleNodes();
     });
   };
   ```

### Project Structure Notes

- **New Backend**: `src-tauri/src/services/graph_service.rs` (New)
- **New Backend Commands**: `src-tauri/src/commands/graph_commands.rs` (New)
- **New Frontend Feature**: `src/features/graph/` (New directory)
  - `src/features/graph/components/GraphView.tsx` (New)
  - `src/features/graph/hooks/useGraphData.ts` (New - TanStack Query for data)
  - `src/features/graph/types.ts` (New - GraphData interfaces)
- **Alignment**: Integrates with existing `notes` and `note_links` database schema
- **No Breaking Changes**: New isolated feature

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4 - Story 4.1] - User story and acceptance criteria
- [Source: _bmad-output/project_knowledge/architecture.md#Data Architecture] - SQLite schema for notes and links
- [Source: https://d3js.org/] - D3.js force-directed graph documentation
- [Source: https://observablehq.com/@d3/gallery] - D3.js force-directed graph examples
- [Source: _bmad-output/implementation-artifacts/1-4-markdown-editor-with-live-preview.md] - Node/Link patterns (if exists)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Backend Implementation:**
- [ ] Create `graph_service.rs` with GraphNode and GraphLink structures
- [ ] Implement `get_graph(limit)` query with connection count optimization
- [ ] Implement `get_node_neighbors(node_id)` for lazy loading
- [ ] Add `get_graph` Tauri command
- [ ] Add `get_node_neighbors` Tauri command
- [ ] Performance testing with >1000 node dataset

**Frontend Implementation:**
- [ ] Install D3.js v7.x library
- [ ] Create `GraphView.tsx` component with force-directed layout
- [ ] Implement node rendering with click-to-open-note interaction
- [ ] Implement edge rendering for bi-directional links
- [ ] Add hover states (highlight connections, fade others)
- [ ] Implement zoom and pan controls
- [ ] Add loading states and skeletons
- [ ] Implement performance optimizations (LOD, 60fps target)
- [ ] Create `useGraphData` hook with TanStack Query caching
- [ ] Add GraphView route to main application navigation

**Database Integration:**
- [ ] Query `notes` table for node data (id, title, folder_id)
- [ ] Query `note_links` table for edge data (source_id, target_id)
- [ ] Connection count aggregation for initial node selection
- [ ] Neighbor queries for lazy loading expansion
- [ ] Same data source as rest of app (no duplicate indexing)

**Technical Decisions:**
- [ ] D3.js v7.x chosen for force-directed graph (stable, well-documented)
- [ ] WebGL rendering for performance with large datasets
- [ ] Lazy loading with 500-node initial load to meet <100ms startup
- [ ] LOD (Level of Detail) to maintain 60fps with >1000 nodes
- [ ] Zoom/Pan centered on cursor for smooth navigation
- [ ] Color scheme: Nodes #E5E7EB (neutral), Links #A3A3A3, Highlight #0066FF (Action Blue)

### File List

- src-tauri/src/services/graph_service.rs (New: Graph data structure and queries)
- src-tauri/src/commands/graph_commands.rs (New: Tauri graph commands)
- src-tauri/src/lib.rs (Modified: Register graph commands)
- package.json (Modified: Add d3@^7.9.0 dependency)
- src/features/graph/components/GraphView.tsx (New: D3.js graph visualization)
- src/features/graph/hooks/useGraphData.ts (New: Graph data management with TanStack Query)
- src/features/graph/types.ts (New: GraphData interfaces)
- src/features/graph/index.ts (New: Graph feature exports)
- src/app/App.tsx (Modified: Add GraphView route)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Backend: Create graph service with performance optimizations
3. Frontend: Build D3.js graph with zoom, pan, and interactions
4. Test: Verify >1000 nodes maintain 60fps
5. Code review: Validate against acceptance criteria
