# API Documentation - KnowledgeBase Pro

## 📋 Document Information
- **Project**: KnowledgeBase Pro Desktop Application
- **API Type**: Tauri IPC Commands
- **Version**: 2.0.1
- **Last Updated**: 2026-01-01
- **Status**: Phase 5 Complete - 36 Commands Available

## 🚀 Overview

KnowledgeBase Pro exposes 36+ Tauri commands organized into modules. All commands are type-safe with proper error handling and return structured data.

## 📚 Command Reference

### 📝 Note Commands (10 commands - Updated 2026-01-01)

#### `get_notes`
Lists all notes.

```typescript
// Usage
const notes = await invoke<Note[]>('get_notes');

// Returns
interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    folder_id?: string;
    is_daily_note: boolean;
    word_count: number;
    reading_time: number;
    created_at: string;
    updated_at: string;
}
```

#### `get_note`
Retrieves a specific note by ID.

```typescript
// Usage
const note = await invoke<Note | null>('get_note', { id: 'note-id' });
```

#### `create_note`
Creates a new note.

```typescript
// Usage
const note = await invoke<Note>('create_note', {
    title: 'My Note',
    content: 'Note content',
    tags: ['tag1', 'tag2'],
    folder_id: 'folder-id' // optional
});
```

#### `update_note`
Updates an existing note.

```typescript
// Usage
const note = await invoke<Note>('update_note', {
    id: 'note-id',
    title: 'Updated Title', // optional
    content: 'Updated content', // optional
    tags: ['new-tag'], // optional
    folder_id: 'new-folder' // optional
});
```

#### `delete_note`
Deletes a note by ID.

```typescript
// Usage
await invoke('delete_note', { id: 'note-id' });
```

#### `list_notes`
Legacy command - same as `get_notes`.

```typescript
// Usage
const notes = await invoke<Note[]>('list_notes');
```

#### `get_notes_by_folder`
Retrieves all notes in a specific folder.

```typescript
// Usage
const notes = await invoke<Note[]>('get_notes_by_folder', { folder_id: 'folder-id' });
```

#### `get_notes_by_tag`
Retrieves all notes with a specific tag.

```typescript
// Usage
const notes = await invoke<Note[]>('get_notes_by_tag', { tag_name: 'research' });
```

#### `search_notes`
Searches across all notes using FTS5.

```typescript
// Usage
const results = await invoke<SearchResult[]>('search_notes', { query: 'search term' });

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
}
```

#### `get_recent_notes`
Gets most recently updated notes.

```typescript
// Usage
const notes = await invoke<Note[]>('get_recent_notes', { limit: 10 });
```

### 📁 Folder Commands (4 commands)

#### `list_folders`
Lists all folders.

```typescript
// Usage
const folders = await invoke<Folder[]>('list_folders');

// Returns
interface Folder {
    id: string;
    name: string;
    parent_id?: string;
    path?: string;
    created_at: string;
}
```

#### `create_folder`
Creates a new folder.

```typescript
// Usage
const folder = await invoke<Folder>('create_folder', {
    name: 'Research',
    parent_id: 'parent-id' // optional
});
```

#### `update_folder`
Updates an existing folder.

```typescript
// Usage
const folder = await invoke<Folder>('update_folder', {
    id: 'folder-id',
    name: 'Updated Name', // optional
    parent_id: 'new-parent' // optional
});
```

#### `delete_folder`
Deletes a folder by ID.

```typescript
// Usage
await invoke('delete_folder', { id: 'folder-id' });
```

### 🏷️ Tag Commands (6 commands - Updated 2026-01-01)

#### `get_tags`
Lists all tags (new command added 2026-01-01).

```typescript
// Usage
const tags = await invoke<Tag[]>('get_tags');

// Returns
interface Tag {
    id: string;
    name: string;
    color?: string;
    created_at: string;
}
```

#### `list_tags`
Lists all tags (legacy command - same as get_tags).

```typescript
// Usage
const tags = await invoke<Tag[]>('list_tags');
```

#### `create_tag`
Creates a new tag.

```typescript
// Usage
const tag = await invoke<Tag>('create_tag', {
    name: 'research',
    color: '#a855f7' // optional
});
```

#### `delete_tag`
Deletes a tag by ID.

```typescript
// Usage
await invoke('delete_tag', { id: 'tag-id' });
```

#### `update_note_tags`
Updates tags for a note (replaces all tags).

```typescript
// Usage
await invoke('update_note_tags', {
    note_id: 'note-id',
    tag_ids: ['tag-id-1', 'tag-id-2']
});
```

#### `add_tag_to_note`
Adds a tag to a note (creates tag if needed).

```typescript
// Usage
await invoke('add_tag_to_note', {
    note_id: 'note-id',
    tag_name: 'new-tag'
});
```

#### `remove_tag_from_note`
Removes a tag from a note.

```typescript
// Usage
await invoke('remove_tag_from_note', {
    note_id: 'note-id',
    tag_name: 'tag-name'
});
```

### 🔍 Search Commands (5 commands)

#### `search_notes`
Searches across all notes using FTS5.

```typescript
// Usage
const results = await invoke<SearchResult[]>('search_notes', { query: 'search term' });

// Returns
interface SearchResult {
    note_id: string;
    title: string;
    content_snippet: string;
    relevance_score: number;
}
```

#### `search_in_folder`
Searches within a specific folder.

```typescript
// Usage
const results = await invoke<SearchResult[]>('search_in_folder', {
    folder_id: 'folder-id',
    query: 'search term'
});
```

#### `search_by_tag`
Searches within notes with a specific tag.

```typescript
// Usage
const results = await invoke<SearchResult[]>('search_by_tag', {
    tag_name: 'research',
    query: 'search term'
});
```

#### `get_search_suggestions`
Gets search suggestions for autocomplete.

```typescript
// Usage
const suggestions = await invoke<string[]>('get_search_suggestions', {
    query: 'partial',
    limit: 5
});
```

#### `get_all_notes_count`
Gets total count of notes.

```typescript
// Usage
const count = await invoke<number>('get_all_notes_count');
```

#### `get_recent_notes`
Gets most recently updated notes.

```typescript
// Usage
const notes = await invoke<Note[]>('get_recent_notes', { limit: 10 });
```

### 🔗 Link Commands (6 commands)

#### `list_links`
Lists all links between notes.

```typescript
// Usage
const links = await invoke<Link[]>('list_links');

// Returns
interface Link {
    id: string;
    source_note_id: string;
    target_note_id: string;
    source_block_id?: string;
    target_block_id?: string;
    link_type: string;
    created_at: string;
}
```

#### `create_link`
Creates a new link between notes.

```typescript
// Usage
const link = await invoke<Link>('create_link', {
    source_note_id: 'source-id',
    target_note_id: 'target-id',
    source_block_id: 'block-id', // optional
    target_block_id: 'block-id', // optional
    link_type: 'wikilink' // optional
});
```

#### `delete_link`
Deletes a link by ID.

```typescript
// Usage
await invoke('delete_link', { id: 'link-id' });
```

#### `get_backlinks`
Gets all notes that link to the specified note.

```typescript
// Usage
const notes = await invoke<Note[]>('get_backlinks', { note_id: 'note-id' });
```

#### `get_forward_links`
Gets all notes that the specified note links to.

```typescript
// Usage
const notes = await invoke<Note[]>('get_forward_links', { note_id: 'note-id' });
```

#### `parse_and_create_links`
Parses wikilinks from content and creates links.

```typescript
// Usage
const links = await invoke<Link[]>('parse_and_create_links', {
    note_id: 'note-id',
    content: 'Content with [[wikilinks]]'
});
```

#### `get_link_count`
Gets total number of links (forward + backlinks) for a note.

```typescript
// Usage
const count = await invoke<number>('get_link_count', { note_id: 'note-id' });
```

### 🤖 AI Commands (Updated Phase 3)

#### `synthesize_query`
High-level RAG command. Searches for relevant cards using FTS5, bundles context, and generates a response using the internal Candle-based LLM.

```typescript
// Usage
const response = await invoke<string>('synthesize_query', {
    query: 'What are the main topics in my research notes?'
});
```

#### `get_model_status`
Returns the current status of the local LLM model (downloaded state, path, and size).

```typescript
// Usage
const status = await invoke<ModelStatus>('get_model_status');

interface ModelStatus {
    downloaded: boolean;
    model_path: string;
    model_size: number;
}
```

#### `delete_model`
Deletes the local model files from the `resources/` directory and clears the in-memory state.

```typescript
// Usage
await invoke('delete_model');
```

#### `generate_ai_response` (Legacy/Mock)
*Note: This is currently being transitioned to use `synthesize_query` for local-first operations.*

```typescript
// Usage
const response = await invoke<AIResponse>('generate_ai_response', {
    query: '...',
    context_documents: ['...']
});
```

#### `create_ai_conversation`
Creates a new AI conversation.

```typescript
// Usage
const conversation = await invoke<AIConversation>('create_ai_conversation', {
    title: 'Research Discussion'
});

// Returns
interface AIConversation {
    id: string;
    title: string;
    created_at: string;
    message_count: number;
}
```

#### `add_ai_message`
Adds a message to an AI conversation.

```typescript
// Usage
const message = await invoke<AIMessage>('add_ai_message', {
    conversation_id: 'conv-id',
    role: 'user', // 'user' or 'assistant'
    content: 'Message content',
    citations: 'json-citations' // optional
});

// Returns
interface AIMessage {
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    citations?: string;
    created_at: string;
}
```

#### `get_ai_conversation_history`
Gets all messages in a conversation.

```typescript
// Usage
const messages = await invoke<AIMessage[]>('get_ai_conversation_history', {
    conversation_id: 'conv-id'
});
```

#### `list_ai_conversations`
Lists all AI conversations.

```typescript
// Usage
const conversations = await invoke<AIConversation[]>('list_ai_conversations');
```

## 🔧 Error Handling

All commands return `Result<T, String>` from Rust, which translates to:
- **Success**: Returns the specified type
- **Error**: Throws an error with the error message string

```typescript
try {
    const note = await invoke<Note>('get_note', { id: 'note-id' });
    // Handle success
} catch (error) {
    console.error('Command failed:', error);
    // Handle error
}
```

## 🚀 Performance Notes

- **Database**: SQLite with connection pooling
- **Search**: FTS5 with BM25 ranking for sub-100ms results
- **AI**: Local LLM via Candle framework
- **Memory**: Efficient service sharing with Arc references
- **Type Safety**: Full TypeScript interfaces for all data structures

## 📝 Development Notes (Updated 2026-01-01)

- All services are modular and can be extended independently
- Commands follow RESTful naming conventions
- Database migrations are versioned and run automatically
- Frontend services are updated to use new command names
- Backend commands require: `cd src-tauri && cargo build`
- Start app with: `npm run tauri:dev`

## 🔧 Command Summary (2026-01-01)

| Module | Commands | Status |
| :--- | :--- | :--- |
| Data (notes) | get_notes, get_note, create_note, update_note, delete_note, list_notes, get_notes_by_folder, get_notes_by_tag, search_notes, get_recent_notes | ✅ Complete |
| Organization | get_folders, list_folders, create_folder, update_folder, delete_folder, get_tags, list_tags, create_tag, delete_tag | ✅ Complete |
| Search | search_notes, search_in_folder, search_by_tag, get_search_suggestions, get_all_notes_count | ✅ Complete |
| Links | list_links, create_link, delete_link, get_backlinks, get_forward_links, parse_and_create_links, get_link_count | ✅ Complete |
| AI | synthesize_query, get_model_status, delete_model, generate_ai_response, create_ai_conversation, add_ai_message, get_ai_conversation_history, list_ai_conversations | ✅ Phase 3 |

**Total: 36+ commands available**