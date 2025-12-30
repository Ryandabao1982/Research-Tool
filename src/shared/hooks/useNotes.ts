import React, { useState, useEffect } from 'react';
import { DefaultNoteService } from '../services/noteService';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const noteService = new DefaultNoteService();
    
    const loadNotes = async () => {
      try {
        const allNotes = await noteService.getAllNotes();
        setNotes(allNotes);
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const createNote = async (title: string, content: string) => {
    const noteService = new DefaultNoteService();
    try {
      const newNote = await noteService.createNote({ title, content });
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const noteService = new DefaultNoteService();
    try {
      const updatedNote = await noteService.updateNote(id, updates);
      setNotes(prev => 
        prev.map(note => note.id === id ? updatedNote : note)
      );
      return updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    const noteService = new DefaultNoteService();
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
  };
}