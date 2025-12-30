import React, { useState } from 'react';
import Layout from '../layout';
import type { Note } from '../../shared/types';
import { NoteForm } from '../../shared/components/NoteForm';
import { NoteList } from '../../features/notes/components/NoteList';
import { useSelectionStore } from '../../shared/hooks/useSelectionStore';
import { SynthesisPanel } from '../../features/ai/components/SynthesisPanel';
import { aiService } from '../../shared/services/aiService';
import { useNotesStore } from '../../shared/hooks/useNotesStore';

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { isSelectionMode, toggleSelectionMode, selectedNoteIds } = useSelectionStore();

  const handleCreateNote = async (title: string, content: string) => {
    await addNote(title, content);
    setSelectedNote(null);
  };

  const handleUpdateNote = async (note: Note) => {
    await updateNote(note.id, note);
    setSelectedNote(null);
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
      return response;
    } catch (error) {
      console.error('Synthesis failed:', error);
    }
  };

  const handleSaveSynthesis = async (content: string) => {
    await addNote('AI Synthesis Result', content);
  };

  return (
    <Layout>
      <div className="space-y-4 px-6 pt-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Notes</h1>
            {isSelectionMode && (
              <p className="text-sm text-blue-400 font-medium">
                {selectedNoteIds.length} notes selected
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelectionMode 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
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

        <SynthesisPanel onSynthesize={handleSynthesize} onSave={handleSaveSynthesis} />
      </div>
    </Layout>
  );
}