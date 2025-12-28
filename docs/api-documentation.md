# API Documentation - KnowledgeBase Pro

## 📋 Document Information
- **Project**: KnowledgeBase Pro Desktop Application
- **API Version**: 1.0.0
- **Last Updated**: 2025-12-28
- **Protocol**: Tauri IPC (Inter-Process Communication)

## 🔗 Overview

The KnowledgeBase Pro API is built on Tauri's IPC system, providing secure communication between the React frontend and Rust backend. All API calls are asynchronous and return results via Promises.

### Base URL
```
tauri://localhost/
```

### Authentication
No authentication required for local application. All operations are performed in the context of the local user.

### Response Format
All API responses follow a consistent format:

```typescript
// Success Response
{
  success: true,
  data: T, // Response data
  error?: string
}

// Error Response  
{
  success: false,
  data?: T,
  error: string // Error message
}
```

## 📝 Note Management API

### Create Note
Creates a new note with optional metadata.

```typescript
interface CreateNoteRequest {
  title: string;
  content: string;
  folder_id?: string;
  properties?: Record<string, any>;
  tags?: string[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id?: string;
  is_daily_note: boolean;
  properties: Record<string, any>;
  word_count: number;
  reading_time: number;
}

await invoke('create_note', {
  title: string,
  content: string,
  folder_id?: string,
  properties?: string // JSON string
});
```

**Parameters:**
- `title` (string, required): Note title
- `content` (string, required): Note content in Markdown
- `folder_id` (string, optional): Parent folder ID
- `properties` (string, optional): JSON string of note properties

**Returns:** `Note` object

**Example:**
```typescript
const note = await invoke('create_note', {
  title: "My Research Notes",
  content: "# Research Findings\n\nThis is my research content...",
  folder_id: "folder-123",
  properties: JSON.stringify({
    status: "in-progress",
    priority: "high",
    author: "John Doe"
  })
});
```

### Update Note
Updates an existing note's content, title, or properties.

```typescript
interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  properties?: Record<string, any>;
}

await invoke('update_note', {
  id: string,
  title?: string,
  content?: string,
  properties?: string // JSON string
});
```

**Parameters:**
- `id` (string, required): Note ID
- `title` (string, optional): New title
- `content` (string, optional): New content
- `properties` (string, optional): JSON string of properties

**Returns:** Updated `Note` object

### Delete Note
Permanently deletes a note and all its associated data.

```typescript
await invoke('delete_note', { id: string });
```

**Parameters:**
- `id` (string, required): Note ID to delete

**Returns:** `void`

### Get Note
Retrieves a single note by ID.

```typescript
await invoke('get_note', { id: string });
```

**Parameters:**
- `id` (string, required): Note ID

**Returns:** `Note | null`

### List Notes
Retrieves notes with optional filtering and pagination.

```typescript
interface ListNotesRequest {
  folder_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  search?: string;
}

await invoke('list_notes', {
  folder_id?: string,
  tags?: string[],
  limit?: number,
  offset?: number
});
```

**Parameters:**
- `folder_id` (string, optional): Filter by folder
- `tags` (string[], optional): Filter by tags
- `limit` (number, optional): Maximum results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Returns:** Array of `Note` objects

## 🔍 Search API

### Full-Text Search
Performs full-text search across notes with highlighting.

```typescript
interface SearchRequest {
  query: string;
  limit?: number;
  includeContent?: boolean;
  folderFilter?: string[];
  tagFilter?: string[];
}

interface SearchResult {
  note_id: string;
  title: string;
  content_snippet: string;
  relevance_score: number;
  matches: SearchMatch[];
  created_at: string;
  updated_at: string;
}

interface SearchMatch {
  field: 'title' | 'content';
  start: number;
  end: number;
  text: string;
}

await invoke('search_notes', {
  query: string,
  options?: SearchOptions
});

interface SearchOptions {
  limit?: number;
  includeContent?: boolean;
  folderFilter?: string[];
  tagFilter?: string[];
}
```

**Parameters:**
- `query` (string, required): Search query
- `options.limit` (number, optional): Maximum results (default: 20)
- `options.includeContent` (boolean, optional): Include content snippets
- `options.folderFilter` (string[], optional): Limit search to folders
- `options.tagFilter` (string[], optional): Limit search to tags

**Returns:** Array of `SearchResult` objects

### Advanced Search
Advanced search with structured filters.

```typescript
interface SearchFilters {
  title?: string;
  content?: string;
  tags?: string[];
  folder_id?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  properties?: Record<string, any>;
  hasBacklinks?: boolean;
}

await invoke('advanced_search', { filters: SearchFilters });
```

**Returns:** Array of `Note` objects

### Search Suggestions
Get autocomplete suggestions for search queries.

```typescript
await invoke('get_search_suggestions', { query: string });
```

**Parameters:**
- `query` (string, required): Partial query for suggestions

**Returns:** Array of suggestion strings

## 🔗 Linking System API

### Get Backlinks
Retrieves all notes that link to the specified note.

```typescript
interface Link {
  id: string;
  source_note_id: string;
  target_note_id: string;
  source_block_id?: string;
  target_block_id?: string;
  link_type: string;
  created_at: string;
}

await invoke('get_backlinks', { note_id: string });
```

**Returns:** Array of `Link` objects

### Get Forward Links
Retrieves all links from the specified note to other notes.

```typescript
await invoke('get_forward_links', { note_id: string });
```

**Returns:** Array of `Link` objects

### Create Link
Creates a bidirectional link between two notes.

```typescript
interface CreateLinkRequest {
  source_note_id: string;
  target_note_id: string;
  source_block_id?: string;
  target_block_id?: string;
}

await invoke('create_link', {
  source_note_id: string,
  target_note_id: string,
  source_block_id?: string,
  target_block_id?: string
});
```

**Returns:** Created `Link` object

## 📂 Folder Management API

### Create Folder
Creates a new folder for organizing notes.

```typescript
interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  note_count?: number;
}

await invoke('create_folder', {
  name: string,
  parent_id?: string
});
```

**Parameters:**
- `name` (string, required): Folder name
- `parent_id` (string, optional): Parent folder ID

**Returns:** `Folder` object

### List Folders
Retrieves folder hierarchy.

```typescript
await invoke('list_folders', { parent_id?: string });
```

**Parameters:**
- `parent_id` (string, optional): Parent folder ID (for hierarchy)

**Returns:** Array of `Folder` objects

### Update Folder
Updates folder properties.

```typescript
await invoke('update_folder', {
  id: string,
  name?: string,
  parent_id?: string
});
```

### Delete Folder
Deletes a folder and optionally moves notes to another folder.

```typescript
interface DeleteFolderRequest {
  id: string;
  move_notes_to?: string; // Target folder ID
}

await invoke('delete_folder', {
  id: string,
  move_notes_to?: string
});
```

## 🏷️ Tag Management API

### Create Tag
Creates a new tag for categorizing notes.

```typescript
interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
  usage_count?: number;
}

await invoke('create_tag', {
  name: string,
  color?: string
});
```

**Parameters:**
- `name` (string, required): Tag name
- `color` (string, optional): Hex color code

**Returns:** `Tag` object

### List Tags
Retrieves all tags with usage statistics.

```typescript
await invoke('list_tags', {});
```

**Returns:** Array of `Tag` objects

### Add Tag to Note
Adds a tag to a specific note.

```typescript
await invoke('add_tag_to_note', {
  note_id: string,
  tag_id: string
});
```

### Remove Tag from Note
Removes a tag from a specific note.

```typescript
await invoke('remove_tag_from_note', {
  note_id: string,
  tag_id: string
});
```

## 🧱 Block-Level References API

### Get Note Blocks
Retrieves all blocks within a note for block-level referencing.

```typescript
interface Block {
  id: string;
  note_id: string;
  content: string;
  order_index: number;
  parent_block_id?: string;
  block_type: string;
  created_at: string;
  updated_at: string;
}

await invoke('get_note_blocks', { note_id: string });
```

**Returns:** Array of `Block` objects

### Create Block Reference
Creates a reference between specific blocks in different notes.

```typescript
interface BlockReference {
  id: string;
  source_note_id: string;
  source_block_id: string;
  target_note_id: string;
  target_block_id: string;
  created_at: string;
}

await invoke('create_block_reference', {
  source_note_id: string,
  source_block_id: string,
  target_note_id: string,
  target_block_id: string
});
```

### Get Block References
Retrieves all references to or from a specific block.

```typescript
await invoke('get_block_references', {
  note_id: string,
  block_id: string
});
```

## 📁 File Management API

### Import Files
Imports external files into the knowledge base.

```typescript
interface ImportRequest {
  paths: string[];
  options?: {
    create_folders?: boolean;
    preserve_structure?: boolean;
    tag_imported?: boolean;
  };
}

interface ImportResult {
  imported_count: number;
  skipped_count: number;
  errors: string[];
  notes: Note[];
}

await invoke('import_files', {
  paths: string[],
  options?: ImportOptions
});

interface ImportOptions {
  create_folders?: boolean;
  preserve_structure?: boolean;
  tag_imported?: boolean;
}
```

**Supported Formats:**
- Markdown (.md, .markdown)
- Plain text (.txt)
- HTML (.html, .htm)
- PDF (.pdf) - text extraction
- Word documents (.docx) - text extraction

### Export Notes
Exports notes to various formats.

```typescript
type ExportFormat = 'markdown' | 'json' | 'pdf' | 'html';

interface ExportRequest {
  note_ids: string[];
  format: ExportFormat;
  options?: {
    include_metadata?: boolean;
    include_backlinks?: boolean;
    template?: string;
  };
}

await invoke('export_notes', {
  note_ids: string[],
  format: ExportFormat,
  options?: ExportOptions
});
```

**Returns:** File path or base64 encoded content

### Create Backup
Creates a complete backup of the knowledge base.

```typescript
interface BackupRequest {
  path: string;
  options?: {
    include_attachments?: boolean;
    compress?: boolean;
    encrypt?: boolean;
    password?: string;
  };
}

interface BackupResult {
  backup_path: string;
  size: number;
  note_count: number;
  created_at: string;
}

await invoke('create_backup', {
  path: string,
  options?: BackupOptions
});
```

### Restore Backup
Restores knowledge base from a backup file.

```typescript
interface RestoreRequest {
  path: string;
  options?: {
    merge_mode?: 'replace' | 'merge' | 'skip_duplicates';
    password?: string;
  };
}

await invoke('restore_backup', {
  path: string,
  options?: RestoreOptions
});
```

## 📊 Analytics API

### Get Statistics
Retrieves knowledge base usage statistics.

```typescript
interface Statistics {
  total_notes: number;
  total_folders: number;
  total_tags: number;
  total_links: number;
  storage_used: number;
  average_note_length: number;
  most_used_tags: Tag[];
  recent_activity: ActivityItem[];
}

interface ActivityItem {
  type: 'create' | 'update' | 'delete';
  note_id: string;
  timestamp: string;
  title: string;
}

await invoke('get_statistics', {});
```

### Get Note Analytics
Retrieves detailed analytics for a specific note.

```typescript
interface NoteAnalytics {
  view_count: number;
  edit_count: number;
  backlink_count: number;
  forward_link_count: number;
  reading_time: number;
  last_viewed: string;
  last_edited: string;
}

await invoke('get_note_analytics', { note_id: string });
```

## ⚙️ Settings API

### Get Settings
Retrieves application settings.

```typescript
interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  auto_save: boolean;
  auto_save_interval: number;
  default_folder?: string;
  search_engine: 'sqlite' | 'client';
  plugins_enabled: boolean;
  encryption_enabled: boolean;
}

await invoke('get_settings', {});
```

### Update Settings
Updates application settings.

```typescript
await invoke('update_settings', {
  settings: Partial<Settings>
});
```

## 🔌 Plugin API

### List Plugins
Retrieves available and installed plugins.

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  installed: boolean;
  permissions: string[];
}

await invoke('list_plugins', {});
```

### Enable/Disable Plugin
Enables or disables a specific plugin.

```typescript
await invoke('set_plugin_enabled', {
  plugin_id: string,
  enabled: boolean
});
```

### Execute Plugin Command
Executes a command on a specific plugin.

```typescript
await invoke('execute_plugin_command', {
  plugin_id: string,
  command: string,
  parameters?: Record<string, any>
});
```

## 📡 Event System

The API also provides an event system for real-time updates:

### Subscribe to Events
```typescript
import { listen } from '@tauri-apps/api/event';

await listen('note-updated', (event) => {
  console.log('Note updated:', event.payload);
});

await listen('search-results', (event) => {
  console.log('Search completed:', event.payload);
});
```

### Event Types
- `note-created`: New note created
- `note-updated`: Note modified
- `note-deleted`: Note removed
- `folder-created`: New folder created
- `tag-created`: New tag created
- `link-created`: New link established
- `search-results`: Search operation completed
- `backup-completed`: Backup operation finished
- `import-completed`: Import operation finished

## 🚨 Error Handling

### Error Codes
- `INVALID_INPUT`: Input validation failed
- `NOT_FOUND`: Requested resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `DATABASE_ERROR`: Database operation failed
- `FILE_ERROR`: File system operation failed
- `ENCRYPTION_ERROR`: Encryption/decryption failed
- `PLUGIN_ERROR`: Plugin operation failed
- `UNKNOWN_ERROR`: Unexpected error occurred

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  }
}
```

## 📖 Usage Examples

### Complete Note Workflow
```typescript
// Create a note
const note = await invoke('create_note', {
  title: "Meeting Notes",
  content: "# Project Meeting\n\nDiscussed new features...",
  properties: JSON.stringify({
    meeting_date: "2025-12-28",
    attendees: ["John", "Jane"]
  })
});

// Add tags
const tag = await invoke('create_tag', {
  name: "meeting",
  color: "#3b82f6"
});
await invoke('add_tag_to_note', {
  note_id: note.id,
  tag_id: tag.id
});

// Create link to another note
await invoke('create_link', {
  source_note_id: note.id,
  target_note_id: "existing-note-id"
});

// Search for the note
const results = await invoke('search_notes', {
  query: "Project Meeting",
  options: { limit: 10 }
});
```

This API documentation provides comprehensive coverage of all available operations in the KnowledgeBase Pro application, enabling developers to build powerful integrations and extensions.