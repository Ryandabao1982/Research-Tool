/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { aiService } from './aiService';

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/tauri';

describe('aiService', () => {
  it('should call synthesize_notes command with correct arguments', async () => {
    const noteIds = ['1', '2'];
    const promptType = 'summary';
    
    // Mock successful response
    (invoke as any).mockResolvedValue('Synthesized text');
    
    const result = await aiService.synthesizeNotes(noteIds, promptType);
    
    expect(invoke).toHaveBeenCalledWith('synthesize_notes', {
      noteIds,
      promptType,
    });
    expect(result).toBe('Synthesized text');
  });
});
