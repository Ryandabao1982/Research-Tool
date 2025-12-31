---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-core-experience
  - step-04-emotional-response
inputDocuments:
  - d:\Web Projects\secondbrain\docs\technical-specifications.md
  - d:\Web Projects\secondbrain\_bmad-output\project_knowledge\architecture.md
  - d:\Web Projects\secondbrain\_bmad-output\planning-artifacts\epics.md
---

# UX Design Specification: secondbrain

## 1. Executive Summary

### Project Vision
**"Functional Precision"**: A high-performance, precision-engineered Second Brain. It prioritizes clarity and speed (**Swiss Minimalist**) while utilizing utilitarian, structural elements (**Neo-Brutalist**) to convey information density and control. It is a tool for thought, not a decoration.

### Design System: "Rational Grid"
*   **80% Minimalist**:
    *   **Typography**: Clean Sans-Serif (Inter) for all long-form reading and writing.
    *   **Layout**: Ample whitespace, high contrast (Black/White), no decorative shadows or blurs.
    *   **Philosophy**: Content comes first. The interface disappears during Deep Work.
*   **20% Technical/Brutalist**:
    *   **Accents**: Monospaced fonts (JetBrains Mono) for metadata, IDs, tags, and stats.
    *   **Borders**: Visible, sharp 1px borders to define structure (The "Blueprint" look).
    *   **Interactions**: Snappy, instant state changes. No floating/drifting animations.

### Target Users
**"The Knowledge Architect"**: Users who treat knowledge management as an engineering discipline. They value structure, speed, and data ownership over "gamification" or "cozy" aesthetics.

### Key Design Challenges
1.  **Density vs. Clarity**: leveraging the Brutalist aspects to handle complex data (Graph/Metadata) without cluttering the Minimalist reading experience.
2.  **Role Distinction**: Using structural changes (layout/density) rather than cosmetic themes (colors/glass) to distinguish "Manager" vs. "Learner" modes.

## 2. Core User Experience

### Defining Experience
**"The Neural Loop"**: The critical loop is **Capture -> Forget -> Retrieve**.
*   **Capture**: Must be instant (Global Shortcut), effectively "offloading" the thought so the user can forget it.
*   **Retrieve**: Must be faster than thinking (FTS5 Search), bringing the thought back exactly when needed.

### Platform Strategy
**"Desktop Sovereign"**:
*   **Primary**: Windows/Mac/Linux Desktop (Tauri).
*   **Input**: Keyboard-First. Mouse is secondary. Navigation, Search, and Action should all be achievable without leaving the home row.
*   **State**: Local-First. No "loading spinners" for network calls.

### Effortless Interactions
*   **Wiki-Linking**: Typing `[[` instantly suggests notes. No friction in connecting ideas.
*   **Global Capture**: Pressing `Alt+Space` (or similar) opens a capture window *anywhere* in the OS.
*   **Ambient AI**: The Sidebar quietly surfacing relevant notes without being asked.

### Critical Success Moments
*   **"The Recall"**: When a user types a vague 3-word query and *instantly* finds a note from 6 months ago.
*   **"The Synthesis"**: When the Graph View reveals a cluster of connected ideas the user didn't consciously link.

### Experience Principles
1.  **Speed is a Feature**: Any interaction taking >100ms is a bug.
2.  **Keyboard is King**: If it requires a mouse, it's a secondary feature.
3.  **Context, Not Clutter**: Show metadata only when needed (Brutalist toggle).

---

## 3. Desired Emotional Response

### Primary Emotional Goal
**"Flow State"**: The user should feel completely unencumbered. The tool should feel like an extension of their mind, not a hurdle to jump over. The primary emotion is **Focused Calm**.

### Micro-Emotions
*   **Competence (vs. Frustration)**: Every interaction (search, link, edit) works exactly as expected. The user feels "Good at their job" because the tool amplifies their capability.
*   **Trust (vs. Anxiety)**: "If I put it here, it is safe." The Brutalist/Technical elements reinforce that this is a robust, serious engineering tool, not a toy.
*   **Relief (vs. Overwhelm)**: The "Capture" mechanic provides immediate relief from the mental load of holding onto a thought.

### Design Implications
*   **Flow State** → **Minimalism**: Remove all decorative noise (shadows, gradients) that competes for attention.
*   **Competence** → **Instant Feedback**: Every shortcut must have an immediate visual acknowledgment (<50ms).
*   **Trust** → **Exposed Structure**: Show the file paths or IDs (Brutalist) to confirm "This is real data on my disk."

### Emotional Design Principles
1.  **Invisible until Needed**: The UI gets out of the way.
2.  **Earned Complexity**: Only show advanced controls (Graph, Metadata) when the user explicitly asks for them.
3.  **Reliability is Beautiful**: A plain text file that opens in 10ms is more beautiful than a loading spinner with a gradient.

---

## 4. Visual Design Specifications

### Color Palette
**Minimalist Foundation (80%)**:
*   **Background**: `#FFFFFF` (Light) / `#0A0A0A` (Dark)
*   **Text**: `#000000` (Light) / `#FAFAFA` (Dark)
*   **Borders**: `#E5E5E5` (Light) / `#2A2A2A` (Dark)

**Brutalist Accents (20%)**:
*   **Primary Action**: `#0066FF` (Vibrant Blue)
*   **Metadata/Technical**: `#6B7280` (Gray for monospace elements)
*   **Success**: `#10B981` (Green)
*   **Warning**: `#F59E0B` (Amber)

### Typography
**Primary (80% - Reading/Writing)**:
*   **Font**: Inter (Sans-Serif)
*   **Sizes**: 16px body, 24px H1, 20px H2, 18px H3
*   **Line Height**: 1.6 for readability

**Technical (20% - Metadata/IDs)**:
*   **Font**: JetBrains Mono (Monospace)
*   **Usage**: Tags, UUIDs, Timestamps, File Paths
*   **Size**: 14px (slightly smaller than body)

### Layout Principles
*   **Grid**: 8px base unit for spacing
*   **Max Content Width**: 720px for reading, unlimited for Graph/Dashboard
*   **Whitespace**: Generous margins (48px minimum)
*   **Borders**: 1px solid, no border-radius (hard edges)

### Component Styling
*   **Buttons**: Solid fills, no shadows, instant state changes
*   **Inputs**: 1px border, no placeholder animations
*   **Cards**: Flat, bordered containers (no elevation)
*   **Modals**: Full-screen overlays (no floating)

---

## 5. Key User Flows

### Flow 1: Rapid Capture
1. User presses `Alt+Space` (Global Shortcut)
2. Minimal capture window appears (title + body)
3. User types, presses `Enter`
4. Note saved instantly, window closes
5. **Emotional Payoff**: Relief (thought offloaded)

### Flow 2: Instant Retrieval
1. User presses `Cmd/Ctrl+K` (Command Palette)
2. Palette opens <100ms
3. User types 2-3 words
4. FTS5 results appear in real-time
5. User presses `Enter`, note opens
6. **Emotional Payoff**: Competence (found it immediately)

### Flow 3: Role Switching
1. User clicks Role Dropdown (Sidebar)
2. Selects "Learner" or "Manager"
3. UI density shifts (layout change, not color)
4. Dashboard widgets swap
5. **Emotional Payoff**: Control (interface adapts to me)

---

## 6. Implementation Guidelines

### Performance Requirements
*   All interactions must complete in <100ms
*   Search results must stream (no "loading" state)
*   UI must remain responsive during AI synthesis

### Accessibility
*   Keyboard navigation for 100% of features
*   High contrast mode support (WCAG AAA)
*   Screen reader compatibility for all interactive elements

### Responsive Behavior
*   Desktop-first (primary platform)
*   Minimum window width: 1024px
*   No mobile version in MVP

---

## 7. Component Specifications

### Dashboard Widgets

**Layout Grid**:
*   3-column grid on wide screens (>1440px)
*   2-column grid on standard screens (1024-1440px)
*   Each widget: 1px border, 16px padding, no shadow

**Widget Types**:

1. **Activity Heatmap** (Calendar Grid)
   *   7x5 grid (weeks × days)
   *   Cell size: 32px × 32px
   *   States: Empty (border only), Low (25% fill), Medium (50%), High (100%)
   *   Hover: Show note title + timestamp in monospace
   *   Click: Open note directly

2. **Quick Stats** (Metrics Cards)
   *   Layout: Icon + Number + Label (vertical stack)
   *   Typography: 32px number (Inter Bold), 14px label (Inter Regular)
   *   Icons: 24px, monochrome (no color)
   *   Border: 1px solid, no background fill

3. **Recent Notes** (List)
   *   Max 5 items
   *   Each item: Title (16px) + Timestamp (14px monospace gray)
   *   Hover: Entire row gets 1px left border accent
   *   No thumbnails or previews

**Role-Based Widget Swapping**:
*   **Manager Mode**: "Tasks Pending", "Project Deadlines", "Team Activity"
*   **Learner Mode**: "Spaced Repetition Queue", "Reading List", "Study Streaks"
*   Transition: Instant swap (no animation), widgets fade in/out over 150ms

### Graph View

**Canvas**:
*   Full viewport (no max-width constraint)
*   Background: Solid color (no grid pattern)
*   Zoom: Mouse wheel (10% increments), no zoom UI controls

**Node Styling**:
*   **Shape**: Circle, 12px diameter (default)
*   **Size Scaling**: Based on backlink count (12px - 24px)
*   **Fill**: Solid color (no gradients)
*   **Label**: Note title, 12px Inter, appears on hover only
*   **States**:
    *   Default: Border only (1px)
    *   Hover: Solid fill + label
    *   Selected: 2px border + solid fill
    *   Connected (1-hop): 50% opacity
    *   Unconnected: 25% opacity

**Edge Styling**:
*   **Line**: 1px solid, straight (no curves)
*   **Color**: Same as border color (context-aware)
*   **States**:
    *   Default: 25% opacity
    *   Hover (node): 100% opacity for connected edges
    *   Bidirectional: Double line (2px apart)

**Interactions**:
*   **Click Node**: Open note in editor (replace current view)
*   **Drag Node**: Reposition (physics simulation pauses)
*   **Double-Click Canvas**: Reset zoom/pan
*   **Right-Click Node**: Context menu (Open in New Tab, Show Backlinks)

**Performance**:
*   Render up to 1000 nodes without lag (60fps)
*   Use canvas rendering (not SVG) for large graphs
*   Lazy-load node labels (only render visible viewport)

---

## 4. Accessibility & Responsiveness
[Standards]
