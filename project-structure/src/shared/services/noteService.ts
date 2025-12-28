import { invoke } from '@tauri-apps/api/tauri';
import {
    Note,
    NoteService,
    CreateNoteRequest,
    UpdateNoteRequest,
    NoteFilters
} from '../types';

/**
 * Implementation of the NoteService that communicates with the Rust backend via Tauri IPC.
 * While Rust is being set up, this service can be used for scaffolding.
 */
export class TauriNoteService implements NoteService {
    async createNote(request: CreateNoteRequest): Promise<Note> {
        try {
            return await invoke<Note>('create_note', { ...request });
        } catch (error) {
            console.error('Failed to create note:', error);
            throw error;
        }
    }

    async updateNote(id: string, updates: UpdateNoteRequest): Promise<Note> {
        try {
            return await invoke<Note>('update_note', { id, ...updates });
        } catch (error) {
            console.error(`Failed to update note ${id}:`, error);
            throw error;
        }
    }

    async deleteNote(id: string): Promise<void> {
        try {
            await invoke('delete_note', { id });
        } catch (error) {
            console.error(`Failed to delete note ${id}:`, error);
            throw error;
        }
    }

    async getNote(id: string): Promise<Note | null> {
        try {
            return await invoke<Note | null>('get_note', { id });
        } catch (error) {
            console.error(`Failed to get note ${id}:`, error);
            throw error;
        }
    }

    async listNotes(filters?: NoteFilters): Promise<Note[]> {
        try {
            return await invoke<Note[]>('list_notes', { ...filters });
        } catch (error) {
            console.error('Failed to list notes:', error);
            throw error;
        }
    }
}

/**
 * Local fallback service for web-only development or until Rust backend is ready.
 * Stores notes in localStorage.
 */
export class LocalNoteService implements NoteService {
    private getStorage(): Note[] {
        const data = localStorage.getItem('kb_pro_notes');
        return data ? JSON.parse(data) : [];
    }

    private setStorage(notes: Note[]) {
        localStorage.setItem('kb_pro_notes', JSON.stringify(notes));
    }

    async createNote(request: CreateNoteRequest): Promise<Note> {
        const notes = this.getStorage();
        const newNote: Note = {
            id: crypto.randomUUID(),
            ...request,
            properties: request.properties || {},
            tags: request.tags || [],
            is_daily_note: false,
            word_count: request.content.split(/\s+/).length,
            reading_time: Math.ceil(request.content.split(/\s+/).length / 200),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        notes.push(newNote);
        this.setStorage(notes);
        return newNote;
    }

    async updateNote(id: string, updates: UpdateNoteRequest): Promise<Note> {
        const notes = this.getStorage();
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) throw new Error('Note not found');

        const updatedNote = {
            ...notes[index],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        notes[index] = updatedNote;
        this.setStorage(notes);
        return updatedNote;
    }

    async deleteNote(id: string): Promise<void> {
        const notes = this.getStorage();
        this.setStorage(notes.filter(n => n.id !== id));
    }

    async getNote(id: string): Promise<Note | null> {
        return this.getStorage().find(n => n.id === id) || null;
    }

    async listNotes(filters?: NoteFilters): Promise<Note[]> {
        let notes = this.getStorage();
        if (filters?.folder_id) {
            notes = notes.filter(n => n.folder_id === filters.folder_id);
        }
        if (filters?.tags?.length) {
            notes = notes.filter(n => filters.tags!.every(t => n.tags.includes(t)));
        }
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            notes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
        }
        return notes.slice(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 100));
    }
}
