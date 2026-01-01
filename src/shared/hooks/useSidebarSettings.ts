/**
 * Hook for managing contextual sidebar settings
 */

import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface SidebarSettings {
  relatedNotePreference: 'side-by-side' | 'replace';
}

export function useSidebarSettings() {
  const [settings, setSettings] = useState<SidebarSettings>({
    relatedNotePreference: 'side-by-side',
  });

  const getPreference = useCallback(async (noteId: string) => {
    try {
      const metadata = await invoke('get_metadata', { noteId }) as any;
      if (metadata?.related_note_preference) {
        setSettings(prev => ({
          ...prev,
          relatedNotePreference: metadata.related_note_preference,
        }));
      }
    } catch (error) {
      console.error('Failed to get metadata:', error);
    }
  }, []);

  const setPreference = useCallback(async (
    noteId: string,
    preference: 'side-by-side' | 'replace'
  ) => {
    try {
      await invoke('set_metadata', {
        noteId,
        metadata: {
          related_note_preference: preference,
        },
      });
      setSettings(prev => ({
        ...prev,
        relatedNotePreference: preference,
      }));
    } catch (error) {
      console.error('Failed to set metadata:', error);
    }
  }, []);

  return {
    settings,
    getPreference,
    setPreference,
  };
}
