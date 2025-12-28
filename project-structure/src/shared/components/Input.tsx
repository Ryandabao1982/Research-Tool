import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, icon: Icon, error, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-vibe-purple transition-colors" />
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 transition-all duration-300 outline-none',
                            'focus:bg-white/[0.08] focus:border-vibe-purple/40 focus:ring-4 focus:ring-vibe-purple/5',
                            'placeholder:text-white/20',
                            Icon && 'pl-12',
                            error && 'border-red-500/50 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                    {/* Animated border line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-vibe-purple to-transparent transition-all duration-500 group-focus-within:w-1/2 opacity-50" />
                </div>
                {error && <p className="text-xs text-red-400 ml-1 mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
