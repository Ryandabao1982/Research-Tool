import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '../../shared/stores/notes-store';
import { useSettingsStore } from '../../shared/stores/settingsStore';
import type { Note } from '../../shared/types';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated?: (note: Note) => void;
}

/**
 * Frameless Capture Modal for Rapid Thought Capture
 * 
 * # Features
 * - Frameless design with minimal chrome
 * - Auto-expands based on content height
 * - Enter to save, Esc to close
 * - Performance: Opens <50ms, completes <200ms
 * 
 * # Design
 * - Follows "Rational Grid" principles
 * - 1px borders, glassmorphism
 * - No header/footer, just textarea
 */
export function CaptureModal({ isOpen, onClose, onNoteCreated }: CaptureModalProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { reducedMotion } = useSettingsStore();
  const addNoteWithId = useNotesStore((state) => state.addNoteWithId);

  // Constants for configuration
  const MAX_CONTENT_LENGTH = 100000; // 100KB limit
  const EXPANSION_THRESHOLD_CHARS = 50;
  const EXPANSION_THRESHOLD_LINES = 1;
  const PERFORMANCE_TARGET_MS = 200;

  // Handle close
  const handleClose = useCallback(() => {
    setContent('');
    setIsExpanded(false);
    setError(null);
    onClose();
  }, [onClose]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!content.trim() || isSaving) return;

    // Input validation (security fix)
    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      setError('Content cannot be empty');
      return;
    }
    
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setError(`Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setIsSaving(true);
    setError(null);
    const startTime = performance.now();

    try {
      // Call backend to create note with auto-title
      // Backend returns tuple: (note_id, title)
      const result = await invoke<[string, string]>('quick_create_note', {
        content: trimmedContent,
      });

      // Validate backend response (response validation fix)
      if (!result || !Array.isArray(result) || result.length !== 2) {
        throw new Error('Invalid response format from backend');
      }

      const [noteId, title] = result;

      if (!noteId || typeof noteId !== 'string' || !title || typeof title !== 'string') {
        throw new Error('Backend returned invalid note data');
      }

      // Create note object
      const newNote: Note = {
        id: noteId,
        title: title,
        content: trimmedContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update store using proper action (no direct manipulation)
      addNoteWithId(newNote);

      // Notify parent if callback provided
      if (onNoteCreated) {
        onNoteCreated(newNote);
      }

      // Performance measurement (AC: #6)
      const duration = performance.now() - startTime;
      
      // Log performance (in production, use proper logging service)
      if (duration > PERFORMANCE_TARGET_MS) {
        console.warn(`Performance target missed: ${duration.toFixed(2)}ms > ${PERFORMANCE_TARGET_MS}ms`);
      } else {
        console.log(`Capture completed in ${duration.toFixed(2)}ms`);
      }

      // Close modal on success
      handleClose();
    } catch (error) {
      // Show error to user instead of silent failure
      const errorMessage = error instanceof Error ? error.message : 'Failed to save note';
      setError(errorMessage);
      
      // Log error for debugging
      console.error('Capture error:', error);
      
      // Reset saving state so user can retry
      setIsSaving(false);
    }
  }, [content, isSaving, onNoteCreated, handleClose, addNoteWithId]);

  // Handle Enter to save (AC: #3) and Esc to close (AC: #4)
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift to save
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        await handleSave();
      }
    }
    // Escape to close without saving
    else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  }, [content, handleSave, handleClose]);

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  // Auto-expand based on content (AC: #2) - with debouncing
  useEffect(() => {
    if (!isOpen) return;
    
    const lines = content.split('\n').length;
    const shouldExpand = lines > EXPANSION_THRESHOLD_LINES || content.length > EXPANSION_THRESHOLD_CHARS;
    
    // Debounce expansion to avoid jarring transitions
    const timer = setTimeout(() => {
      setIsExpanded(shouldExpand);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [content, isOpen]);

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setIsExpanded(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Rapid capture modal"
      >
        <motion.div
          className={`
            relative w-full max-w-2xl bg-white border border-neutral-200
            overflow-hidden transition-all duration-200
            ${isExpanded ? 'min-h-[300px]' : 'min-h-[150px]'}
            ${isSaving ? 'opacity-70 pointer-events-none' : ''}
            ${error ? 'border-red-500' : ''}
          `}
          layout
        >
          {/* Performance indicator - Rational Grid compliant */}
          <div className="absolute top-2 right-2 font-mono text-xs text-neutral-500" aria-live="polite">
            {isExpanded ? 'EXPANDED' : 'COMPACT'}
          </div>

          {/* Error display */}
          {error && (
            <div className="absolute top-2 left-2 right-12 bg-red-50 text-red-700 px-3 py-2 text-xs rounded border border-red-200">
              {error}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture your thought... (Press Enter to save, Esc to cancel)"
            disabled={isSaving}
            aria-label="Quick capture text area"
            aria-describedby="capture-hints"
            aria-invalid={!!error}
            className={`
              w-full h-full bg-transparent border-none outline-none resize-none
              text-neutral-900 placeholder-neutral-400 p-8
              font-sans text-base leading-relaxed
              focus:ring-0 focus:border-none
              ${isExpanded ? 'min-h-[300px]' : 'min-h-[150px]'}
              ${isSaving ? 'cursor-wait' : 'cursor-text'}
            `}
            style={{
              height: isExpanded ? 'auto' : '150px',
              transition: reducedMotion ? 'none' : 'height 0.2s ease-out',
            }}
          />

          {/* Bottom hint bar - Rational Grid compliant */}
          <div 
            id="capture-hints"
            className={`
              absolute bottom-0 left-0 right-0
              bg-gradient-to-t from-neutral-100 to-transparent
              px-6 py-4 flex justify-between items-center
              transition-opacity duration-200
              ${content ? 'opacity-100' : 'opacity-0'}
            `}
            role="status"
            aria-live="polite"
          >
            <div className="flex gap-2 text-xs font-mono text-neutral-600">
              <span className="bg-neutral-200 px-2 py-1 border border-neutral-300" aria-label="Enter key">
                ENTER
              </span>
              <span className="bg-neutral-200 px-2 py-1 border border-neutral-300" aria-label="Escape key">
                ESC
              </span>
            </div>
            <div className="text-xs font-mono text-neutral-500" aria-live="polite">
              {content.length > 0 ? `${content.length} chars` : ''}
            </div>
          </div>

          {/* Loading overlay - Rational Grid compliant */}
          {isSaving && (
            <div 
              className="absolute inset-0 bg-white/90 flex items-center justify-center"
              role="alert"
              aria-live="assertive"
              aria-label="Saving note"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-none animate-spin" />
                <div className="text-sm font-sans text-primary font-medium">Saving...</div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
