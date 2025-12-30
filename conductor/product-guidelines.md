# Product Guidelines: KnowledgeBase Pro

## 🎭 Tone and Voice
- **Professional and Precise:** Communication from the AI and within the UI must be technically accurate, direct, and authoritative.
- **Clarity over Fluff:** Avoid flowery language or excessive encouragement; focus on being a reliable tool for researchers and developers.
- **Context-Aware:** The AI should acknowledge when it is strictly grounding responses in local notes versus when it is using external knowledge.

## 🎨 Visual Identity & UI/UX
- **Atmospheric Glassmorphism:** The interface should leverage backdrop blurs, subtle transparency, and depth shadows to create a premium, modern desktop feel.
- **Focused Workspace:** Use a "Notion-like" block-based approach for the editor, allowing for a flexible canvas feel with rich media support (code blocks, math, diagrams).
- **Non-Intrusive AI:** AI interactions should primarily live in collapsible sidebars or dedicated panels to ensure the main writing area remains distraction-free.
- **Motion & Feedback:** Use subtle animations (e.g., Framer Motion) to provide feedback for actions like note linking or AI processing.

## 📝 Content & Writing Standards
- **Block-Based Structure:** Content should be organized in a modular, draggable block format similar to Notion, moving beyond simple flat markdown.
- **Semantic Integrity:** Ensure that even with rich blocks, the underlying data remains semantically clear and easily indexable for search and AI analysis.
- **Interlinking First:** Design the UX to make bidirectional linking (WikiLinks) feel natural and frictionless during the writing process.

## 🔐 Privacy & Data Principles
- **Local-Only Guarantee:** The core promise is that user data remains local. No data should be transmitted to external servers without explicit user consent (e.g., enabling a specific cloud LLM or web search feature).
- **Transparent Processing:** When AI is processing data, clearly indicate whether it is happening locally (e.g., Ollama) or via a cloud provider.
- **Data Portability:** Users should always be able to export their entire knowledge base in standard, non-proprietary formats.
