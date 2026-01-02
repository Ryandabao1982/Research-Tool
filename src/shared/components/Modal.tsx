import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils';
import { useSettingsStore } from '../stores/settingsStore';
import { IconButton } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

/**
 * Accessible Modal Component
 * 
 * # Features
 * - Focus trap within modal (Tab/Shift+Tab navigation)
 * - Escape key to close (AC: #3)
 * - ARIA role="dialog" and aria-modal="true"
 * - aria-labelledby for title
 * - High contrast mode support
 * - Reduced motion support
 * - Backdrop click to close (optional)
 * 
 * # Keyboard Navigation
 * - Tab: Move focus forward within modal
 * - Shift+Tab: Move focus backward within modal
 * - Escape: Close modal
 * 
 * # Usage
 * ```tsx
 * <Modal 
 *   isOpen={open}
 *   onClose={handleClose}
 *   title="Edit Note"
 * >
 *   <NoteForm />
 * </Modal>
 * ```
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
}: ModalProps) {
  const { reducedMotion } = useSettingsStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Size mappings
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Focus trap implementation
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab: if at first element, wrap to last
        if (document.activeElement === firstElement && lastElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if at last element, wrap to first
        if (document.activeElement === lastElement && firstElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen]);

  // Handle Escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (isOpen && closeOnEscape && e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Global keyboard handlers
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Store previous focus and focus first element
    previousFocus.current = document.activeElement as HTMLElement;
    
    // Focus first focusable element after modal opens
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          // If no focusable elements, focus the modal itself
          modalRef.current.focus();
        }
      }
    }, 100);

    return () => {
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      
      // Restore previous focus
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
      
      clearTimeout(focusTimer);
    };
  }, [isOpen, trapFocus, handleEscape]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        role="presentation"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'w-full bg-white border border-neutral-200 shadow-xl',
            'flex flex-col max-h-[90vh] overflow-hidden',
            sizeClasses[size]
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${title}-modal-title`}
          tabIndex={-1} // Allow modal to receive focus
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50">
            <h2 
              id={`${title}-modal-title`}
              className="font-sans text-xl font-bold text-neutral-900"
            >
              {title}
            </h2>
            
            {showCloseButton && (
              <IconButton
                ariaLabel={`Close ${title} modal`}
                icon={<X className="w-5 h-5" />}
                onClick={onClose}
                className="hover:bg-neutral-200"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export interface DialogProps extends Omit<ModalProps, 'title'> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Accessible Dialog Component (Modal with actions)
 * 
 * Extends Modal with action buttons at bottom
 * 
 * # Usage
 * ```tsx
 * <Dialog
 *   isOpen={open}
 *   onClose={handleClose}
 *   title="Confirm Delete"
 *   description="Are you sure you want to delete this note?"
 *   actions={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function Dialog({ 
  title, 
  description, 
  actions, 
  ...modalProps 
}: DialogProps) {
  return (
    <Modal title={title} {...modalProps}>
      {description && (
        <p className="mb-6 text-neutral-700 font-sans text-base leading-relaxed">
          {description}
        </p>
      )}
      
      {modalProps.children}
      
      {actions && (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
          {actions}
        </div>
      )}
    </Modal>
  );
}
