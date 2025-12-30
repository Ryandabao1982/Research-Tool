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
            className="text-center py-20 col-span-full bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]"
          >
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No notes found</p>
            <p className="text-gray-600 text-sm mt-2">Your knowledge base is waiting to be filled.</p>
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
                  "relative p-6 rounded-[2.5rem] cursor-pointer transition-all duration-300 group overflow-hidden border shadow-2xl",
                  isSelected 
                    ? "bg-white/[0.08] border-brand-blue/50 shadow-brand-blue/10" 
                    : "bg-[#1a1a1a] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
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
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/30" 
                        : "bg-white/5 border-white/10 group-hover:border-white/20"
                    )}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                )}

                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shadow-glow-blue" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                         {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                    <h3 className="font-black text-xl text-white tracking-tight group-hover:text-brand-blue transition-colors truncate">
                      {note.title || 'Untitled'}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 font-medium">
                    {note.content || 'No content provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex -space-x-1">
                       <div className="w-5 h-5 rounded-full border-2 border-[#1a1a1a] bg-gradient-brand" />
                       <div className="w-5 h-5 rounded-full border-2 border-[#1a1a1a] bg-white/5 flex items-center justify-center text-[8px] font-black text-white">+1</div>
                    </div>
                  </div>
                </div>

                {/* Subtle gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-light/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

