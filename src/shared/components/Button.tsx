import React from 'react';
import { cn } from '../utils';
import { useSettingsStore } from '../stores/settingsStore';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string; // Required for screen readers (AC: #2)
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  keyboardHint?: string; // Optional keyboard shortcut hint
}

/**
 * Accessible Button Component
 * 
 * # Features
 * - Required aria-label for screen readers
 * - 2px blue focus ring with 4px offset (WCAG AAA)
 * - Keyboard navigation support (Tab/Enter/Esc)
 * - High contrast mode support
 * - Reduced motion support
 * 
 * # Usage
 * ```tsx
 * <Button 
 *   ariaLabel="Save note"
 *   onClick={handleSave}
 *   keyboardHint="Ctrl+S"
 * >
 *   Save
 * </Button>
 * ```
 */
export function Button({ 
  children, 
  ariaLabel, 
  variant = 'primary',
  icon,
  iconPosition = 'left',
  keyboardHint,
  className,
  disabled,
  onClick,
  ...props 
}: ButtonProps) {
  const { highContrastMode, reducedMotion } = useSettingsStore();

  // Base styles for all buttons
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-4 py-2
    font-sans font-medium text-sm
    border border-transparent rounded-none
    transition-all duration-200
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-focus-blue focus-visible:ring-offset-4 focus-visible:ring-offset-focus-bg
    disabled:opacity-50 disabled:cursor-not-allowed
    ${reducedMotion ? 'transition-none' : ''}
  `;

  // Variant styles
  const variantClasses = {
    primary: `
      bg-primary text-white
      hover:bg-primary-600
      active:bg-primary-700
      border-primary
      ${highContrastMode ? 'focus-visible:ring-focus-pure focus-visible:ring-offset-focus-bg-pure' : ''}
    `,
    secondary: `
      bg-white text-neutral-900
      hover:bg-neutral-50
      active:bg-neutral-100
      border-neutral-300
      ${highContrastMode ? 'border-black text-black' : ''}
    `,
    ghost: `
      bg-transparent text-neutral-700
      hover:bg-neutral-100
      active:bg-neutral-200
      border-transparent
      ${highContrastMode ? 'text-black hover:bg-neutral-200' : ''}
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600
      active:bg-red-700
      border-red-500
      ${highContrastMode ? 'focus-visible:ring-offset-red-500' : ''}
    `,
  };

  const combinedClassName = cn(
    baseClasses,
    variantClasses[variant],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter key triggers click (already default behavior)
    // Escape key can be handled by parent if needed
    if (e.key === 'Escape' && onClick) {
      e.currentTarget.blur(); // Remove focus on Escape
    }
    
    // Call original onKeyDown if provided
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={combinedClassName}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
      {keyboardHint && (
        <span className="ml-1 text-xs opacity-70 font-mono">
          {keyboardHint}
        </span>
      )}
    </button>
  );
}

/**
 * Accessible Icon Button Component
 * 
 * For buttons that only contain icons (no text)
 * Automatically adds aria-label and visually hidden text
 */
export function IconButton({ 
  ariaLabel, 
  icon, 
  variant = 'ghost',
  className,
  ...props 
}: Omit<ButtonProps, 'children'> & { icon: React.ReactNode }) {
  return (
    <Button
      ariaLabel={ariaLabel}
      variant={variant}
      className={cn('p-2', className)}
      {...props}
    >
      {icon}
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  );
}
