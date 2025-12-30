import { useState } from 'react';
export function useNotes() {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const createNote = async (title, content) => {
        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setNotes(prev => [...prev, newNote]);
        return newNote;
    };
    const updateNote = async (id, updates) => {
        setNotes(prev => prev.map(note => note.id === id
            ? { ...note, ...updates, updatedAt: new Date() }
            : note));
        const updatedNote = notes.find(n => n.id === id);
        if (!updatedNote)
            throw new Error('Note not found');
        return { ...updatedNote, ...updates, updatedAt: new Date() };
    };
    const deleteNote = async (id) => {
        setNotes(prev => prev.filter(note => note.id !== id));
    };
    return {
        notes,
        isLoading,
        createNote,
        updateNote,
        deleteNote,
    };
}
//# sourceMappingURL=useNotes.js.map