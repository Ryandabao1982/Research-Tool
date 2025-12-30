import { create } from 'zustand';

interface SelectionStore {
  selectedNoteIds: string[];
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  toggleNoteSelection: (noteId: string) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedNoteIds: [],
  isSelectionMode: false,
  toggleSelectionMode: () =>
    set((state) => ({
      isSelectionMode: !state.isSelectionMode,
      selectedNoteIds: !state.isSelectionMode ? [] : state.selectedNoteIds,
    })),
  toggleNoteSelection: (noteId) =>
    set((state) => {
      const isSelected = state.selectedNoteIds.includes(noteId);
      const newSelectedIds = isSelected
        ? state.selectedNoteIds.filter((id) => id !== noteId)
        : [...state.selectedNoteIds, noteId];
      
      return {
        selectedNoteIds: newSelectedIds,
        // Auto-enable selection mode if not active but a note is selected
        isSelectionMode: state.isSelectionMode || newSelectedIds.length > 0
      };
    }),
  clearSelection: () => set({ selectedNoteIds: [], isSelectionMode: false }),
}));
