import { invoke } from '@tauri-apps/api/tauri';
import {
    AIRequest,
    AIResponse,
    AIService,
    AIProviderConfig,
    AIModel,
    AIConversation,
    AIMessage,
    TokenUsage
} from '../types';

/**
 * Implementation of AIService for KnowledgeBase Pro.
 * Orchestrates local-first LLM interactions with Ollama and other providers.
 */
export class TauriAIService implements AIService {
    
    /**
     * Initialize AI providers (Ollama, etc.)
     */
    async initializeProviders(): Promise<void> {
        await invoke('initialize_ai_providers');
    }

    /**
     * Generate AI response with context documents
     */
    async generate(request: AIRequest): Promise<AIResponse> {
        return await invoke<AIResponse>('generate_ai_response', { request });
    }

    /**
     * Generate streaming AI response
     */
    async *generateStream(request: AIRequest): AsyncIterable<string> {
        const response = await invoke<string>('generate_ai_response_stream', { request });
        // For now, simulate streaming by yielding chunks
        const chunks = response.split(' ').filter(chunk => chunk.length > 0);
        for (const chunk of chunks) {
            yield chunk + ' ';
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
        }
    }
    }

    /**
     * Register a new AI provider
     */
    async registerProvider(id: string, config: AIProviderConfig): Promise<void> {
        // This would be implemented when we support multiple providers
        console.log('Registering provider:', id, config);
    }

    /**
     * Unregister an AI provider
     */
    async unregisterProvider(id: string): Promise<void> {
        console.log('Unregistering provider:', id);
    }

    /**
     * Get list of available AI models
     */
    async getAvailableModels(): Promise<AIModel[]> {
        return await invoke<AIModel[]>('get_available_ai_models');
    }

    /**
     * Create a new AI conversation
     */
    async createConversation(title: string): Promise<AIConversation> {
        return await invoke<AIConversation>('create_ai_conversation', { title });
    }

    /**
     * Add a message to a conversation
     */
    async addMessage(
        conversationId: string, 
        role: string, 
        content: string, 
        citations?: string
    ): Promise<AIMessage> {
        return await invoke<AIMessage>('add_ai_message', { 
            conversationId, 
            role, 
            content, 
            citations 
        });
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(conversationId: string): Promise<AIMessage[]> {
        return await invoke<AIMessage[]>('get_ai_conversation_history', { conversationId });
    }

    /**
     * List all conversations
     */
    async listConversations(): Promise<AIConversation[]> {
        return await invoke<AIConversation[]>('list_ai_conversations');
    }

    /**
     * Search for documents related to query
     */
    async searchRelatedDocuments(query: string, limit?: number): Promise<string[]> {
        return await invoke<string[]>('search_related_documents', { query, limit });
    }

    /**
     * Generate summary of documents
     */
    async generateSummary(documentIds: string[]): Promise<string> {
        return await invoke<string>('generate_document_summary', { documentIds });
    }

    /**
     * Generate study guide for topic based on documents
     */
    async generateStudyGuide(topic: string, documentIds: string[]): Promise<string> {
        return await invoke<string>('generate_study_guide', { topic, documentIds });
    }

    /**
     * Smart model selection based on query content
     */
    selectOptimalModel(query: string, availableModels: AIModel[]): string {
        const queryLower = query.toLowerCase();
        
        // Code-related queries get CodeLlama
        if (queryLower.includes('code') || 
            queryLower.includes('function') || 
            queryLower.includes('programming') ||
            queryLower.includes('```')) {
            const codeModel = availableModels.find(m => 
                m.model_type === 'CodeGeneration' && m.capabilities.includes('ChatCompletion')
            );
            return codeModel?.id || 'phi3.1:mini';
        }
        
        // Short queries get smaller model for speed
        if (queryLower.length < 50) {
            const fastModel = availableModels.find(m => 
                m.size_mb < 3000 && m.capabilities.includes('ChatCompletion')
            );
            return fastModel?.id || 'phi3.1:mini';
        }
        
        // Default to primary model
        return 'phi3.1:mini';
    }

    /**
     * Format context for AI prompt
     */
    formatContextDocuments(documents: string[]): string {
        if (documents.length === 0) return '';
        
        return documents
            .map((doc, index) => `Document ${index + 1}:\n${doc}`)
            .join('\n\n---\n\n');
    }

    /**
     * Estimate token usage for text
     */
    estimateTokens(text: string): number {
        // Rough estimation: ~4 characters per token for English
        return Math.ceil(text.length / 4);
    }

    /**
     * Calculate costs for model usage
     */
    calculateCosts(tokenUsage: TokenUsage, model: AIModel): number {
        // Example cost calculation (would vary by provider)
        const inputCostPer1K = 0.001; // $0.001 per 1K input tokens
        const outputCostPer1K = 0.002; // $0.002 per 1K output tokens
        
        return (tokenUsage.prompt_tokens * inputCostPer1K / 1000) + 
               (tokenUsage.completion_tokens * outputCostPer1K / 1000);
    }

    /**
     * Check if response needs citations
     */
    needsCitations(request: AIRequest): boolean {
        return request.include_citations && 
               request.context_documents.length > 0;
    }

    /**
     * Parse and validate AI response
     */
    validateResponse(response: any): AIResponse {
        if (!response.answer) {
            throw new Error('Invalid AI response: missing answer');
        }
        
        return {
            answer: response.answer,
            citations: response.citations || [],
            confidence_score: response.confidence_score || 0.8,
            model_used: response.model_used || 'unknown',
            processing_time: response.processing_time || 0,
            token_usage: response.token_usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };
    }
}

/**
 * Local fallback service for offline AI responses.
 * Simulates RAG (Retrieval-Augmented Generation) behavior.
 */
export class LocalAIService implements AIService {
    private getNotes(): Note[] {
        const data = localStorage.getItem('kb_pro_notes');
        return data ? JSON.parse(data) : [];
    }

    async generate(request: AIRequest): Promise<AIResponse> {
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const notes = this.getNotes();
        const contextNotes = notes.filter(n => 
            request.context_documents.some(doc => 
                doc.includes(n.title) || doc.includes(n.content.substring(0, 100))
            )
        );

        // Simple mock logic for "source-grounding"
        const answer = contextNotes.length > 0
            ? `Based on your research in "${contextNotes.map(n => n.title).join(', ')}", here is a summary. ${request.query} is strongly related to themes of ${contextNotes[0].tags?.[0] || 'core research'}.`
            : `I've analyzed your request: "${request.query}". Since no specific context documents were provided, I'm using my general internal model (Phi-3.1 Mini) to suggest that you continue exploring these connections in Graph View.`;

        const citations = contextNotes.map(n => ({
            document_id: n.id,
            document_title: n.title,
            relevant_excerpt: n.content.substring(0, 100) + "...",
            confidence_score: 0.95,
            relevance_type: 'Background' as const
        }));

        return {
            answer,
            citations,
            confidence_score: 0.89,
            model_used: 'Phi-3.1-Mini (Mock)',
            processing_time: 1540,
            token_usage: {
                prompt_tokens: this.estimateTokens(request.query),
                completion_tokens: this.estimateTokens(answer),
                total_tokens: this.estimateTokens(request.query + answer)
            }
        };
    }

    async *generateStream(request: AIRequest): AsyncIterable<string> {
        const response = await this.generate(request);
        const words = response.answer.split(' ');
        for (let i = 0; i < words.length; i++) {
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async registerProvider(_id: string, _config: AIProviderConfig): Promise<void> { }

    async unregisterProvider(_id: string): Promise<void> { }

    async getAvailableModels(): Promise<AIModel[]> {
        return [
            { 
                id: 'phi-3.1-mini', 
                name: 'Phi-3.1 Mini', 
                description: 'Small, powerful local model for general reasoning', 
                context_length: 128000,
                model_type: 'TextGeneration',
                capabilities: ['ChatCompletion', 'TextCompletion'],
                size_mb: 2000,
                requires_gpu: false
            },
            { 
                id: 'codellama-7b', 
                name: 'CodeLlama 7B', 
                description: 'Optimized for local coding assistance', 
                context_length: 16000,
                model_type: 'CodeGeneration',
                capabilities: ['ChatCompletion', 'TextCompletion'],
                size_mb: 4000,
                requires_gpu: true
            },
            { 
                id: 'whisper-small', 
                name: 'Whisper Small', 
                description: 'High-speed audio transcription', 
                context_length: 0,
                model_type: 'AudioTranscription',
                capabilities: [],
                size_mb: 150,
                requires_gpu: false
            }
        ];
    }

    async createConversation(title: string): Promise<AIConversation> {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        return {
            id,
            title,
            created_at: now,
            message_count: 0,
            last_activity: now
        };
    }

    async addMessage(
        conversationId: string, 
        role: string, 
        content: string, 
        citations?: string
    ): Promise<AIMessage> {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        return {
            id,
            conversation_id: conversationId,
            role,
            content,
            citations,
            created_at: now,
            model_used: 'local-mock',
            token_usage: {
                prompt_tokens: this.estimateTokens(content),
                completion_tokens: 0,
                total_tokens: this.estimateTokens(content)
            }
        };
    }

    async getConversationHistory(conversationId: string): Promise<AIMessage[]> {
        // Mock implementation - in real app would fetch from backend
        return [];
    }

    async listConversations(): Promise<AIConversation[]> {
        // Mock implementation
        return [];
    }

    async searchRelatedDocuments(query: string, limit?: number): Promise<string[]> {
        const notes = this.getNotes();
        return notes
            .filter(n => 
                n.title.toLowerCase().includes(query.toLowerCase()) ||
                n.content.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit || 5)
            .map(n => `Title: ${n.title}\nContent: ${n.content.substring(0, 200)}...`);
    }

    async generateSummary(documentIds: string[]): Promise<string> {
        const notes = this.getNotes();
        const selectedNotes = notes.filter(n => documentIds.includes(n.id));
        
        if (selectedNotes.length === 0) return 'No documents found for summarization.';
        
        return `Summary of ${selectedNotes.length} documents:\n\n` +
            selectedNotes.map(n => `- ${n.title}: ${n.content.substring(0, 100)}...`).join('\n');
    }

    async generateStudyGuide(topic: string, documentIds: string[]): Promise<string> {
        const notes = this.getNotes();
        const selectedNotes = notes.filter(n => documentIds.includes(n.id));
        
        return `Study Guide: ${topic}\n\n` +
            `Based on ${selectedNotes.length} documents:\n\n` +
            `1. Key Concepts:\n   - Main topic understanding\n   - Important themes\n   - Critical analysis\n\n` +
            `2. Study Questions:\n   - What are the main arguments?\n   - How do these concepts relate?\n   - What are the practical applications?\n\n` +
            `3. Further Reading:\n   ${selectedNotes.map(n => n.title).join('\n   ')}`;
    }

    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

// Re-export Note interface used in LocalAIService
interface Note {
    id: string;
    title: string;
    content: string;
    tags?: string[];
}