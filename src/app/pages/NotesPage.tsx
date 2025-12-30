import React, { useState } from 'react';
import Layout from '../layout';
import type { Note } from '../../shared/types';
import { NoteForm } from '../../shared/components/NoteForm';

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleCreateNote = (title: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const handleUpdateNote = (note: Note) => {
    const updatedNote = { ...note, updatedAt: new Date() };
    setNotes(prev => 
      prev.map(n => 
        n.id === note.id ? updatedNote : n
      )
    );
    setSelectedNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleCancelEdit = () => {
    setSelectedNote(null);
  };

  return (
    <Layout>
      <div className="space-y-4 px-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Notes</h1>
          <button 
            onClick={() => setSelectedNote({ id: '', title: '', content: '', createdAt: new Date(), updatedAt: new Date() })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            New Note
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id}
                className={`border p-4 rounded-lg bg-white shadow cursor-pointer hover:shadow-lg transition-all ${selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : 'hover:border-gray-200'}`}
                onClick={() => handleEditNote(note)}
              >
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{note.content}</p>
                  <p className="text-xs text-gray-400 mb-2">{note.createdAt.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {selectedNote && (
          <div className="mt-6">
            <NoteForm 
              note={selectedNote}
              onSave={handleUpdateNote}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}