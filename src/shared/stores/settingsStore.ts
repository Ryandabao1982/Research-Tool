import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Accessibility preferences
  highContrastMode: boolean;
  reducedMotion: boolean;
  
  // Actions
  setHighContrastMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  
  // Getters
  getAccessibilitySettings: () => {
    highContrastMode: boolean;
    reducedMotion: boolean;
  };
}

/**
 * Settings Store for User Preferences
 * 
 * # Accessibility Features
 * - High Contrast Mode: WCAG AAA compliant (7:1 contrast ratio)
 * - Reduced Motion: Disables decorative animations
 * 
 * # Persistence
 * Settings are persisted to localStorage via zustand/persist
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default settings
      highContrastMode: false,
      reducedMotion: false,

      // Actions
      setHighContrastMode: (enabled) => {
        set({ highContrastMode: enabled });
        // Update document class for CSS to react
        if (enabled) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }
      },

      setReducedMotion: (enabled) => {
        set({ reducedMotion: enabled });
        // Update document class for CSS to react
        if (enabled) {
          document.body.classList.add('reduced-motion');
        } else {
          document.body.classList.remove('reduced-motion');
        }
      },

      // Getters
      getAccessibilitySettings: () => {
        const state = get();
        return {
          highContrastMode: state.highContrastMode,
          reducedMotion: state.reducedMotion,
        };
      },
    }),
    {
      name: 'kb-settings-storage', // Storage key
      partialize: (state) => ({
        highContrastMode: state.highContrastMode,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
);
