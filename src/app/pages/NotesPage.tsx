import React, { useState, useMemo } from 'react';
import Layout from '../layout';
import type { Note } from '../../shared/types';
import { NoteForm } from '../../shared/components/NoteForm';
import { NoteList } from '../../features/notes/components/NoteList';
import { useSelectionStore } from '../../shared/hooks/useSelectionStore';
import { SynthesisPanel } from '../../features/ai/components/SynthesisPanel';
import { aiService } from '../../shared/services/aiService';
import { useNotesStore } from '../../shared/hooks/useNotesStore';
import { AnimatePresence, motion } from 'framer-motion';

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, selectedNoteId, setSelectedNoteId } = useNotesStore();
  const { isSelectionMode, toggleSelectionMode, selectedNoteIds } = useSelectionStore();

  // Determine if we are creating or editing
  const isCreating = useMemo(() => {
    return selectedNoteId && !notes.find(n => n.id === selectedNoteId);
  }, [selectedNoteId, notes]);

  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [selectedNoteId, notes]);

  const handleSaveNote = async (note: Note) => {
    if (isCreating) {
      await addNote(note.title, note.content);
    } else {
      await updateNote(note.id, note);
    }
    setSelectedNoteId(null);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleCancelEdit = () => {
    setSelectedNoteId(null);
  };

  const handleSynthesize = async () => {
    try {
      const response = await aiService.synthesizeNotes(selectedNoteIds, 'summary');
      return response;
    } catch (error) {
      console.error('Synthesis failed:', error);
      return; // Return undefined instead of null
    }
  };

  const handleSaveSynthesis = async (content: string) => {
    await addNote('AI Synthesis Result', content);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full relative">
         {/* Ambient Background - Neural Aura */}
        <div className="fixed inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/10 blur-[100px] rounded-full mix-blend-screen opacity-40" />
           <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen opacity-30" />
        </div>

        <div className="space-y-8 px-8 pt-8 pb-12 relative z-10 overflow-y-auto custom-scrollbar h-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">My Knowledge Base</h1>
              <p className="text-sm font-medium text-gray-400">
                {isSelectionMode 
                  ? `${selectedNoteIds.length} items selected for synthesis`
                  : 'Manage and organize your second brain'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleSelectionMode}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${isSelectionMode
                  ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/30 shadow-glow-blue'
                  : 'bg-surface-100/50 text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {isSelectionMode ? 'Cancel Selection' : 'Select'}
              </button>
              <button
                onClick={() => {
                  const newId = crypto.randomUUID();
                  setSelectedNoteId(newId);
                }}
                className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                + New Note
              </button>
            </div>
          </div>

          {/* Editor Overlay or Inline */}
          <AnimatePresence>
            {(selectedNoteId) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <NoteForm
                  note={selectedNote || undefined}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <NoteList notes={notes} onNoteClick={handleEditNote} />

          <SynthesisPanel onSynthesize={handleSynthesize} onSave={handleSaveSynthesis} />
        </div>
      </div>
    </Layout>
  );
}