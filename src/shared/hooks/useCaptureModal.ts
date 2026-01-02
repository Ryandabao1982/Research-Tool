import { create } from 'zustand';
import { useCallback } from 'react';
import { useGlobalKeyboard } from './useGlobalKeyboard';

interface CaptureModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCaptureModalStore = create<CaptureModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

/**
 * Hook for managing the rapid capture modal
 * 
 * # Features
 * - Registers Alt+Space global shortcut
 * - Manages modal open/close state
 * - Works in background (AC: #7)
 * 
 * # Usage
 * ```typescript
 * const { isOpen, openModal, closeModal } = useCaptureModal();
 * ```
 */
export function useCaptureModal() {
  const isOpen = useCaptureModalStore((state) => state.isOpen);
  const openModal = useCaptureModalStore((state) => state.openModal);
  const closeModal = useCaptureModalStore((state) => state.closeModal);
  
  const { registerShortcut } = useGlobalKeyboard();

  // Register Alt+Space shortcut
  const registerShortcutCallback = useCallback(() => {
    registerShortcut('Alt+Space', (e) => {
      e.preventDefault();
      openModal();
    });
  }, [registerShortcut, openModal]);

  return {
    isOpen,
    openModal,
    closeModal,
    registerShortcut: registerShortcutCallback,
  };
}
