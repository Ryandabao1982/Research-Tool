import { invoke } from '@tauri-apps/api/tauri';
import { AIRequest, AIResponse, AIService, AIProviderConfig, AIConversation, AIMessage, TokenUsage, Note, AIModel } from '../types';

export class TauriAIService implements AIService {
  async initializeProviders(): Promise<void> { /* no-op for minimal skeleton */ }
  async generate(request: AIRequest): Promise<AIResponse> {
    return { answer: '', citations: [], confidence_score: 0, model_used: 'local', processing_time: 0, token_usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }
  async *generateStream(request: AIRequest): AsyncIterable<string> { yield ''; }
  async registerProvider(id: string, config: AIProviderConfig): Promise<void> { }
  async unregisterProvider(id: string): Promise<void> { }
  async getAvailableModels(): Promise<AIModel[]> { return []; }
  async createConversation(title: string): Promise<AIConversation> { return { id: '0', title, created_at: new Date().toISOString(), message_count: 0, last_activity: new Date().toISOString() }; }
  async addMessage(conversationId: string, role: string, content: string, citations?: string): Promise<AIMessage> {
    return { id: '0', conversation_id: conversationId, role, content, citations, created_at: new Date().toISOString(), model_used: 'local', token_usage: { prompt_tokens: content.length, completion_tokens: 0, total_tokens: content.length } };
  }
  async getConversationHistory(conversationId: string): Promise<AIMessage[]> { return []; }
  async listConversations(): Promise<AIConversation[]> { return []; }
  async searchRelatedDocuments(query: string, limit?: number): Promise<string[]> { return []; }
  async generateSummary(documentIds: string[]): Promise<string> { return ''; }
  async generateStudyGuide(topic: string, documentIds: string[]): Promise<string> { return ''; }
  estimateTokens?(text: string): number { return Math.ceil(text.length/4); }
  calculateCosts?(tokenUsage: TokenUsage, model: AIModel): number { return 0; }
  setNotes?(notes: Note[]): void { }
 |}
