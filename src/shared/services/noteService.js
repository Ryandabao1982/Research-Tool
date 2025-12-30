export class DefaultNoteService {
    constructor() {
        this.notes = [];
    }
    async createNote(note) {
        const newNote = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.notes.push(newNote);
        return newNote;
    }
    async getNote(id) {
        return this.notes.find(note => note.id === id) || null;
    }
    async updateNote(id, updates) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) {
            throw new Error('Note not found');
        }
        this.notes[noteIndex] = {
            ...this.notes[noteIndex],
            ...updates,
            updatedAt: new Date(),
        };
        return this.notes[noteIndex];
    }
    async deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
    }
    getAllNotes() {
        return this.notes;
    }
}
//# sourceMappingURL=noteService.js.map