import React, { useState } from 'react';
import Layout from '../layout';
import type { Note } from '../../shared/types';
import { NoteForm } from '../../shared/components/NoteForm';
import { NoteList } from '../../features/notes/components/NoteList';
import { useSelectionStore } from '../../shared/hooks/useSelectionStore';
import { SynthesisPanel } from '../../features/ai/components/SynthesisPanel';
import { aiService } from '../../shared/services/aiService';

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { isSelectionMode, toggleSelectionMode, selectedNoteIds } = useSelectionStore();

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

  const handleSynthesize = async () => {
    try {
      const response = await aiService.synthesizeNotes(selectedNoteIds, 'summary');
      console.log('Synthesis result:', response);
      // TODO: Display result in a modal or side panel
    } catch (error) {
      console.error('Synthesis failed:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 px-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            {isSelectionMode && (
              <p className="text-sm text-blue-600 font-medium">
                {selectedNoteIds.length} notes selected
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelectionMode 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Notes'}
            </button>
            <button 
              onClick={() => setSelectedNote({ id: '', title: '', content: '', createdAt: new Date(), updatedAt: new Date() })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              New Note
            </button>
          </div>
        </div>
        
        <NoteList notes={notes} onNoteClick={handleEditNote} />
        
        {selectedNote && (
          <div className="mt-6">
            <NoteForm 
              note={selectedNote}
              onSave={handleUpdateNote}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        <SynthesisPanel onSynthesize={handleSynthesize} />
      </div>
    </Layout>
  );
}