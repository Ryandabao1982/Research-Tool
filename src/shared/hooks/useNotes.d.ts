import type { Note } from '../types';
export declare function useNotes(): {
    notes: Note[];
    isLoading: boolean;
    createNote: (title: string, content: string) => Promise<Note>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
};
//# sourceMappingURL=useNotes.d.ts.map