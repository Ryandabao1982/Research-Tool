# Story 1.6: Design System Foundation (Rational Grid)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a consistent, visually clean interface,
so that I can focus on my content without visual distractions.

## Acceptance Criteria

1. [ ] **Given** any application component, **When** I examine it, **Then** it follows "Rational Grid" 8px spacing system.
2. [ ] **Given** typography in app, **When** I view long-form content, **Then** it uses Inter font at appropriate sizes.
3. [ ] **Given** metadata (tags, timestamps, IDs), **When** I view them, **Then** they use JetBrains Mono font for clarity.
4. [ ] **Given** UI interactions, **When** I examine them, **Then** they follow hierarchy: Primary (solid blue), Secondary (1px border), Tertiary (ghost).
5. [ ] **Given** all UI elements, **When** I observe corners, **Then** they have zero border-radius (sharp edges).
6. [ ] **Given** the color scheme, **When** I view the interface, **Then** it uses high-contrast black/white with Action Blue (#0066FF) accents.

## Tasks / Subtasks

- [ ] Design System (Global)
  - [ ] Create Tailwind configuration for 8px grid system (AC: #1)
  - [ ] Define typography scales for Inter and JetBrains Mono (AC: #2, #3)
  - [ ] Create button hierarchy system (AC: #4)
  - [ ] Define border-radius zero constraint globally (AC: #5)
  - [ ] Create color scheme with Action Blue (#0066FF) accents (AC: #6)

- [ ] Component Audit & Update (React)
  - [ ] Audit all existing components for compliance (AC: #1-6)
  - [ ] Update Card component to 8px spacing (AC: #1)
  - [ ] Update Button components with hierarchy (AC: #4)
  - [ ] Update Input components with 1px borders (AC: #2, #3)
  - [ ] Update typography for Inter/JetBrains Mono usage (AC: #2, #3)
  - [ ] Update Modal and Dialog components for zero border-radius (AC: #5)
  - [ ] Apply color scheme across all components (AC: #6)

- [ ] Documentation & Guidelines
  - [ ] Create design system documentation (AC: #1-6)
  - [ ] Update component usage guidelines (AC: #1-6)

## Dev Notes

### Architecture & Design

- **Design System**: "Rational Grid" - Neo-Brutalist/Swiss Minimalist hybrid
- **Grid System**: 8px spacing for structure, layout consistency
- **Typography**: 
  - Inter (sans-serif) for long-form content (14px, 16px, 18px, 24px)
  - JetBrains Mono (monospace) for metadata, IDs, tags (12px, 14px)
- **Visual Hierarchy**:
  - Primary: Solid fill, Action Blue (#0066FF), white text
  - Secondary: 1px border, black/white fill, black/white text
  - Tertiary: Ghost variant (transparent fill, 1px border, black/white text)
- **Color Scheme**:
  - Background: Neutral-50 (#FAFAFA) or Neutral-950 (#0A0A0A)
  - Text: Neutral-900 (#171717) or Neutral-50 (#73737E)
  - Accent: Action Blue (#0066FF)
  - Borders: Neutral-200 (#E5E7EB), Neutral-300 (#D1D5DB)

### Technical Guardrails

- **Spacing**: All padding, margins, gaps must be multiples of 8px (8px, 16px, 24px, 32px, etc.)
- **Typography**: Font families must be exactly `Inter` or `JetBrains Mono` - no other fonts allowed
- **Border Radius**: All components must use `rounded-none` or `rounded-0` - no rounded corners anywhere
- **Buttons**: Must follow hierarchy (Primary/Secondary/Tertiary) - no custom button styles outside system
- **Inputs**: Must use 1px solid border (Neutral-200 or Neutral-300)
- **Consistency**: All existing components must be audited and updated to match system
- **Performance**: Design system tokens should be CSS variables for easy theme updates

### Implementation Strategy

**Design System Creation (Tailwind Config):**
1. Extend `tailwind.config.mjs` with custom spacing scale:
   ```javascript
   theme: {
     extend: {
       spacing: {
         '8': '2rem',  // 32px
         '12': '3rem',  // 48px
         '16': '4rem',  // 64px
       }
     }
   }
   ```
2. Add custom typography:
   ```javascript
   theme: {
     extend: {
       fontFamily: {
         sans: ['Inter', 'sans-serif'],
         mono: ['JetBrains Mono', 'monospace'],
       },
       fontSize: {
         xs: ['12px', { lineHeight: '16px' }],
         sm: ['14px', { lineHeight: '20px' }],
         base: ['16px', { lineHeight: '24px' }],
         lg: ['18px', { lineHeight: '28px' }],
         xl: ['24px', { lineHeight: '32px' }],
       }
     }
   }
   ```
3. Add color scheme variables:
   ```javascript
   theme: {
     extend: {
       colors: {
         primary: '#0066FF',  // Action Blue
         neutral: {
           50: '#FAFAFA',
           200: '#E5E7EB',
           300: '#D1D5DB',
           900: '#171717',
         },
       }
     }
   }
   ```

**Component Updates:**
1. Update `Card` component:
   ```typescript
   const Card = ({ children, variant = 'solid' }: CardProps) => {
     const baseClasses = "p-8 bg-white border-0 rounded-none";
     const variantClasses = {
       solid: "bg-primary-500 border-0 text-white",
       secondary: "bg-white border border-neutral-200 border-0",
       ghost: "bg-transparent border border-neutral-200 border-0",
     };
     return <div className={cn(baseClasses, variantClasses[variant])}>{children}</div>;
   };
   ```
2. Update `Button` component:
   ```typescript
   const Button = ({ variant = 'secondary', children, ...props }: ButtonProps) => {
     const variantClasses = {
       primary: "bg-primary-500 hover:bg-primary-600 text-white border-0",
       secondary: "bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200",
       ghost: "bg-transparent hover:bg-neutral-50 text-neutral-900 border border-neutral-200",
     };
     return <button className={cn("border-0", variantClasses[variant])}>{children}</button>;
   };
   ```
3. Update `Input` component:
   ```typescript
   const Input = ({ label, ...props }: InputProps) => {
     return (
       <div>
         <label className="font-mono text-xs text-neutral-600">{label}</label>
         <input
           className="border-0 border-neutral-200 rounded-none focus:ring-2"
           {...props}
         />
       </div>
     );
   };
   ```
4. Global CSS variables for zero border-radius:
   ```css
   * {
     border-radius: 0 !important;
   }
   ```

**Design System Documentation:**
Create `docs/design-system.md`:
```markdown
# Design System: Rational Grid

## Overview
The "Rational Grid" design system provides a high-performance, precision-engineered interface following Swiss Minimalist principles.

## Grid System
All spacing must follow the 8px grid system:
- `p-1` = 8px
- `p-2` = 16px
- `p-3` = 24px
- `p-4` = 32px
- `p-5` = 48px
- `p-6` = 64px
- `p-8` = 96px

## Typography
Two font families:
- **Inter** (sans-serif): Long-form content
  - Text: 14px (sm), 16px (base), 18px (lg), 24px (xl)
  - Line heights: 1.4x font size
- **JetBrains Mono** (monospace): Metadata, IDs, tags
  - Text: 12px (xs), 14px (sm)

## Visual Hierarchy
Three button variants:
- **Primary**: Solid Action Blue (#0066FF), white text
- **Secondary**: 1px Neutral-200 border, black/white fill
- **Tertiary/Ghost**: Transparent fill, 1px border, black/white text

## Color Scheme
- **Background**: Neutral-50 (#FAFAFA)
- **Text**: Neutral-900 (#171717)
- **Accent**: Action Blue (#0066FF)
- **Borders**: Neutral-200 (#E5E7EB), Neutral-300 (#D1D5DB)

## Global Rules
- All components use `rounded-none` or `rounded-0`
- All borders are 1px solid (from Neutral-200 or Neutral-300)
- All spacing is multiples of 8px
```

### Project Structure Notes

- **Tailwind Config**: `tailwind.config.mjs` - Add spacing, typography, colors
- **Design Doc**: `docs/design-system.md` - Create comprehensive design system documentation
- **Component Updates**: Audit and update all existing components to match system
- **Global CSS**: `src/index.css` - Add zero border-radius rule
- **No New Files Needed**: This updates existing components, no new structure required
- **Alignment**: Follows existing component patterns from stories 1.2, 1.3, 1.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 1 - Story 1.6] - User story and acceptance criteria
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System: "Rational Grid"] - 8px grid, Inter/JetBrains Mono, zero border-radius
- [Source: _bmad-output/implementation-artifacts/1-3-hierarchical-organization.md] - Component patterns (Card, Button, Input)
- [Source: _bmad-output/implementation-artifacts/1-4-markdown-editor-with-live-preview.md] - Component updates (if exists)

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (2026-01-02)

### Debug Log References

### Completion Notes List

**Design System Implementation:**
- [ ] Extend `tailwind.config.mjs` with 8px grid, custom typography, color scheme
- [ ] Create `docs/design-system.md` comprehensive documentation
- [ ] Update `Card` component to match system (spacing, border-radius, variants)
- [ ] Update `Button` component hierarchy (Primary/Secondary/Ghost)
- [ ] Update `Input` component (1px borders, JetBrains Mono labels)
- [ ] Update `Modal` and `Dialog` components (zero border-radius)
- [ ] Add global CSS rule for zero border-radius
- [ ] Audit and update all other existing components for compliance

**Component Compliance:**
- [ ] All components use `rounded-none` or `rounded-0`
- [ ] All spacing follows 8px grid system
- [ ] All typography is Inter or JetBrains Mono
- [ ] All buttons follow Primary/Secondary/Ghost hierarchy
- [ ] Color scheme uses Action Blue (#0066FF) accents

**Technical Decisions:**
- [ ] CSS variables for design tokens (colors, spacing, typography)
- [ ] Tailwind extend for custom spacing scale
- [ ] Global `* { border-radius: 0; }` rule to override defaults
- [ ] No rounded corners anywhere in interface
- [ ] Consistent button hierarchy enforced through variants

### File List

- tailwind.config.mjs (Modified: Add 8px grid, typography, colors)
- docs/design-system.md (New: Comprehensive design system documentation)
- src/shared/components/Card.tsx (Modified: Update to Rational Grid system)
- src/shared/components/Button.tsx (Modified: Add hierarchy variants)
- src/shared/components/Input.tsx (Modified: Add 1px borders, mono labels)
- src/shared/components/Modal.tsx (Modified: Remove border-radius)
- src/shared/components/Dialog.tsx (Modified: Remove border-radius)
- src/index.css (Modified: Add zero border-radius global rule)

**Implementation Status:**
- ⚠️ Not started - awaiting dev-story workflow execution
- ⚠️ All acceptance criteria require implementation
- ⚠️ No code written yet

**Expected Workflow:**
1. Run dev-story workflow with this comprehensive context
2. Update Tailwind config with design system tokens
3. Audit and update all existing components
4. Verify all spacing follows 8px grid
5. Code review: Validate against acceptance criteria
