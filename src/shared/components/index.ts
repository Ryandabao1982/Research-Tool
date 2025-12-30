import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

const baseButton = cva([
  'base': 'inline-flex items-center justify-center px-4 py-2 font-medium text-white transition-colors rounded-md',
  'variants': {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  },
  'sizes': {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
]);

const baseCard = cva([
  'base': 'bg-white/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-atmosphere p-6 transition-all duration-300',
  'variants': {
    solid: 'bg-white/95 border-white/20 shadow-lg',
    glass: 'bg-white/30 backdrop-blur-md border-white/20 shadow-xl',
    elevated: 'bg-white/80 border border-gray-200 shadow-md',
  },
]);

const baseInput = cva([
  'base': 'w-full px-3 py-2 bg-white/5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  'variants': {
    error: 'border-red-500 focus:ring-red-500',
  },
]);

export interface ButtonProps extends BaseComponentProps {
  variant?: VariantProps<typeof baseButton>['variant'];
  size?: VariantProps<typeof baseButton>['size'];
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface CardProps extends BaseComponentProps {
  variant?: VariantProps<typeof baseCard>['variant'];
  hover?: boolean;
  padding?: VariantProps<typeof baseCard>['padding'];
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', disabled = false, loading = false, onClick, ...props }, ref
) => {
  return (
    <button
      className={baseButton({ variant, size, className })}
      disabled={disabled || loading}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {loading ? (
        <div className="animate-pulse">Processing...</div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = 'solid', hover = false, padding = 'md', ...props }, ref
) => {
  return (
    <div
      className={baseCard({ variant, hover, padding, className })}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', placeholder, value, onChange, error, disabled = false, ...props }, ref
) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={baseInput({ className, error })}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';