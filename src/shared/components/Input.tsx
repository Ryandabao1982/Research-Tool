import React from 'react';
import { cn } from '../utils';
import { useSettingsStore } from '../stores/settingsStore';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // Required for screen readers
  id?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

/**
 * Accessible Input Component
 * 
 * # Features
 * - Screen reader only label (visually hidden but accessible)
 * - Proper aria-describedby for errors and helper text
 * - 2px blue focus ring with 4px offset (WCAG AAA)
 * - High contrast mode support
 * - Reduced motion support
 * 
 * # Usage
 * ```tsx
 * <Input 
 *   label="Note Title"
 *   placeholder="Enter title..."
 *   value={title}
 *   onChange={(e) => setTitle(e.target.value)}
 *   ariaLabel="Note title input"
 * />
 * ```
 */
export function Input({ 
  label, 
  id,
  error,
  helperText,
  containerClassName,
  className,
  disabled,
  required,
  ...props 
}: InputProps) {
  const { highContrastMode, reducedMotion } = useSettingsStore();

  // Generate stable ID
  const inputId = id || React.useMemo(() => `input-${Math.random().toString(36).substr(2, 9)}`, []);

  // Base input styles
  const inputBaseClasses = `
    w-full px-4 py-3
    font-sans text-base
    border rounded-none
    bg-white
    transition-all duration-200
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-focus-blue focus-visible:ring-offset-4 focus-visible:ring-offset-focus-bg
    disabled:opacity-50 disabled:cursor-not-allowed
    ${reducedMotion ? 'transition-none' : ''}
  `;

  // Input state styles
  const inputStateClasses = error
    ? `
      border-red-500 text-red-900
      placeholder-red-300
      focus-visible:ring-red-500
      ${highContrastMode ? 'border-red-700 text-red-700' : ''}
    `
    : `
      border-neutral-300 text-neutral-900
      placeholder-neutral-400
      hover:border-neutral-400
      ${highContrastMode ? 'border-black text-black' : ''}
    `;

  const inputClassName = cn(
    inputBaseClasses,
    inputStateClasses,
    className
  );

  // Helper text styles
  const helperTextClasses = error
    ? 'text-red-600 font-medium'
    : 'text-neutral-600';

  const helperTextClassName = cn(
    'mt-1 text-sm font-mono',
    helperTextClasses,
    highContrastMode ? 'text-black font-bold' : ''
  );

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {/* Screen reader only label - visible to assistive technology only */}
      <label 
        htmlFor={inputId}
        className="sr-only"
      >
        {label}
        {required && ' (required)'}
      </label>

      {/* Visual label for sighted users */}
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-semibold text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>

      {/* Input field */}
      <input
        id={inputId}
        aria-label={label}
        aria-describedby={error ? `${inputId}-error` : (helperText ? `${inputId}-helper` : undefined)}
        aria-invalid={!!error}
        disabled={disabled}
        required={required}
        className={inputClassName}
        {...props}
      />

      {/* Helper text or error message */}
      {(error || helperText) && (
        <div 
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={helperTextClassName}
          role={error ? 'alert' : undefined}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

/**
 * Accessible Textarea Component
 * 
 * Similar to Input but for multi-line text
 */
export function Textarea({ 
  label, 
  id,
  error,
  helperText,
  containerClassName,
  className,
  disabled,
  required,
  rows = 4,
  ...props 
}: TextareaProps) {
  const { highContrastMode, reducedMotion } = useSettingsStore();

  const textareaId = id || React.useMemo(() => `textarea-${Math.random().toString(36).substr(2, 9)}`, []);

  const textareaBaseClasses = `
    w-full px-4 py-3
    font-sans text-base
    border rounded-none
    bg-white
    resize-y
    transition-all duration-200
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-focus-blue focus-visible:ring-offset-4 focus-visible:ring-offset-focus-bg
    disabled:opacity-50 disabled:cursor-not-allowed
    ${reducedMotion ? 'transition-none' : ''}
  `;

  const textareaStateClasses = error
    ? `
      border-red-500 text-red-900
      placeholder-red-300
      focus-visible:ring-red-500
      ${highContrastMode ? 'border-red-700 text-red-700' : ''}
    `
    : `
      border-neutral-300 text-neutral-900
      placeholder-neutral-400
      hover:border-neutral-400
      ${highContrastMode ? 'border-black text-black' : ''}
    `;

  const textareaClassName = cn(
    textareaBaseClasses,
    textareaStateClasses,
    className
  );

  const helperTextClasses = error
    ? 'text-red-600 font-medium'
    : 'text-neutral-600';

  const helperTextClassName = cn(
    'mt-1 text-sm font-mono',
    helperTextClasses,
    highContrastMode ? 'text-black font-bold' : ''
  );

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      <label 
        htmlFor={textareaId}
        className="sr-only"
      >
        {label}
        {required && ' (required)'}
      </label>

      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-semibold text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>

      <textarea
        id={textareaId}
        aria-label={label}
        aria-describedby={error ? `${textareaId}-error` : (helperText ? `${textareaId}-helper` : undefined)}
        aria-invalid={!!error}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClassName}
        {...props}
      />

      {(error || helperText) && (
        <div 
          id={error ? `${textareaId}-error` : `${textareaId}-helper`}
          className={helperTextClassName}
          role={error ? 'alert' : undefined}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
}
