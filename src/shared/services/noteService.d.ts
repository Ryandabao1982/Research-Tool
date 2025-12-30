interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
interface NoteService {
    createNote: (note: Omit<Note, 'id'>) => Promise<Note>;
    getNote: (id: string) => Promise<Note | null>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
}
export declare class DefaultNoteService implements NoteService {
    private notes;
    createNote(note: Omit<Note, 'id'>): Promise<Note>;
    getNote(id: string): Promise<Note | null>;
    updateNote(id: string, updates: Partial<Note>): Promise<Note>;
    deleteNote(id: string): Promise<void>;
    getAllNotes(): Note[];
}
export {};
//# sourceMappingURL=noteService.d.ts.map