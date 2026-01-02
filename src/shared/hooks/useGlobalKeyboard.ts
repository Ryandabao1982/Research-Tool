import { useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';

interface ShortcutHandler {
  (event: KeyboardEvent): void;
}

interface GlobalKeyboardHook {
  registerShortcut: (shortcut: string, handler: ShortcutHandler) => void;
  unregisterShortcut: (shortcut: string) => void;
  isRegistered: (shortcut: string) => boolean;
}

/**
 * Hook for registering global keyboard shortcuts in Tauri
 * 
 * # Features
 * - Works even when app is in background (AC: #7)
 * - Supports Alt+Space for rapid capture
 * - Handles both global and local keyboard events
 * 
 * # Usage
 * ```typescript
 * const { registerShortcut } = useGlobalKeyboard();
 * 
 * useEffect(() => {
 *   registerShortcut('Alt+Space', (e) => {
 *     e.preventDefault();
 *     openCaptureModal();
 *   });
 * }, []);
 * ```
 */
export function useGlobalKeyboard(): GlobalKeyboardHook {
  const registeredShortcuts = useRef<Map<string, ShortcutHandler>>(new Map());
  const isListening = useRef(false);

  // Listen for global shortcut events from backend
  useEffect(() => {
    if (isListening.current) return;
    isListening.current = true;

    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      try {
        unlisten = await listen<string>('global-shortcut-pressed', (event: { payload: string }) => {
          const handler = registeredShortcuts.current.get(event.payload);
          if (handler) {
            // Create a synthetic keyboard event
            const syntheticEvent = new KeyboardEvent('keydown', {
              key: ' ',
              code: 'Space',
              altKey: event.payload.includes('Alt'),
              ctrlKey: event.payload.includes('Ctrl'),
              shiftKey: event.payload.includes('Shift'),
              metaKey: event.payload.includes('Cmd'),
              bubbles: true,
            });
            handler(syntheticEvent);
          }
        });
      } catch (error) {
        console.error('Failed to setup global shortcut listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
      isListening.current = false;
    };
  }, []);

  /**
   * Register a global keyboard shortcut
   * 
   * @param shortcut - Shortcut string (e.g., 'Alt+Space')
   * @param handler - Callback to handle the shortcut
   */
  const registerShortcut = useCallback((shortcut: string, handler: ShortcutHandler) => {
    registeredShortcuts.current.set(shortcut, handler);
    
    // Also register local listener as fallback
    const localHandler = (e: KeyboardEvent) => {
      // Check if the key combination matches
      const match = checkShortcutMatch(e, shortcut);
      if (match) {
        handler(e);
      }
    };

    document.addEventListener('keydown', localHandler);
    
    // Store cleanup function
    registeredShortcuts.current.set(`${shortcut}-cleanup`, localHandler as any);
  }, []);

  /**
   * Unregister a shortcut
   */
  const unregisterShortcut = useCallback((shortcut: string) => {
    registeredShortcuts.current.delete(shortcut);
    
    const cleanup = registeredShortcuts.current.get(`${shortcut}-cleanup`);
    if (cleanup) {
      document.removeEventListener('keydown', cleanup);
      registeredShortcuts.current.delete(`${shortcut}-cleanup`);
    }
  }, []);

  /**
   * Check if a shortcut is registered
   */
  const isRegistered = useCallback((shortcut: string): boolean => {
    return registeredShortcuts.current.has(shortcut);
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    isRegistered,
  };
}

/**
 * Helper function to check if a keyboard event matches a shortcut
 */
function checkShortcutMatch(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+');
  let matchAlt = false;
  let matchCtrl = false;
  let matchShift = false;
  let matchMeta = false;
  let matchKey = '';

  for (const part of parts) {
    switch (part.toLowerCase()) {
      case 'alt':
        matchAlt = true;
        break;
      case 'ctrl':
      case 'control':
        matchCtrl = true;
        break;
      case 'shift':
        matchShift = true;
        break;
      case 'cmd':
      case 'meta':
      case 'command':
        matchMeta = true;
        break;
      case 'space':
        matchKey = ' ';
        break;
      default:
        matchKey = part.toLowerCase();
    }
  }

  const keyMatch = event.key.toLowerCase() === matchKey || 
                   event.code.toLowerCase() === matchKey ||
                   (matchKey === ' ' && event.code === 'Space');

  return (
    keyMatch &&
    event.altKey === matchAlt &&
    event.ctrlKey === matchCtrl &&
    event.shiftKey === matchShift &&
    event.metaKey === matchMeta
  );
}
