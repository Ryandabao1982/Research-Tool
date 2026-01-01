import { useCallback } from 'react';
import { useNotesStore } from './useNotesStore';

export function useWikiNavigation() {
  const { notes, setSelectedNoteId, addNote } = useNotesStore();

  const handleWikiLinkClick = useCallback(async (title: string) => {
    const targetNote = notes.find(n => n.title.toLowerCase() === title.toLowerCase());

    if (targetNote) {
      setSelectedNoteId(targetNote.id);
    } else {
      // TODO: Implement a proper "Functional Precision" modal for creation
      // For now, avoid window.confirm as it violates UX principles
      console.warn(`Note "${title}" not found. Creation prompt suppressed in prototype.`);
      // Optional: Trigger a toast or silent creation if desired
    }
  }, [notes, setSelectedNoteId, addNote]);

  return { handleWikiLinkClick };
}
