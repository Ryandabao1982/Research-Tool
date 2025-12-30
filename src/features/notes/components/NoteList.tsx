import React from 'react';
import type { Note } from '../../../shared/types';
import { useSelectionStore } from '../../../shared/hooks/useSelectionStore';

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

export function NoteList({ notes, onNoteClick }: NoteListProps) {
  const { isSelectionMode, selectedNoteIds, toggleNoteSelection } = useSelectionStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.length === 0 ? (
        <div className="text-center py-12 col-span-full">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      ) : (
        notes.map((note) => {
          const isSelected = selectedNoteIds.includes(note.id);
          
          return (
            <div 
              key={note.id}
              className={`relative border p-4 rounded-lg bg-white shadow cursor-pointer hover:shadow-lg transition-all 
                ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-200'}`}
              onClick={() => {
                if (isSelectionMode) {
                  toggleNoteSelection(note.id);
                } else {
                  onNoteClick(note);
                }
              }}
            >
              {isSelectionMode && (
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleNoteSelection(note.id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 truncate">{note.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                <div className="flex justify-between items-center mt-auto">
                  <p className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
