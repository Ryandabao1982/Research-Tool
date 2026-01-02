import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import type { Note } from '../types';

interface NotesState {
  notes: Note[];
  recentNotes: Note[];
  isLoading: boolean;
  selectedNoteId: string | null;
  
  // Actions
  loadNotes: () => Promise<void>;
  loadRecentNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  setSelectedNoteId: (id: string | null) => void;
  setNotes: (notes: Note[]) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  recentNotes: [],
  isLoading: false,
  selectedNoteId: null,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await invoke<Note[]>('get_notes');
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  loadRecentNotes: async () => {
    try {
      const recentNotes = await invoke<Note[]>('get_recent_notes');
      set({ recentNotes });
    } catch (error) {
      console.error('Failed to load recent notes:', error);
    }
  },

  addNote: async (title, content) => {
    const id = await invoke<string>('create_note', { title, content });
    const newNote: Note = {
      id,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      notes: [newNote, ...state.notes],
      recentNotes: [newNote, ...state.recentNotes].slice(0, 10),
    }));
    return newNote;
  },

  updateNote: async (id, updates) => {
    await invoke('update_note', { id, ...updates });
    const note = get().notes.find((n) => n.id === id);
    if (!note) throw new Error('Note not found');
    
    const updatedNote = { ...note, ...updates, updatedAt: new Date() };
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
      recentNotes: state.recentNotes.map((n) => (n.id === id ? updatedNote : n)),
    }));
    return updatedNote;
  },

  deleteNote: async (id) => {
    await invoke('delete_note', { id });
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      recentNotes: state.recentNotes.filter((n) => n.id !== id),
    }));
  },

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  
  setNotes: (notes) => set({ notes }),
}));
