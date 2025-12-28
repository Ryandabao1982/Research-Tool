import { invoke } from '@tauri-apps/api/tauri';
import {
    Note,
    NoteService,
    CreateNoteRequest,
    UpdateNoteRequest,
    NoteFilters,
    Folder,
    Tag
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
            console.error(`Failed to update note ${id}: `, error);
            throw error;
        }
    }

    async deleteNote(id: string): Promise<void> {
        try {
            await invoke('delete_note', { id });
        } catch (error) {
            console.error(`Failed to delete note ${id}: `, error);
            throw error;
        }
    }

    async getNote(id: string): Promise<Note | null> {
        try {
            return await invoke<Note | null>('get_note', { id });
        } catch (error) {
            console.error(`Failed to get note ${id}: `, error);
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
        if (!data) {
            const seedData: Note[] = [
                {
                    id: '1',
                    title: 'Welcome to KnowledgeBase Pro',
                    content: 'This is your first note. KB Pro is designed for high-performance research and long-term knowledge retention. Try creating a new note using the (+) button above!',
                    tags: ['tutorial', 'welcome'],
                    is_daily_note: false,
                    properties: {},
                    word_count: 25,
                    reading_time: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Building a Second Brain',
                    content: 'The core philosophy of this tool: Capture everything, organize by utility, distill the essence, and express your findings. Bidirectional linking is key.',
                    tags: ['philosophy', 'productivity'],
                    is_daily_note: false,
                    properties: {},
                    word_count: 32,
                    reading_time: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ];
            localStorage.setItem('kb_pro_notes', JSON.stringify(seedData));
            return seedData;
        }
        return JSON.parse(data);
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

    // --- Folder Management ---

    private getFolders(): Folder[] {
        const data = localStorage.getItem('kb_pro_folders');
        if (!data) {
            const seed: Folder[] = [
                { id: 'f1', name: 'Research', created_at: new Date().toISOString() },
                { id: 'f2', name: 'Personal', created_at: new Date().toISOString() },
                { id: 'f3', name: 'Drafts', parent_id: 'f1', created_at: new Date().toISOString() },
            ];
            localStorage.setItem('kb_pro_folders', JSON.stringify(seed));
            return seed;
        }
        return JSON.parse(data);
    }

    async listFolders(): Promise<Folder[]> {
        return this.getFolders();
    }

    async createFolder(name: string, parent_id?: string): Promise<Folder> {
        const folders = this.getFolders();
        const newFolder: Folder = {
            id: crypto.randomUUID(),
            name,
            parent_id,
            created_at: new Date().toISOString(),
        };
        folders.push(newFolder);
        localStorage.setItem('kb_pro_folders', JSON.stringify(folders));
        return newFolder;
    }

    // --- Tag Management ---

    private getTags(): Tag[] {
        const data = localStorage.getItem('kb_pro_tags');
        if (!data) {
            const seed: Tag[] = [
                { id: 't1', name: 'research', color: '#a855f7', created_at: new Date().toISOString() },
                { id: 't2', name: 'productivity', color: '#3b82f6', created_at: new Date().toISOString() },
                { id: 't3', name: 'tutorial', color: '#10b981', created_at: new Date().toISOString() },
            ];
            localStorage.setItem('kb_pro_tags', JSON.stringify(seed));
            return seed;
        }
        return JSON.parse(data);
    }

    async listTags(): Promise<Tag[]> {
        return this.getTags();
    }
}
```
