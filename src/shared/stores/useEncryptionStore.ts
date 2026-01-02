import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/tauri';

interface EncryptionState {
  // State
  encryptionEnabled: boolean;
  passphraseSet: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEncryptionEnabled: (enabled: boolean) => Promise<void>;
  setPassphrase: (passphrase: string) => Promise<{ success: boolean; error?: string }>;
  verifyPassphrase: (passphrase: string) => Promise<boolean>;
  clearPassphrase: () => Promise<void>;
  checkEncryptionStatus: () => Promise<void>;
  
  // Migration
  migrateToEncrypted: () => Promise<{ success: boolean; migrated?: number; error?: string }>;
  migrateToPlaintext: () => Promise<{ success: boolean; migrated?: number; error?: string }>;
  
  // Getters
  getEncryptionStatus: () => {
    enabled: boolean;
    passphraseSet: boolean;
    ready: boolean;
  };
}

/**
 * Encryption Store for Security Settings
 * 
 * # Features
 * - Manages encryption state across the application
 * - Handles passphrase setting and verification
 * - Provides transparent encryption/decryption for notes
 * - Supports migration between encrypted and plaintext modes
 * 
 * # Security
 * - Passphrase is never stored in this store (only in Rust backend)
 * - State is persisted to localStorage (excluding sensitive data)
 * - All operations communicate with Rust backend for actual encryption
 */
export const useEncryptionStore = create<EncryptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      encryptionEnabled: false,
      passphraseSet: false,
      isLoading: false,
      error: null,

      // Enable/disable encryption
      setEncryptionEnabled: async (enabled: boolean) => {
        set({ isLoading: true, error: null });
        
        try {
          // Update backend setting
          await invoke('set_encryption_settings', { enabled });
          
          set({ 
            encryptionEnabled: enabled,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          throw error;
        }
      },

      // Set passphrase (enables encryption)
      setPassphrase: async (passphrase: string) => {
        if (!passphrase || passphrase.length < 8) {
          return { 
            success: false, 
            error: 'Passphrase must be at least 8 characters' 
          };
        }

        set({ isLoading: true, error: null });
        
        try {
          // Set passphrase in backend (this enables encryption)
          await invoke('set_passphrase', { passphrase });
          
          // Enable encryption in settings
          await invoke('set_encryption_settings', { enabled: true });
          
          set({ 
            encryptionEnabled: true,
            passphraseSet: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          return { 
            success: false, 
            error: String(error) 
          };
        }
      },

      // Verify passphrase
      verifyPassphrase: async (passphrase: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const isValid = await invoke<boolean>('verify_passphrase', { passphrase });
          
          set({ isLoading: false });
          return isValid;
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          return false;
        }
      },

      // Clear passphrase (disables encryption)
      clearPassphrase: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await invoke('clear_passphrase');
          await invoke('set_encryption_settings', { enabled: false });
          
          set({ 
            encryptionEnabled: false,
            passphraseSet: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          throw error;
        }
      },

      // Check current encryption status
      checkEncryptionStatus: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const [enabled, passphraseSet] = await Promise.all([
            invoke<boolean>('is_encryption_enabled'),
            invoke<boolean>('get_encryption_settings'),
          ]);
          
          set({ 
            encryptionEnabled: enabled,
            passphraseSet: passphraseSet,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
        }
      },

      // Migrate all notes to encrypted format
      migrateToEncrypted: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const migrated = await invoke<number>('migrate_to_encrypted');
          
          set({ isLoading: false });
          return { success: true, migrated };
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          return { 
            success: false, 
            error: String(error) 
          };
        }
      },

      // Migrate all notes to plaintext format
      migrateToPlaintext: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const migrated = await invoke<number>('migrate_to_plaintext');
          
          set({ isLoading: false });
          return { success: true, migrated };
        } catch (error) {
          set({ 
            error: String(error),
            isLoading: false 
          });
          return { 
            success: false, 
            error: String(error) 
          };
        }
      },

      // Getters
      getEncryptionStatus: () => {
        const state = get();
        return {
          enabled: state.encryptionEnabled,
          passphraseSet: state.passphraseSet,
          ready: state.encryptionEnabled && state.passphraseSet,
        };
      },
    }),
    {
      name: 'kb-encryption-storage',
      partialize: (state) => ({
        // Only persist non-sensitive state
        encryptionEnabled: state.encryptionEnabled,
        passphraseSet: state.passphraseSet,
      }),
    }
  )
);
