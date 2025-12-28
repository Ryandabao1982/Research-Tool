import { invoke } from '@tauri-apps/api/tauri';
import {
    SearchResult,
    SearchService,
    SearchOptions,
    SearchFilters,
    Note
} from '../types';

export class TauriSearchService implements SearchService {
    async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
        return await invoke<SearchResult[]>('search_notes', { query, options });
    }

    async getSuggestions(query: string): Promise<string[]> {
        return await invoke<string[]>('get_search_suggestions', { query });
    }

    async advancedSearch(filters: SearchFilters): Promise<Note[]> {
        return await invoke<Note[]>('advanced_search', { filters });
    }
}

export class LocalSearchService implements SearchService {
    private getNotes(): Note[] {
        const data = localStorage.getItem('kb_pro_notes');
        return data ? JSON.parse(data) : [];
    }

    async search(query: string, _options?: SearchOptions): Promise<SearchResult[]> {
        const notes = this.getNotes();
        const q = query.toLowerCase();

        return notes
            .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
            .map(n => ({
                note_id: n.id,
                title: n.title,
                content_snippet: n.content.substring(0, 150) + '...',
                relevance_score: n.title.toLowerCase().includes(q) ? 1 : 0.5,
                matches: [],
                created_at: n.created_at,
                updated_at: n.updated_at
            }));
    }

    async getSuggestions(query: string): Promise<string[]> {
        const notes = this.getNotes();
        const q = query.toLowerCase();
        return notes
            .filter(n => n.title.toLowerCase().startsWith(q))
            .map(n => n.title)
            .slice(0, 5);
    }

    async advancedSearch(filters: SearchFilters): Promise<Note[]> {
        let notes = this.getNotes();
        if (filters.title) {
            notes = notes.filter(n => n.title.toLowerCase().includes(filters.title!.toLowerCase()));
        }
        if (filters.tags?.length) {
            notes = notes.filter(n => filters.tags!.every(t => n.tags.includes(t)));
        }
        return notes;
    }
}
