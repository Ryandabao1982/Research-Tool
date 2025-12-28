/**
 * Shared Type Definitions
 * 
 * Centralized type definitions used across the KnowledgeBase Pro application,
 * following the Global Vibe Coding Constitution for type safety and clarity.
 * 
 * @module shared/types
 * @author KnowledgeBase Pro Team
 * @version 2.0.0
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Represents a note in the knowledge base
 */
export interface Note {
    /** Unique identifier for the note */
    id: string;

    /** Note title */
    title: string;

    /** Note content in Markdown format */
    content: string;

    /** ISO timestamp when note was created */
    created_at: string;

    /** ISO timestamp when note was last updated */
    updated_at: string;

    /** Parent folder ID, if note is in a folder */
    folder_id?: string;

    /** Whether this is an auto-generated daily note */
    is_daily_note: boolean;

    /** Additional metadata as key-value pairs */
    properties: Record<string, any>;

    /** Array of tag IDs associated with this note */
    tags: string[];

    /** Number of words in the note */
    word_count: number;

    /** Estimated reading time in minutes */
    reading_time: number;
}

/**
 * Represents a folder for organizing notes
 */
export interface Folder {
    /** Unique identifier for the folder */
    id: string;

    /** Folder name */
    name: string;

    /** Parent folder ID for nested folders */
    parent_id?: string;

    /** ISO timestamp when folder was created */
    created_at: string;

    /** Number of notes in this folder and subfolders */
    note_count?: number;
}

/**
 * Represents a tag for categorizing notes
 */
export interface Tag {
    /** Unique identifier for the tag */
    id: string;

    /** Tag name */
    name: string;

    /** Optional hex color code for tag visualization */
    color?: string;

    /** ISO timestamp when tag was created */
    created_at: string;

    /** Number of notes using this tag */
    usage_count?: number;
}

/**
 * Represents a link between notes
 */
export interface Link {
    /** Unique identifier for the link */
    id: string;

    /** ID of the source note */
    source_note_id: string;

    /** ID of the target note */
    target_note_id: string;

    /** ID of source block, if linking at block level */
    source_block_id?: string;

    /** ID of target block, if linking at block level */
    target_block_id?: string;

    /** Type of link (markdown, wiki, etc.) */
    link_type: string;

    /** ISO timestamp when link was created */
    created_at: string;
}

// ============================================================================
// Search and AI Types
// ============================================================================

/**
 * Represents a search result
 */
export interface SearchResult {
    /** ID of the matching note */
    note_id: string;

    /** Note title */
    title: string;

    /** Content snippet with highlighted matches */
    content_snippet: string;

    /** Relevance score from 0 to 1 */
    relevance_score: number;

    /** Array of text matches within the note */
    matches: SearchMatch[];

    /** Note creation timestamp */
    created_at: string;

    /** Note last update timestamp */
    updated_at: string;
}

/**
 * Represents a text match within a search result
 */
export interface SearchMatch {
    /** Field where match was found */
    field: 'title' | 'content';

    /** Starting position of match */
    start: number;

    /** Ending position of match */
    end: number;

    /** Matched text */
    text: string;
}

/**
 * Represents an AI request
 */
export interface AIRequest {
    /** The query or prompt sent to AI */
    query: string;

    /** Array of document IDs to use as context */
    context_documents: string[];

    /** Whether to include source citations in response */
    include_citations: boolean;

    /** Preferred AI model to use */
    model_preference?: string;

    /** Additional options for AI processing */
    options?: AIRequestOptions;
}

/**
 * Represents an AI response
 */
export interface AIResponse {
    /** The generated text response */
    answer: string;

    /** Array of source citations */
    citations: Citation[];

    /** Confidence score from 0 to 1 */
    confidence_score: number;

    /** Model used to generate response */
    model_used: string;

    /** Processing time in milliseconds */
    processing_time: number;
}

/**
 * Represents a source citation
 */
export interface Citation {
    /** ID of the cited document */
    document_id: string;

    /** Title of the cited document */
    document_title: string;

    /** Page number within document, if applicable */
    page_number?: number;

    /** Relevant excerpt from the source */
    relevant_excerpt: string;

    /** Confidence score for this citation */
    confidence_score: number;
}

/**
 * Additional options for AI requests
 */
export interface AIRequestOptions {
    /** Temperature for creative responses (0.0 to 2.0) */
    temperature?: number;

    /** Maximum number of tokens to generate */
    max_tokens?: number;

    /** Whether to stream the response */
    stream?: boolean;

    /** Stop sequences to end generation */
    stop_sequences?: string[];
}

// ============================================================================
// Service Interface Types
// ============================================================================

/**
 * Note management service interface
 */
export interface NoteService {
    /** Create a new note */
    createNote(note: CreateNoteRequest): Promise<Note>;

    /** Update an existing note */
    updateNote(id: string, updates: UpdateNoteRequest): Promise<Note>;

    /** Delete a note */
    deleteNote(id: string): Promise<void>;

    /** Get a note by ID */
    getNote(id: string): Promise<Note | null>;

    /** List notes with optional filtering */
    listNotes(filters?: NoteFilters): Promise<Note[]>;
}

/**
 * Search service interface
 */
export interface SearchService {
    /** Perform full-text search */
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;

    /** Get search suggestions */
    getSuggestions(query: string): Promise<string[]>;

    /** Advanced search with filters */
    advancedSearch(filters: SearchFilters): Promise<Note[]>;
}

/**
 * AI service interface
 */
export interface AIService {
    /** Generate AI response using specified provider */
    generate(request: AIRequest): Promise<AIResponse>;

    /** Register an AI provider */
    registerProvider(id: string, config: AIProviderConfig): Promise<void>;

    /** Unregister an AI provider */
    unregisterProvider(id: string): Promise<void>;

    /** Get available AI models */
    getAvailableModels(): Promise<AIModel[]>;
}

/**
 * File system service interface
 */
export interface FileSystemService {
    /** Import files into the knowledge base */
    importFiles(paths: string[], options?: ImportOptions): Promise<ImportResult>;

    /** Export notes to files */
    exportNotes(noteIds: string[], format: ExportFormat, options?: ExportOptions): Promise<string>;

    /** Create a backup of the knowledge base */
    createBackup(path: string, options?: BackupOptions): Promise<BackupResult>;

    /** Restore from a backup */
    restoreBackup(path: string, options?: RestoreOptions): Promise<RestoreResult>;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Request to create a new note
 */
export interface CreateNoteRequest {
    title: string;
    content: string;
    folder_id?: string;
    properties?: Record<string, any>;
    tags?: string[];
}

/**
 * Request to update an existing note
 */
export interface UpdateNoteRequest {
    title?: string;
    content?: string;
    folder_id?: string;
    properties?: Record<string, any>;
    tags?: string[];
}

/**
 * Filters for listing notes
 */
export interface NoteFilters {
    folder_id?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    search?: string;
}

/**
 * Options for search operations
 */
export interface SearchOptions {
    limit?: number;
    includeContent?: boolean;
    folderFilter?: string[];
    tagFilter?: string[];
}

/**
 * Filters for advanced search
 */
export interface SearchFilters {
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

/**
 * Configuration for an AI provider
 */
export interface AIProviderConfig {
    model: string;
    api_key?: string;
    endpoint?: string;
    options?: Record<string, any>;
}

/**
 * Available AI model information
 */
export interface AIModel {
    id: string;
    name: string;
    description: string;
    context_length: number;
    pricing?: {
        input: number;
        output: number;
    };
}

/**
 * Options for file import
 */
export interface ImportOptions {
    create_folders?: boolean;
    preserve_structure?: boolean;
    tag_imported?: boolean;
}

/**
 * Result of file import operation
 */
export interface ImportResult {
    imported_count: number;
    skipped_count: number;
    errors: string[];
    notes: Note[];
}

/**
 * Export format options
 */
export type ExportFormat = 'markdown' | 'json' | 'pdf' | 'html';

/**
 * Options for export operations
 */
export interface ExportOptions {
    include_metadata?: boolean;
    include_backlinks?: boolean;
    template?: string;
}

/**
 * Options for backup creation
 */
export interface BackupOptions {
    include_attachments?: boolean;
    compress?: boolean;
    encrypt?: boolean;
    password?: string;
}

/**
 * Result of backup creation
 */
export interface BackupResult {
    backup_path: string;
    size: number;
    note_count: number;
    created_at: string;
}

/**
 * Options for backup restoration
 */
export interface RestoreOptions {
    merge_mode?: 'replace' | 'merge' | 'skip_duplicates';
    password?: string;
}

/**
 * Result of backup restoration
 */
export interface RestoreResult {
    success: boolean;
    restored_notes: number;
    skipped_notes: number;
    errors: string[];
    restored_at: string;
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Props for atmospheric UI components
 */
export interface AtmosphericComponentProps {
    /** Additional CSS classes */
    className?: string;

    /** Whether component is in loading state */
    loading?: boolean;

    /** Whether component is disabled */
    disabled?: boolean;

    /** Size variant */
    size?: 'sm' | 'md' | 'lg';

    /** Style variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
    /** Theme name */
    name: string;

    /** Color palette */
    colors: Record<string, string>;

    /** Typography settings */
    typography: {
        fontFamily: string;
        fontSize: Record<string, string>;
        fontWeight: Record<string, string>;
    };

    /** Spacing configuration */
    spacing: Record<string, string>;

    /** Border radius settings */
    borderRadius: Record<string, string>;

    /** Shadow definitions */
    shadows: Record<string, string>;

    /** Animation durations */
    animation: Record<string, string>;
}

/**
 * Plugin manifest information
 */
export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    main: string;
    permissions: string[];
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}