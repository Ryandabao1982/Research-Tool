import { useState } from 'react';
import type { Note } from '../types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createNote = async (title: string, content: string): Promise<Note> => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<Note> => {
    setNotes(prev => 
      prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() } 
          : note
      )
    );
    const updatedNote = notes.find(n => n.id === id);
    if (!updatedNote) throw new Error('Note not found');
    return { ...updatedNote, ...updates, updatedAt: new Date() };
  };

  const deleteNote = async (id: string): Promise<void> => {
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