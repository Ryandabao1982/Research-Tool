import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../layout';
import type { Note } from '../../shared/types';
import { NoteForm } from '../../shared/components/NoteForm';
import { NoteList } from '../../features/notes/components/NoteList';
import { useSelectionStore } from '../../shared/hooks/useSelectionStore';
import { SynthesisPanel } from '../../features/ai/components/SynthesisPanel';
import { aiService } from '../../shared/services/aiService';
import { useNotesStore } from '../../shared/hooks/useNotesStore';
import { AnimatePresence, motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/tauri';
import ContextualSidebar from '../../features/retrieval/components/ContextualSidebar';
import { useTypingPause } from '../../shared/hooks/useTypingPause';

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

  // Contextual Sidebar state
  const [relatedNotes, setRelatedNotes] = useState<any[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');
  const [isTyping, setIsTyping] = useState(false);

  // Typing pause hook for sidebar updates - detects actual keyboard typing
  const triggerRelatedSearch = useTypingPause(async () => {
    setIsTyping(false);
    if (selectedNote) {
      setIsRelatedLoading(true);
      try {
        const notes = await invoke('get_related_notes', {
          noteContent: selectedNote.content,
          limit: 10,
          currentNoteId: selectedNote.id, // Exclude current note
        }) as any[];
        setRelatedNotes(notes || []);
      } catch (error) {
        console.error('Failed to fetch related notes:', error);
        setRelatedNotes([]);
      } finally {
        setIsRelatedLoading(false);
      }
    }
  }, 2000);

  // Track typing state via keyboard events on NoteForm
  const handleTypingChange = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
    }
    triggerRelatedSearch();
  }, [isTyping, triggerRelatedSearch]);

  // Trigger related search only when user stops typing (2-second pause detected)
  useEffect(() => {
    // Only trigger if typing has paused (isTyping becomes false after debounce)
    if (!isTyping && selectedNote?.content) {
      triggerRelatedSearch();
    }
  }, [isTyping, selectedNote?.content, triggerRelatedSearch]);

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
    setViewMode('single'); // Reset to single view when canceling
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

  const handleRelatedNoteClick = (noteId: string) => {
    if (viewMode === 'single') {
      // Transition to split view with clicked note on right
      setSelectedNoteId(noteId);
      setViewMode('split');
    } else {
      // Replace right panel with clicked note
      setSelectedNoteId(noteId);
    }
  };

  return (
    <Layout>
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
            className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Ambient Background - Neural Aura */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/10 blur-[100px] rounded-full mix-blend-screen opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen opacity-30" />
      </div>

      <div className="space-y-8 px-8 pt-8 pb-12 relative z-10 overflow-y-auto custom-scrollbar h-full">
        {/* Main content area - adjusts based on view mode */}
        <div className={`flex h-full ${viewMode === 'split' ? 'gap-0' : 'block'}`}>
          {/* Left side - Editor or NoteList */}
          <div className={`${viewMode === 'split' ? 'w-[60%]' : 'w-full'}`}>
            <NoteList notes={notes} onNoteClick={handleEditNote} />
          </div>

          {/* Right side - ContextualSidebar or selected note */}
          {viewMode === 'split' && selectedNoteId && (
            <div className="w-[40%] h-full border-l border-white/10">
              <div className="p-4">
                <NoteForm
                  note={notes.find(n => n.id === selectedNoteId) || undefined}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                  onContentChange={handleTypingChange}
                />
              </div>
            </div>
          )}

          {viewMode === 'single' && selectedNoteId && (
            <div className="absolute right-4 top-4 w-[40%] z-20">
              <ContextualSidebar
                relatedNotes={relatedNotes}
                isLoading={isRelatedLoading}
                onNoteClick={handleRelatedNoteClick}
              />
            </div>
          )}
        </div>

        {/* Editor Overlay or Inline */}
        {viewMode === 'single' && (
          <AnimatePresence>
            {(selectedNoteId) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <NoteForm
                  note={notes.find(n => n.id === selectedNoteId) || undefined}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                  onContentChange={handleTypingChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <SynthesisPanel onSynthesize={handleSynthesize} onSave={handleSaveSynthesis} />
      </div>
    </Layout>
  );
}
