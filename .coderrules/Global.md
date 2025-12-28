# 🌐 The Global Vibe Coding Constitution

**Core Philosophy:**
We do not build "software"; we craft experiences. Code is the medium, but the user's feeling is the product. We reject the mundane, the broken, and the ugly. We demand High-End Aesthetics, Bulletproof Engineering, Crystal Clear Documentation, and Agentic Tool Usage in equal measure.

---

## 🎨 SECTION 1: The Aesthetic Mandate (The "Vibe")

**1. The "Anti-Template" Rule:**
*   **Rule:** We do not use default Bootstrap, Material UI, or Shadcn themes out of the box.
*   **Action:** If a library is used, it must be heavily customized with arbitrary values to match the unique identity of the project.

**2. The Motion Law:**
*   **Rule:** Static elements are dead elements.
*   **Action:** Every user interaction must be met with a reaction.
    *   **Hover:** Glow, scale, or color shift.
    *   **Click:** Ripple, shrink, or active state.
    *   **Load:** Skeletons or shimmer effects; never raw text flashing in.
    *   **Transitions:** Page transitions and modal openings must be animated (e.g., Framer Motion layout prop).

**3. Depth & Atmosphere:**
*   **Rule:** The interface must have physical space.
*   **Action:** Use layering. Background < Content < Floating Elements.
*   **Techniques:** Apply subtle noise textures, background blurs (glassmorphism), and drop shadows to create separation between layers.

**4. Typography as Art:**
*   **Rule:** Text is not just information; it is visual structure.
*   **Action:** Use tight tracking for headers, loose line-height for body text. Use font weights to guide the eye, not just size.

---

## ⚙️ SECTION 2: The Engineering Mandate (The "Quality")

**5. The Speed of Light (Performance):**
*   **Rule:** A slow vibe is a broken vibe.
*   **Action:**
    *   Target 90+ Lighthouse scores.
    *   Lazy load everything below the fold.
    *   Optimize images (WebP/AVIF).
    *   Code splitting is mandatory.

**6. Type Safety is Freedom:**
*   **Rule:** Ambiguity causes bugs. Clarity enables speed.
*   **Action:**
    *   Strict TypeScript: No `any`. Ever.
    *   Zod Validation: Every input from the user to the API must be validated.
    *   If the types don't match, the code doesn't exist.

**7. The "Fail Gracefully" Protocol:**
*   **Rule:** Things will break. The system must handle it with dignity.
*   **Action:**
    *   No white screens of death.
    *   Beautiful Error Boundaries (e.g., "Something went wrong" with a nice illustration and a retry button).
    *   Loading states must be aesthetically pleasing (shimmer/pulse), not a generic spinning circle.

**8. The "Clean Architecture" Law:**
*   **Rule:** Code is read 10x more than it is written.
*   **Action:**
    *   **Modularize:** Keep files small and focused.
    *   **Naming:** Variables and functions must describe intent, not just data type (e.g., `getUserPermissions` not `data`).
    *   **DRY (Don't Repeat Yourself):** Abstract common logic into hooks or utility functions.

---

## 📖 SECTION 3: The Documentation Manifesto

**9. Documentation is a First-Class Citizen:**
*   **Rule:** If it isn't documented, it doesn't exist.
*   **Action:**
    *   **Self-Describing Code:** Variable and function names should be so clear that comments are rarely needed.
    *   **The "Why", not the "How":** Only add comments to explain why a complex decision was made (e.g., `// We use polling here because websockets are blocked`), never to explain obvious syntax.
    *   **Public API:** Every public function and component must have a description.
    *   **README First:** Every feature folder must contain a `README.md` explaining its purpose.

---

## 🔌 SECTION 4: Global MCP Integration Rules

**10. The "Hands-On" Mandate:**
*   **Rule:** You are not just a text generator; you are an agent capable of direct system interaction.
*   **Action:**
    *   **Context Awareness:** Use the filesystem MCP to list directories and search files. Do not hallucinate project structures.
    *   **Command Execution:** Use the terminal MCP to run tests, installs, and builds. Don't just output the command; ask if you should run it.
    *   **Web Research:** When you are unsure about a breaking change or a specific API syntax, use the brave-search MCP to find the official documentation immediately.

**11. Verification Loop:**
*   **Rule:** Tool calls have side effects.
*   **Action:** After writing a file or running a command, verify the result. (e.g., "I have created the file. Shall I run the dev server to verify?")

---

## 🚫 SECTION 5: The "Vibe Killers" (Absolute Prohibitions)

*   No Default Alerts: Use custom Toasts/Modals.
*   No Hardcoded Secrets: Use Environment Variables.
*   No Unresponsive Design: Mobile-first approach.
*   No Broken Accessibility: Semantic HTML is mandatory.
*   No Guessing: Use tools to verify facts.