---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - "docs/technical-specifications.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/project_knowledge/architecture.md"
---

# Epics and Stories: secondbrain

## 1. Requirements Reference

### Functional Requirements (FRs)

FR1: Create, Update, Delete, Get Notes (UUID based)
FR2: Folder management (hierarchical)
FR3: Tag management (Many-to-Many)
FR4: Link management (bi-directional links, block-level refs)
FR5: Import/Export functionality (Markdown, various formats)
FR6: Backup/Restore database
FR7: Markdown editor with live preview
FR8: Modular Dashboard with widgets and calendar
FR9: Persistent Sidebar navigation
FR10: Client-side search interface (Command Palette)
FR11: Full-text search (SQLite FTS5)
FR12: Advanced search with filters (tags, dates)
FR13: Real-time search suggestions
FR14: Dynamic graph visualization (D3.js)
FR15: Multi-Document Synthesis (AI Bundle)
FR16: Contextual Sidebar (AI Insights)
FR17: Role-based Mode Switching (Manager/Learner)

### Non-Functional Requirements (NFRs)

NFR1: Cold start < 2 seconds
NFR2: Search results < 100ms
NFR3: Note persistence < 100ms
NFR4: Memory usage < 100MB base, < 500MB with 10k notes
NFR5: Support for 100k+ notes
NFR6: Bulk import 1000+ files/min
NFR7: Local-first architecture (data stays on device)
NFR8: Optional AES-256 encryption
NFR9: Input sanitization on all user inputs
NFR10: Cross-platform support (Windows, macOS, Linux)

### Additional Requirements (Architecture & UX)

- **Database**: SQLite with specific schema (Notes, Folders, Tags, Links, Blocks)
- **Tauri IPC**: Specific command signatures defined for all core operations.
- **Testing**: High coverage goals (>90% Frontend, >95% Backend).
- **Design System**: "Rational Grid" (Neo-Brutalist/Swiss Minimalist hybrid) - 8px grid, Inter + JetBrains Mono typography, 1px borders, zero border-radius.
- **Role Switching**: Visual density and layout changes based on user role (Manager/Learner) - not just color themes.
- **Graph Visualization**: D3.js force-directed interaction.
- **Keyboard Shortcuts**: Alt+Space (Capture), Cmd/Ctrl+K (Command Palette), Esc (Cancel/Escape).

---

## 2. Epics List

### Epic 1: Core Knowledge & Sovereignty (Foundation)
Users can create, organize, secure, and transfer their personal knowledge base.
**Goal:** Users can create, organize, secure, and transfer their personal knowledge base.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR9
**Stories:** 8

### Story 1.1: Project Setup and Data Sovereignty Utils
**As a** Developer (Proxy for User Security),
**I want** to establish the core SQLite database and Import/Export utilities,
**So that** the application has a secure data foundation that respects user ownership from Day 1.

**Acceptance Criteria:**
*   **Given** a clean installation, **When** the app launches, **Then** a SQLite database is created with `notes`, `folders`, and `tags` tables.
*   **Given** a folder of Markdown files, **When** I run the `import_files` command, **Then** they are parsed and stored in the database.
*   **Given** exiting notes, **When** I trigger `export_notes`, **Then** valid Markdown files are generated in the target directory.
*   **Given** the database exists, **When** I trigger `create_backup`, **Then** an encrypted COPY of the `.db` file is saved to the backup location.
*   **NFR:** Bulk import must process 1000+ files per minute.
*   **NFR:** All user inputs must be sanitized before database insertion to prevent injection attacks.
*   **NFR:** Application must support Windows, macOS, and Linux with consistent behavior.

### Story 1.2: Core Note Management (CRUD)
**As a** User,
**I want** to create, edit, and delete notes,
**So that** I can capture my thoughts.

**Acceptance Criteria:**
*   **Given** I am on the dashboard, **When** I click "New Note", **Then** a blank note is created with a UUID.
*   **Given** an open note, **When** I type content, **Then** it hits the `update_note` endpoint and saves to SQLite (auto-save).
*   **Given** a note, **When** I click delete, **Then** it is marked as deleted (soft delete) or removed from the database based on settings.
*   **Given** a saved note, **When** I restart the app, **Then** the content persists exactly as last saved.
*   **NFR:** Note persistence must complete in <100ms from user input to database commit.
*   **NFR:** The app must handle 100,000+ notes without performance degradation.
*   **NFR:** Memory usage must stay under 100MB base, 500MB with 10k notes.

### Story 1.3: Hierarchical Organization
**As a** User,
**I want** to organize notes into folders and apply tags,
**So that** I can structure my knowledge base effectively.

**Acceptance Criteria:**
*   **Given** the sidebar, **When** I click "New Folder", **Then** a folder is created in the DB.
*   **Given** a note, **When** I drag it into a folder, **Then** its `folder_id` is updated.
*   **Given** a note, **When** I type `#tag`, **Then** a new entry is created in the `tags` table and linked to the note.
*   **Given** the sidebar, **When** I expand a folder, **Then** I see its nested notes and subfolders.

### Story 1.4: Markdown Editor with Live Preview
**As a** Writer,
**I want** a rich markdown editor,
**So that** I can format my text without typing raw HTML.

**Acceptance Criteria:**
*   **Given** the editor, **When** I type `**bold**`, **Then** it renders as **bold** text immediately.
*   **Given** the editor, **When** I type `[[WikiLink]]`, **Then** it creates a bi-directional link to another note.
*   **Given** a WikiLink, **When** I click it, **Then** the application navigates to the target note.

### Story 1.5: Rapid Capture Modal (Alt+Space)
**As a** User,
**I want** to capture thoughts instantly from anywhere,
**So that** I can offload ideas without interrupting my workflow.

**Acceptance Criteria:**
*   **Given** any application context, **When** I press `Alt+Space`, **Then** a frameless capture modal opens instantly (<50ms).
*   **Given** the capture modal, **When** I type content, **Then** it auto-expands vertically to fit content.
*   **Given** the capture modal, **When** I press `Enter`, **Then** the note is saved with a generated title and the modal closes.
*   **Given** the capture modal, **When** I press `Esc`, **Then** the modal closes without saving.
*   **Given** a note is saved, **When** I return to the app, **Then** the note appears in Recent Notes.
*   **NFR:** The entire capture flow from keyboard shortcut to saved note must complete in <200ms.
*   **NFR:** Modal must work even when app is running in background.

### Story 1.6: Design System Foundation (Rational Grid)
**As a** User,
**I want** a consistent, visually clean interface,
**So that** I can focus on my content without visual distractions.

**Acceptance Criteria:**
*   **Given** the application, **When** I examine any component, **Then** it follows the "Rational Grid" 8px spacing system.
*   **Given** typography in the app, **When** I read long-form content, **Then** it uses Inter font at appropriate sizes.
*   **Given** metadata (tags, timestamps, IDs), **When** I view them, **Then** they use JetBrains Mono font for clarity.
*   **Given** buttons, **When** I interact with them, **Then** they follow the hierarchy: Primary (solid blue), Secondary (1px border), Tertiary (ghost).
*   **Given** all UI elements, **When** I observe corners, **Then** they have zero border-radius (sharp edges).
*   **Given** the color scheme, **When** I view the interface, **Then** it uses high-contrast black/white with Action Blue (#0066FF) accents.

### Story 1.7: Accessibility Compliance (WCAG AAA)
**As a** User with accessibility needs,
**I want** full keyboard navigation and screen reader support,
**So that** I can use the application effectively.

**Acceptance Criteria:**
*   **Given** any interactive element, **When** I tab to it, **Then** it has a visible 2px blue focus ring.
*   **Given** screen reader users, **When** I encounter icons, **Then** they have descriptive aria-labels.
*   **Given** the application, **When** I navigate with keyboard only, **Then** I can complete the full "Capture → Retrieve → Synthesize" loop without a mouse.
*   **Given** high contrast mode users, **When** I enable system high contrast, **Then** the interface remains usable with proper contrast ratios.
*   **Given** reduced motion users, **When** I have animations disabled, **Then** all decorative animations are disabled (functional transitions remain).
*   **Given** all text, **When** I measure contrast, **Then** it meets WCAG AAA standards (7:1 ratio minimum).

### Story 1.8: AES-256 Encryption (Optional)
**As a** Security-conscious User,
**I want** optional encryption for my notes,
**So that** my sensitive data remains protected even if my device is compromised.

**Acceptance Criteria:**
*   **Given** the settings panel, **When** I enable encryption, **Then** I can set a passphrase.
*   **Given** encryption is enabled, **When** I create or edit notes, **Then** content is encrypted with AES-256 before storage.
*   **Given** encryption is enabled, **When** I search notes, **Then** the search operates on decrypted content transparently.
*   **Given** I forget my passphrase, **When** I attempt recovery, **Then** I receive a warning that data cannot be recovered without the passphrase.
*   **Given** backup creation, **When** encryption is enabled, **Then** backup files are also encrypted with the same passphrase.
*   **NFR:** Encryption/decryption must not impact note persistence time (>100ms threshold).

### Epic 2: Retrieval & Ambient Intelligence

**Goal:** Users can instantly retrieve specific notes and synthesize new insights via AI.
**FRs covered:** FR10, FR11, FR12, FR13, FR15, FR16

### Story 2.1: Full-Text Search with Command Palette
**As a** Power User,
**I want** to search my entire knowledge base with a keyboard shortcut,
**So that** I can find information without taking my hands off the keyboard.

**Acceptance Criteria:**
*   **Given** any screen, **When** I press `Cmd/Ctrl+K`, **Then** the Command Palette modal opens instantly (<100ms).
*   **Given** the palette, **When** I type "project", **Then** I see results from SQLite FTS5 including notes title and content.
*   **Given** search results, **When** I press Down Arrow + Enter, **Then** I navigate to the selected note.
*   **Given** the palette, **When** I type `>create`, **Then** I see commands like "Create New Note".
*   **NFR:** Search results must appear in <100ms for queries against 10,000 notes.
*   **NFR:** The application must maintain <100MB memory footprint during active search operations.

### Story 2.2: Advanced Filtering & Scoping
**As a** Researcher,
**I want** to filter search results by tag, date, or property,
**So that** I can narrow down large result sets.

**Acceptance Criteria:**
*   **Given** the search bar, **When** I type `tag:journal`, **Then** only notes with the `#journal` tag are returned.
*   **Given** the search bar, **When** I type `created:today`, **Then** only notes created in the last 24 hours are shown.
*   **Given** multiple filters `tag:work tag:urgent`, **When** I execute search, **Then** results match ALL conditions (AND logic).

### Story 2.3: Multi-Document AI Synthesis
**As a** Learner,
**I want** to select multiple notes and ask an AI to synthesize them,
**So that** I can see connections I missed.

**Acceptance Criteria:**
*   **Given** the file explorer, **When** I multi-select 3 notes and click "Synthesize", **Then** the `SynthesisPanel` opens with those notes as context.
*   **Given** the panel, **When** I type a prompt "Summarize common themes", **Then** the AI services returns a streamed response.
*   **Given** a response, **When** I click "Save as Note", **Then** a new note is created with the AI output.
*   **NFR:** The AI processing must not block the main UI thread.

### Story 2.4: Contextual Sidebar (Ambient AI)
**As a** Writer,
**I want** to see related notes automatically while I type,
**So that** I can rediscover relevant past ideas without searching.

**Acceptance Criteria:**
*   **Given** I am typing in a note, **When** I pause for 2 seconds, **Then** the Sidebar updates with "Related Notes" based on vector similarity or keyword matching.
*   **Given** the sidebar, **When** I click a related note, **Then** it opens in a side-by-side view (or replaces current view based on settings).
*   **NFR:** Similarity search must happen locally or via highly optimized vector lookup (<500ms).

### Epic 3: Adaptive Workflows (Role-Based Contexts)

**Goal:** Users can pivot the interface capabilities (Dashboard, Search Scope) to match their current mental state (Manager vs. Learner).
**Implementation Note:** Includes Role-Based Search Scoping (e.g., search only 'Study' folders in Learner mode).
**FRs covered:** FR8, FR17
**Stories:** 4

### Story 3.1: Global Role Store & Thematic Switcher
**As a** User,
**I want** to switch between "Manager", "Learner", and "Peace" roles,
**So that** the interface adapts to my current intent.

**Acceptance Criteria:**
*   **Given** the sidebar, **When** I click the role dropdown, **Then** I see the 3 role options.
*   **Given** I select "Learner", **Then** the global theme shifts (e.g., warmer colors, hidden file trees).
*   **Given** I close the app, **When** I reopen it, **Then** the last active role persists.

### Story 3.2: Context-Aware Dashboard Configuration
**As a** Manager,
**I want** my dashboard to show different widgets than when I am a Learner,
**So that** I see relevant information first.

**Acceptance Criteria:**
*   **Given** "Manager" role, **Then** the dashboard shows "Tasks Padding" and "Project Deadlines".
*   **Given** "Learner" role, **Then** the dashboard shows "Spaced Repetition Queue" and "Reading List".
*   **Given** a dashboard, **When** I reorder widgets, **Then** that layout is saved specifically for the active role.

### Story 3.3: Role-Based Search Scoping
**As a** Learner,
**I want** my search results to exclude work project files,
**So that** I can focus entirely on my studies.

**Acceptance Criteria:**
*   **Given** "Learner" role, **When** I search using `Cmd+K`, **Then** the results automatically filter out folders tagged `#work`.
*   **Given** "Manager" role, **When** I search, **Then** results prioritize `#project` tagged notes.
*   **Given** any role, **When** I toggle "Global Search", **Then** the role-based restrictions are temporarily bypassed.
*   **Given** the role store, **When** I switch roles, **Then** the search scope updates immediately without reloading.

### Story 3.4: Performance & Cold Start Optimization
**As a** User,
**I want** the application to start quickly and stay responsive,
**So that** I can access my knowledge base instantly when needed.

**Acceptance Criteria:**
*   **Given** the application is closed, **When** I launch it, **Then** the fully functional interface loads in <2 seconds (cold start).
*   **Given** the application is running, **When** I switch between notes, **Then** the switch completes in <100ms.
*   **Given** the application window, **When** I minimize and restore, **Then** it returns instantly without reloading content.
*   **NFR:** Memory usage must not exceed 100MB base, 500MB with 10,000 notes.
*   **NFR:** The app must remain responsive (no UI blocking) during AI synthesis operations.

### Epic 4: Visual Discovery (Graph)

**Goal:** Users can discover hidden connections through visual exploration.
**FRs covered:** FR14

### Story 4.1: Interactive Force-Directed Graph
**As a** Visual Thinker,
**I want** to see my notes as nodes in a network,
**So that** I can explore relationships between ideas.

**Acceptance Criteria:**
*   **Given** 50+ linked notes, **When** I open Graph View, **Then** I see a D3.js visualization of nodes and links.
*   **Given** the graph, **When** I hover a node, **Then** its connections highlight and others fade.
*   **Given** the graph, **When** I click a node, **Then** the corresponding note opens.
*   **Given** large datasets (>1000 nodes), **Then** the visualization remains responsive (60fps).
*   **NFR:** Must use the same SQLite data source as the rest of the app (no duplicate indexing).

---

## 3. Requirements Coverage Map

FR1: Epic 1 - Create/Update/Delete Notes
FR2: Epic 1 - Folder management
FR3: Epic 1 - Tag management
FR4: Epic 1 - Link management
FR5: Epic 1 - Import/Export
FR6: Epic 1 - Backup/Restore
FR7: Epic 1 - Markdown editor
FR8: Epic 3 - Modular Dashboard
FR9: Epic 1 - Persistent Sidebar
FR10: Epic 2 - Command Palette
FR11: Epic 2 - Full-text search
FR12: Epic 2 - Advanced search
FR13: Epic 2 - Search suggestions
FR14: Epic 4 - Graph visualization
FR15: Epic 2 - Multi-Document Synthesis
FR16: Epic 2 - Contextual Sidebar
FR17: Epic 3 - Role Switcher
