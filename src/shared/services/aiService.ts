import { invoke } from '@tauri-apps/api/tauri';

export interface ModelStatus {
  downloaded: boolean;
  model_path: string;
  model_size: number;
}

export const aiService = {
  synthesizeNotes: async (noteIds: string[], promptType: string): Promise<string> => {
    return invoke('synthesize_notes', {
      noteIds,
      promptType,
    });
  },
  synthesizeQuery: async (query: string): Promise<string> => {
     return invoke('synthesize_query', { query });
  },
  getModelStatus: async (): Promise<ModelStatus> => {
    return invoke('get_model_status');
  },
  deleteModel: async (): Promise<void> => {
    return invoke('delete_model');
  }
};
