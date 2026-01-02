# Design System: Rational Grid

## Overview

The **Rational Grid** design system provides a high-performance, precision-engineered interface following Swiss Minimalist and Neo-Brutalist principles. It emphasizes clarity, consistency, and visual hierarchy through systematic use of spacing, typography, and color.

**Core Philosophy:**
- **Precision**: Every pixel serves a purpose
- **Consistency**: All components follow the same rules
- **Clarity**: High contrast, sharp edges, clear hierarchy
- **Performance**: Minimal visual overhead, maximum readability

---

## Grid System: 8px Base

All spacing follows an **8px grid system**. All padding, margins, and gaps must be multiples of 8px.

### Spacing Scale

| Tailwind Class | Value | Use Case |
|----------------|-------|----------|
| `p-1` | 4px | Micro-spacing |
| `p-2` | 8px | Minimal spacing |
| `p-3` | 12px | Small gaps |
| `p-4` | 16px | Standard spacing |
| `p-6` | 24px | Section spacing |
| `p-8` | 32px | Component padding |
| `p-12` | 48px | Large sections |
| `p-16` | 64px | Hero spacing |
| `p-24` | 96px | Page margins |

### Usage Examples

```tsx
// ✅ Correct - 8px multiples
<div className="p-8 space-y-4">
  <Card className="p-6" />
</div>

// ❌ Wrong - Non-standard spacing
<div className="p-5 space-y-3.5">
  <Card className="p-7" />
</div>
```

---

## Typography

Two font families only:

### 1. Inter (Sans-serif)
**For:** Long-form content, body text, headings

| Size | Class | Use Case |
|------|-------|----------|
| 12px | `text-xs` | Metadata, labels |
| 14px | `text-sm` | Secondary text |
| 16px | `text-base` | Body text |
| 18px | `text-lg` | Subheadings |
| 24px | `text-xl` | Headings |

**Line heights:** 1.4x font size (e.g., 16px text = 24px line height)

### 2. JetBrains Mono (Monospace)
**For:** IDs, tags, timestamps, technical metadata

| Size | Class | Use Case |
|------|-------|----------|
| 12px | `font-mono text-xs` | IDs, short codes |
| 14px | `font-mono text-sm` | Tags, timestamps |

### Usage Examples

```tsx
// ✅ Correct - Inter for body
<p className="font-sans text-base text-neutral-900">
  This is body content that should be readable.
</p>

// ✅ Correct - JetBrains Mono for metadata
<span className="font-mono text-xs text-neutral-600">
  ID: abc123def | Created: 2026-01-02
</span>

// ❌ Wrong - Mixing fonts incorrectly
<p className="font-mono text-base">Body text in monospace</p>
```

---

## Color Scheme

### Primary Colors

**Action Blue** - Primary accent for interactions
```css
#0066FF (rgb: 0, 102, 255)
```

### Neutral Scale

| Token | Light Mode | Dark Mode | Use |
|-------|------------|-----------|-----|
| `neutral-50` | #FAFAFA | - | Light backgrounds |
| `neutral-200` | #E5E7EB | #2D2D2D | Borders |
| `neutral-300` | #D1D5DB | #404040 | Secondary borders |
| `neutral-900` | #171717 | #E5E5E5 | Primary text |
| `neutral-950` | #0A0A0A | #FAFAFA | Dark backgrounds |

### Semantic Colors

```css
/* Primary Actions */
bg-primary          /* #0066FF */
text-white          /* #FFFFFF */

/* Borders */
border-neutral-200  /* #E5E7EB */
border-neutral-300  /* #D1D5DB */

/* Text */
text-neutral-900    /* #171717 (light) */
text-neutral-50     /* #FAFAFA (dark) */
```

### Usage Examples

```tsx
// ✅ Correct - Action Blue for primary
<button className="bg-primary text-white px-6 py-2">
  Primary Action
</button>

// ✅ Correct - Neutral borders
<input className="border border-neutral-200" />

// ❌ Wrong - Custom colors outside system
<button className="bg-blue-500 text-white">Custom Blue</button>
```

---

## Visual Hierarchy: Button System

Three button variants only:

### 1. Primary Button
**Use:** Main actions, calls-to-action

```tsx
<button className="rg-btn rg-btn-primary">
  Save Note
</button>
```

**Styles:**
- Background: Action Blue (#0066FF)
- Text: White
- Border: None
- Hover: Darker blue (#0052CC)

### 2. Secondary Button
**Use:** Standard actions, form submissions

```tsx
<button className="rg-btn rg-btn-secondary">
  Cancel
</button>
```

**Styles:**
- Background: White
- Text: Neutral-900
- Border: 1px solid Neutral-200
- Hover: Neutral-50 background

### 3. Ghost Button (Tertiary)
**Use:** Subtle actions, secondary navigation

```tsx
<button className="rg-btn rg-btn-ghost">
  View Details
</button>
```

**Styles:**
- Background: Transparent
- Text: Neutral-900
- Border: 1px solid Neutral-200
- Hover: Neutral-50 background

### Button Hierarchy Rules

| Priority | Variant | When to Use |
|----------|---------|-------------|
| **Primary** | Solid blue | One main action per view |
| **Secondary** | Bordered white | Standard actions |
| **Ghost** | Transparent | Tertiary actions, links |

---

## Border Radius: Zero

**All components have zero border-radius (sharp corners).**

### Global Rule
```css
* {
  border-radius: 0 !important;
}
```

### Exceptions
Only `rounded-full` is allowed for:
- Pills (tags, badges)
- Circular icons
- Avatars

### Component Examples

```tsx
// ✅ Correct - Zero radius
<div className="border rounded-none">Card</div>
<button className="rounded-none">Button</button>
<input className="rounded-none" />

// ✅ Correct - Full radius for pills
<span className="rounded-full px-2 py-1">Tag</span>

// ❌ Wrong - Any other radius
<div className="rounded-lg">Card</div>
<button className="rounded-md">Button</button>
```

---

## Component Specifications

### Card Component

**Purpose:** Container for content and groups

```tsx
// Basic Card
<div className="rg-card">
  <h3 className="text-lg font-sans">Title</h3>
  <p className="rg-text-body">Content</p>
</div>

// Dark Card
<div className="rg-card rg-card-dark">
  <h3 className="text-lg font-sans text-white">Title</h3>
  <p className="rg-text-body text-neutral-50">Content</p>
</div>
```

**Spacing:** `p-8` (32px) internal padding  
**Border:** 1px solid `neutral-200`  
**Radius:** Zero (rounded-none)

### Input Component

**Purpose:** Form inputs with labels

```tsx
<div className="rg-input-wrapper">
  <label className="rg-input-label">Title</label>
  <input 
    type="text" 
    className="rg-input"
    placeholder="Enter text..."
  />
</div>
```

**Label:** JetBrains Mono, 12px, uppercase  
**Input:** 1px border, `neutral-200`, focus ring on `primary`  
**Spacing:** 4px gap between label and input

### Modal/Dialog

**Purpose:** Overlays and dialogs

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
  <div className="rg-modal max-w-2xl mx-auto p-8">
    <h2 className="text-xl font-sans mb-4">Modal Title</h2>
    <div className="rg-text-body mb-6">
      Modal content...
    </div>
    <div className="flex gap-4">
      <button className="rg-btn rg-btn-primary">Confirm</button>
      <button className="rg-btn rg-btn-secondary">Cancel</button>
    </div>
  </div>
</div>
```

**Background:** White (or neutral-950 for dark)  
**Border:** 1px solid `neutral-200`  
**Radius:** Zero  
**Overlay:** `bg-black/50` with blur

---

## Implementation Checklist

### ✅ Tailwind Configuration
- [ ] 8px spacing scale defined
- [ ] Inter font for sans-serif
- [ ] JetBrains Mono for mono
- [ ] Action Blue (#0066FF) as primary
- [ ] Neutral color scale
- [ ] Zero border-radius in theme

### ✅ Global CSS
- [ ] `* { border-radius: 0 !important; }` rule
- [ ] Exception for `rounded-full`
- [ ] Design token variables

### ✅ Components Updated
- [ ] Card: `p-8`, `border-neutral-200`, `rounded-none`
- [ ] Button: Three variants (Primary/Secondary/Ghost)
- [ ] Input: 1px border, JetBrains Mono labels
- [ ] Modal: Zero radius, proper spacing
- [ ] Dialog: Zero radius, proper spacing

### ✅ Typography
- [ ] All body text uses Inter
- [ ] All metadata uses JetBrains Mono
- [ ] Proper line heights (1.4x)
- [ ] Correct size hierarchy

### ✅ Color Application
- [ ] Primary actions use Action Blue
- [ ] Borders use neutral-200/300
- [ ] Text uses neutral-900 (light) or neutral-50 (dark)
- [ ] No custom colors outside system

---

## Migration Guide

### From Glassmorphism to Rational Grid

**Before:**
```tsx
<div className="glass-card rounded-xl p-4 bg-white/5">
  <button className="glass-btn rounded-lg">Click</button>
</div>
```

**After:**
```tsx
<div className="rg-card p-8">
  <button className="rg-btn rg-btn-primary">Click</button>
</div>
```

### Key Changes
1. Remove all `rounded-*` classes except `rounded-full`
2. Replace `p-4` with `p-8` (8px grid)
3. Replace glass classes with `rg-*` classes
4. Use `font-mono` for metadata
5. Apply Action Blue for primary actions

---

## Design Tokens Reference

### CSS Variables
```css
--action-blue: #0066FF;
--neutral-50: #FAFAFA;
--neutral-200: #E5E7EB;
--neutral-300: #D1D5DB;
--neutral-900: #171717;
--neutral-950: #0A0A0A;
```

### Tailwind Classes
```css
/* Spacing */
p-8, p-16, p-24

/* Typography */
font-sans text-base
font-mono text-xs

/* Colors */
bg-primary text-white
border-neutral-200
text-neutral-900

/* Borders */
border rounded-none

/* Buttons */
rg-btn rg-btn-primary
rg-btn rg-btn-secondary
rg-btn rg-btn-ghost
```

---

## Quality Assurance

### Pre-Commit Checklist
- [ ] No `rounded-lg`, `rounded-md`, etc. (except `rounded-full`)
- [ ] All spacing uses 8px multiples
- [ ] Inter font for body text
- [ ] JetBrains Mono for metadata
- [ ] Action Blue for primary actions
- [ ] Neutral-200/300 for borders
- [ ] Components use `rg-*` classes where available

### Visual Regression Tests
1. All corners are sharp (90° angles)
2. 8px spacing is consistent throughout
3. Typography is crisp and readable
4. Color contrast meets WCAG AA
5. Button hierarchy is visually distinct

---

## References

- **Story:** 1.6 - Design System Foundation (Rational Grid)
- **Epic:** 1 - Core Application Features
- **Design Spec:** UX Design Specification - Rational Grid
- **Implementation:** This document is the source of truth

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial Rational Grid implementation |
