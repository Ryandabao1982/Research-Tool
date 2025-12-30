# Specification: NotebookLM-style Synthesis Feature

## Overview
This feature enables users to synthesize knowledge from a selected set of local notes. It mimics the "Source-Grounded" AI behavior of NotebookLM, where the AI's responses are strictly constrained to the provided source material.

## User Stories
- As a researcher, I want to select multiple related notes so I can ask the AI questions specifically about those notes.
- As a developer, I want to generate a summary or a list of FAQs from a collection of documentation notes to quickly grasp complex topics.
- As a user, I want the AI's response to be grounded in my notes so I can trust the accuracy of the generated content.

## Functional Requirements
1. **Multi-Note Selection:** Users can select 2 or more notes from the sidebar or knowledge graph.
2. **Synthesis Context:** The selected notes are bundled and passed as "context" to the AI service.
3. **OpenAI-Compatible Integration:** The backend must communicate with an OpenAI-compatible API (local or cloud) to perform the synthesis.
4. **Grounded Prompting:** The system must use a system prompt that instructs the AI to *only* use the provided notes as its source of information.
5. **Streaming Responses:** Generated synthesis content must stream into the UI in real-time.
6. **Actionable Outputs:** Users can save the generated synthesis as a new note or copy it to the clipboard.

## Technical Requirements
- **Backend (Rust/Tauri):**
    - New Tauri command `synthesize_notes(note_ids: Vec<String>, prompt_type: String)`
    - Service layer to fetch note contents and format them into a single context block.
    - Integration with existing `ai_service.rs`.
- **Frontend (React/TypeScript):**
    - Update `NoteList` or `Sidebar` to support multi-select mode.
    - Create `SynthesisPanel` component for interaction and display.
    - Use `Zustand` to manage the selection state.

## Design Guidelines
- **Atmospheric UI:** The synthesis panel should follow the glassmorphism style.
- **Clear Grounding Status:** Show a visual indicator (e.g., "Grounded in X notes") when the AI is processing.
