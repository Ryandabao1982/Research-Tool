/**
 * Shared Type Definitions
 *
 * Centralized type definitions used across the KnowledgeBase Pro application,
 * following the Global Vibe Coding Constitution for type safety and clarity.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id?: string;
  is_daily_note: boolean;
  properties: Record<string, any>;
  tags: string[];
  word_count: number;
  reading_time: number;
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  note_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
  usage_count?: number;
}

export interface Link {
  id: string;
  source_note_id: string;
  target_note_id: string;
  source_block_id?: string;
  target_block_id?: string;
  link_type: string;
  created_at: string;
}

export interface Block {
  id: string;
  note_id: string;
  content: string;
  block_type: BlockType;
  position: number;
  parent_block_id?: string;
  created_at: string;
  updated_at: string;
}

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "list"
  | "code"
  | "quote"
  | "divider";

// ============================================================================
// Search and AI Types
// ============================================================================

export interface SearchResult {
  note_id: string;
  title: string;
  content_snippet: string;
  relevance_score: number;
  matches: SearchMatch[];
  created_at: string;
  updated_at: string;
}

export interface SearchMatch {
  field: "title" | "content";
  start: number;
  end: number;
  text: string;
}

export interface AIRequest {
  query: string;
  context_documents: string[];
  include_citations?: boolean;
  model_preference?: string;
  conversation_id?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIResponse {
  answer: string;
  citations: AICitation[];
  confidence_score: number;
  model_used: string;
  processing_time: number;
  token_usage: TokenUsage;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AICitation {
  document_id: string;
  document_title: string;
  relevant_excerpt: string;
  confidence_score: number;
  page_number?: number;
  relevance_type: CitationType;
}

export type CitationType =
  | "DirectQuote"
  | "Paraphrase"
  | "Concept"
  | "Background";

// ============================================================================
// Service Interface Types
// ============================================================================

export interface NoteService {
  createNote(note: CreateNoteRequest): Promise<Note>;
  updateNote(id: string, updates: UpdateNoteRequest): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  getNote(id: string): Promise<Note | null>;
  listNotes(filters?: NoteFilters): Promise<Note[]>;
  listFolders(): Promise<Folder[]>;
  createFolder(name: string, parent_id?: string): Promise<Folder>;
  listTags(): Promise<Tag[]>;
  listLinks(): Promise<Link[]>;
}

export interface SearchService {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  getSuggestions(query: string): Promise<string[]>;
  advancedSearch(filters: SearchFilters): Promise<Note[]>;
}

export interface AIService {
  generate(request: AIRequest): Promise<AIResponse>;
  generateStream(
    request: AIRequest,
  ): AsyncIterable<string> | Promise<AsyncIterable<string>>;
  registerProvider(id: string, config: AIProviderConfig): Promise<void>;
  unregisterProvider(id: string): Promise<void>;
  getAvailableModels(): Promise<AIModel[]>;
  createConversation(title: string): Promise<AIConversation>;
  addMessage(
    conversationId: string,
    role: string,
    content: string,
    citations?: string,
  ): Promise<AIMessage>;
  getConversationHistory(conversationId: string): Promise<AIMessage[]>;
  listConversations(): Promise<AIConversation[]>;
  searchRelatedDocuments(query: string, limit?: number): Promise<string[]>;
  generateSummary(documentIds: string[]): Promise<string>;
  generateStudyGuide(topic: string, documentIds: string[]): Promise<string>;
  // Enhanced AI methods
  initializeProviders?(): Promise<void>;
  selectOptimalModel?(query: string, availableModels: AIModel[]): string;
  formatContextDocuments?(documents: string[]): string;
  estimateTokens?(text: string): number;
  calculateCosts?(tokenUsage: TokenUsage, model: AIModel): number;
}

export interface BlockService {
  listBlocks(noteId: string): Promise<Block[]>;
  getBlock(id: string): Promise<Block | null>;
  createBlock(request: CreateBlockRequest): Promise<Block>;
  updateBlock(id: string, request: UpdateBlockRequest): Promise<Block>;
  deleteBlock(id: string): Promise<void>;
  createBlockLink(
    sourceBlockId: string,
    targetBlockId: string,
    noteId: string,
  ): Promise<string>;
  searchBlocks(query: string, noteId?: string): Promise<Block[]>;
}

export interface PluginService {
  listPlugins(): Promise<Plugin[]>;
  loadPlugin(path: string): Promise<Plugin>;
  unloadPlugin(id: string): Promise<void>;
  togglePlugin(id: string, enabled: boolean): Promise<void>;
  getSettings(id: string): Promise<PluginSettings>;
  saveSettings(id: string, settings: PluginSettings): Promise<void>;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateNoteRequest {
  title: string;
  content: string;
  folder_id?: string;
  properties?: Record<string, any>;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  folder_id?: string;
  properties?: Record<string, any>;
  tags?: string[];
}

export interface CreateBlockRequest {
  note_id: string;
  content: string;
  block_type?: BlockType;
  parent_block_id?: string;
}

export interface UpdateBlockRequest {
  content?: string;
  block_type?: BlockType;
  parent_block_id?: string;
  position?: number;
}

export interface NoteFilters {
  folder_id?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  search?: string;
}

export interface SearchOptions {
  limit?: number;
  includeContent?: boolean;
  folderFilter?: string[];
  tagFilter?: string[];
}

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

export interface AIProviderConfig {
  model: string;
  api_key?: string;
  endpoint?: string;
  options?: Record<string, any>;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  model_type: ModelType;
  capabilities: ModelCapability[];
  size_mb: number;
  requires_gpu: boolean;
}

export type ModelType =
  | "TextGeneration"
  | "CodeGeneration"
  | "Embedding"
  | "Multimodal"
  | "AudioTranscription";

export type ModelCapability =
  | "ChatCompletion"
  | "TextCompletion"
  | "FunctionCalling"
  | "Streaming"
  | "Embedding"
  | "Reranking";

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
  last_activity: string;
  model_preference?: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  citations?: string;
  created_at: string;
  token_usage?: TokenUsage;
  model_used: string;
}

export interface AIProviderConfig {
  provider_type: ProviderType;
  api_endpoint?: string;
  api_key?: string;
  model: string;
  model_id?: string;
  enabled: boolean;
  priority: number;
}

export type ProviderType =
  | "Ollama"
  | "OpenAI"
  | "Anthropic"
  | "HuggingFace"
  | "LocalLLM";

// ============================================================================
// Plugin Types
// ============================================================================

export interface Plugin {
  manifest: PluginManifest;
  enabled: boolean;
  settings: PluginSettings;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
}

export type PluginSettings = Record<string, any>;

// ============================================================================
// File System and Portability Types
// ============================================================================

export interface FileSystemService {
  importFiles(paths: string[], options?: ImportOptions): Promise<ImportResult>;
  exportNotes(
    noteIds: string[],
    format: ExportFormat,
    options?: ExportOptions,
  ): Promise<string>;
  createBackup(path: string, options?: BackupOptions): Promise<BackupResult>;
  restoreBackup(path: string, options?: RestoreOptions): Promise<RestoreResult>;
}

export interface ImportOptions {
  create_folders?: boolean;
  preserve_structure?: boolean;
  tag_imported?: boolean;
}

export interface ImportResult {
  imported_count: number;
  skipped_count: number;
  errors: string[];
  notes: Note[];
}

export type ExportFormat = "markdown" | "json" | "pdf" | "html";

export interface ExportOptions {
  include_metadata?: boolean;
  include_backlinks?: boolean;
  template?: string;
}

export interface BackupOptions {
  include_attachments?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  password?: string;
}

export interface BackupResult {
  backup_path: string;
  size: number;
  note_count: number;
  created_at: string;
}

export interface RestoreOptions {
  merge_mode?: "replace" | "merge" | "skip_duplicates";
  password?: string;
}

export interface RestoreResult {
  success: boolean;
  restored_notes: number;
  skipped_notes: number;
  errors: string[];
  restored_at: string;
}
