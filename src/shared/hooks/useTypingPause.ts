/**
 * Custom hook for detecting typing pauses (2-second debounce)
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Returns a debounced callback that fires after typing pauses
 * @param callback - Function to execute after pause
 * @param delay - Delay in milliseconds (default: 2000ms)
 */
export function useTypingPause(
  callback: (...args: unknown[]) => void,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<unknown[]>([]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: unknown[]) => {
    // Store latest arguments
    lastArgsRef.current = args;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout (2-second delay = 2000ms)
    timeoutRef.current = setTimeout(() => {
      callback(...lastArgsRef.current);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
}
