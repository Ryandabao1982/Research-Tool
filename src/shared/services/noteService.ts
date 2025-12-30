import React from 'react';

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

export class DefaultNoteService implements NoteService {
  private notes: Note[] = [];

  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.push(newNote);
    return newNote;
  }

  async getNote(id: string): Promise<Note | null> {
    return this.notes.find(note => note.id === id) || null;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
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

  async deleteNote(id: string): Promise<void> {
    this.notes = this.notes.filter(note => note.id !== id);
  }

  getAllNotes(): Note[] {
    return this.notes;
  }
}