import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/**
 * Hook for registering global keyboard shortcuts
 * 
 * @param key - The key to listen for (e.g., 'k', 's')
 * @param callback - Function to call when shortcut is pressed
 * @param options - Modifier keys (ctrl, shift, alt)
 * 
 * @example
 * useKeyboardShortcut('k', () => setOpen(true), { ctrl: true });
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Check if key matches
      const matchKey = e.key.toLowerCase() === key.toLowerCase();
      
      // Check modifiers
      const matchCtrl = options.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const matchShift = options.shift ? e.shiftKey : true;
      const matchAlt = options.alt ? e.altKey : true;

      if (matchKey && matchCtrl && matchShift && matchAlt) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options.ctrl, options.shift, options.alt]);
}
