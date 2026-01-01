# Remediation Plan: Dashboard Implementation Fixes

## Objective
Refactor the Dashboard components (`Dashboard.tsx`, `DashboardSidebar.tsx`, `useDashboardStats.ts`) to adhere to strict TypeScript standards, remove hardcoded/magic values, ensure responsiveness, and eliminate technical debt.

## Scope
- `src/app/pages/Dashboard.tsx`
- `src/shared/components/dashboard/DashboardSidebar.tsx`
- `src/app/hooks/useDashboardStats.ts`
- *New File:* `src/shared/types/dashboard.ts` (Update/Verify)

## Tasks

### 1. Type Safety & Interface Definitions
- [ ] **Define Interfaces:** Create comprehensive interfaces in `src/shared/types/dashboard.ts` for `Note`, `HeatmapData`, `DashboardStats`, and `FeedbackData`.
- [ ] **Remove `any`:** Replace all instances of `any` in `Dashboard.tsx` (`handleFeedbackSave`) and `useDashboardStats.ts` (`note`, `recentNotes`) with the new interfaces.

### 2. Design System Integration & Cleanup
- [ ] **Tailwind Config:** Extract magic colors (`#0f0f0f`, `#1a1a1a`, etc.) into `tailwind.config.mjs` as semantic names (e.g., `bg-surface-base`, `bg-surface-elevated`).
- [ ] **Class Standardization:** Replace arbitrary values (e.g., `blur-[120px]`, `rounded-[3rem]`) with standard Tailwind utility classes or custom theme extensions if strictly necessary.

### 3. Layout & Responsiveness
- [ ] **Sidebar Visibility:** Implement a mobile/tablet responsive strategy for `DashboardSidebar`. Add a toggle mechanism (hamburger menu) for screens smaller than `2xl`.
- [ ] **Grid Breackpoints:** Refine the `FeatureCard` grid in `Dashboard.tsx` to handle intermediate breakpoints (e.g., `md:grid-cols-2`) for a smoother transition.

### 4. Code Hygiene & Best Practices
- [ ] **Remove Console Logs:** Delete `console.log` in `handleFeedbackSave`.
- [ ] **Remove Artificial Delays:** Remove the `setTimeout` in `useDashboardStats.ts`.
- [ ] **Asset Management:** Replace hardcoded Unsplash URLs with local assets or a constant configuration object for image sources.
- [ ] **Accessibility:** Add `aria-label` to the Chevron navigation buttons in `Dashboard.tsx`.

### 5. Logic & State Improvements
- [ ] **Data Mocking:** Move the "Mock Data" generation out of the main hook logic into a dedicated mock service or utility function to keep the hook clean.
- [ ] **Date Handling:** Refactor date manipulation in `useDashboardStats.ts` to be robust (consider `date-fns` or careful native implementation).
- [ ] **Dynamic Content:** Remove hardcoded text in `DashboardSidebar.tsx` (e.g., "Users active", "Daily Tasks") and accept them as props or derive from the `stats` store.

## Execution Order
1.  **Types:** Define the types first to establish the contract.
2.  **Hook:** Refactor `useDashboardStats` to use types and clean logic.
3.  **Components:** Refactor `Dashboard` and `Sidebar` to use new types, theme values, and fix layout/a11y issues.
4.  **Verification:** Run `tsc` and existing tests.

## Dependencies
- `tailwind.config.mjs` needs modification.
- Access to `src/shared/types/dashboard.ts`.

