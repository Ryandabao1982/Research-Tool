import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '../../shared/stores/notes-store';
import { useSettingsStore } from '../../shared/stores/settingsStore';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated?: (note: any) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addNote = useNotesStore((state) => state.addNote);
  const { reducedMotion } = useSettingsStore();

  // Generate title from first line
  const generateTitle = useCallback((text: string): string => {
    const firstLine = text.split('\n')
      .map(line => line.trim())
      .find(line => line.length > 0);
    
    if (!firstLine) return 'Untitled Note';
    
    // Truncate if too long
    return firstLine.length > 100 ? `${firstLine.substring(0, 97)}...` : firstLine;
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    const startTime = performance.now();

    try {
      // Call backend to create note
      const result = await invoke<{ id: string; title: string }>('quick_create_note', {
        content: content.trim(),
      });

      // Add to frontend store for Recent Notes (AC: #5)
      const newNote = {
        id: result.id,
        title: result.title,
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await addNote(newNote.title, newNote.content);
      
      // Update store with actual ID from backend
      useNotesStore.getState().setNotes([
        newNote,
        ...useNotesStore.getState().notes,
      ]);

      if (onNoteCreated) {
        onNoteCreated(newNote);
      }

      const duration = performance.now() - startTime;
      console.log(`Capture completed in ${duration.toFixed(2)}ms (target: <200ms)`);

      handleClose();
    } catch (error) {
      console.error('Failed to create note:', error);
      // Could show error toast here
    } finally {
      setIsSaving(false);
    }
  }, [content, isSaving, addNote, onNoteCreated]);

  // Handle close
  const handleClose = useCallback(() => {
    setContent('');
    setIsExpanded(false);
    onClose();
  }, [onClose]);

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

  // Auto-expand based on content (AC: #2)
  useEffect(() => {
    if (!isOpen) return;
    
    const lines = content.split('\n').length;
    const shouldExpand = lines > 1 || content.length > 50;
    setIsExpanded(shouldExpand);
  }, [content, isOpen]);

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setIsExpanded(false);
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
          `}
          layout
        >
          {/* Performance indicator - Rational Grid compliant */}
          <div className="absolute top-2 right-2 font-mono text-xs text-neutral-500" aria-live="polite">
            {isExpanded ? 'EXPANDED' : 'COMPACT'}
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture your thought... (Press Enter to save, Esc to cancel)"
            disabled={isSaving}
            aria-label="Quick capture text area"
            aria-describedby="capture-hints"
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
