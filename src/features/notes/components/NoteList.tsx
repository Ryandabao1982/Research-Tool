import React from 'react';
import type { Note } from '../../../shared/types';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../shared/utils';
import { Clock, CheckCircle2 } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

export function NoteList({ notes, onNoteClick }: NoteListProps) {
  const { isSelectionMode, selectedNoteIds, toggleNoteSelection } = useSelectionStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {notes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 col-span-full bg-neutral-50 border border-dashed border-neutral-200"
          >
            <p className="font-sans text-neutral-600 font-bold uppercase tracking-wider text-xs">No notes found</p>
            <p className="font-sans text-neutral-500 text-sm mt-2">Your knowledge base is waiting to be filled.</p>
          </motion.div>
        ) : (
          notes.map((note, index) => {
            const isSelected = selectedNoteIds.includes(note.id);
            
            return (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "relative p-6 border rounded-none cursor-pointer transition-all duration-500 group overflow-hidden",
                  isSelected 
                    ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(0,102,255,0.15)]" 
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                )}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleNoteSelection(note.id);
                  } else {
                    onNoteClick(note);
                  }
                }}
              >
                {/* Selection Overlay */}
                {isSelectionMode && (
                  <div className="absolute top-6 right-6 z-20">
                    <div className={cn(
                      "w-6 h-6 border-2 rounded-none flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "bg-white border-neutral-200 group-hover:border-neutral-300"
                    )}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                )}

                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-primary" />
                       <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                         {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                    <h3 className="font-sans font-black text-xl text-neutral-900 group-hover:text-primary transition-colors truncate">
                      {note.title || 'Untitled'}
                    </h3>
                  </div>

                  <p className="font-sans text-neutral-600 text-sm leading-relaxed line-clamp-3 font-medium">
                    {note.content || 'No content provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-neutral-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex -space-x-2">
                       <div className="w-5 h-5 border-2 border-white bg-primary" />
                       <div className="w-5 h-5 border-2 border-white bg-neutral-200 flex items-center justify-center font-mono text-[8px] font-bold text-neutral-900">+1</div>
                    </div>
                  </div>
                </div>

                {/* Subtle background on hover */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}