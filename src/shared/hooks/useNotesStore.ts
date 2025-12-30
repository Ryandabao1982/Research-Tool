import { create } from 'zustand';
import type { Note } from '../types';

interface NotesStore {
  notes: Note[];
  isLoading: boolean;
  addNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  setNotes: (notes: Note[]) => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  addNote: async (title, content) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    return newNote;
  },
  updateNote: async (id, updates) => {
    set((state) => ({
      notes: state.notes.map((n) => 
        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
      ),
    }));
    const note = get().notes.find((n) => n.id === id);
    if (!note) throw new Error('Note not found');
    return note;
  },
  deleteNote: async (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
  },
  setNotes: (notes) => set({ notes }),
}));
