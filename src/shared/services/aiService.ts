import { invoke } from '@tauri-apps/api/tauri';

export const aiService = {
  synthesizeNotes: async (noteIds: string[], promptType: string): Promise<string> => {
    return invoke('synthesize_notes', {
      noteIds,
      promptType,
    });
  },
};
