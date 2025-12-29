import { invoke } from '@tauri-apps/api/tauri';
import {
    AIRequest,
    AIResponse,
    AIService,
    AIProviderConfig,
    AIModel,
    Note
} from '../types';

/**
 * Implementation of the AIService for KnowledgeBase Pro.
 * Orchestrates local-first LLM interactions.
 */
 export class TauriAIService implements AIService {
    async generate(request: AIRequest): Promise<AIResponse> {
        return await invoke<AIResponse>('generate_ai_response', { request });
    }

    async registerProvider(id: string, config: AIProviderConfig): Promise<void> {
        await invoke('ai_register_provider', { id, config });
    }

    async unregisterProvider(id: string): Promise<void> {
        await invoke('ai_unregister_provider', { id });
    }

    async getAvailableModels(): Promise<AIModel[]> {
        return await invoke<AIModel[]>('ai_list_models');
    }

    async createConversation(title: string) {
        return await invoke('create_ai_conversation', { title });
    }

    async addMessage(conversation_id: string, role: string, content: string, citations?: string) {
        return await invoke('add_ai_message', { conversation_id, role, content, citations });
    }

    async getConversationHistory(conversation_id: string) {
        return await invoke('get_ai_conversation_history', { conversation_id });
    }

    async listConversations() {
        return await invoke('list_ai_conversations');
    }
}

/**
 * Local fallback service for mock AI responses.
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
        const contextNotes = notes.filter(n => request.context_documents.includes(n.id));

        // Simple mock logic for "source-grounding"
        const answer = contextNotes.length > 0
            ? `Based on your research in "${contextNotes.map(n => n.title).join(', ')}", here is a summary. ${request.query} is strongly related to the themes of ${contextNotes[0].tags?.[0] || 'core research'}.`
            : `I've analyzed your request: "${request.query}". Since no specific context documents were provided, I'm using my general internal model (Phi-3.1 Mini) to suggest that you continue exploring these connections in the Graph View.`;

        const citations = contextNotes.map(n => ({
            document_id: n.id,
            document_title: n.title,
            relevant_excerpt: n.content.substring(0, 100) + "...",
            confidence_score: 0.95
        }));

        return {
            answer,
            citations,
            confidence_score: 0.89,
            model_used: 'Phi-3.1-Mini (Mock)',
            processing_time: 1540
        };
    }

    async registerProvider(_id: string, _config: AIProviderConfig): Promise<void> { }

    async unregisterProvider(_id: string): Promise<void> { }

    async getAvailableModels(): Promise<AIModel[]> {
        return [
            { id: 'phi-3.1-mini', name: 'Phi-3.1 Mini', description: 'Small, powerful local model for general reasoning', context_length: 128000 },
            { id: 'codellama-7b', name: 'CodeLlama 7B', description: 'Optimized for local coding assistance', context_length: 16000 },
            { id: 'whisper-small', name: 'Whisper Small', description: 'High-speed audio transcription', context_length: 0 }
        ];
    }
}
