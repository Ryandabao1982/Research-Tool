import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'danger' | 'atmospheric';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: LucideIcon;
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', icon: Icon, loading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-lg hover:shadow-white/5',
            secondary: 'bg-vibe-blue/10 hover:bg-vibe-blue/20 text-vibe-blue border border-vibe-blue/20',
            ghost: 'bg-transparent hover:bg-white/5 text-white/40 hover:text-white border-transparent',
            glow: 'bg-vibe-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:scale-[1.03] active:scale-[0.97]',
            danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
            atmospheric: 'bg-gradient-to-br from-white/[0.08] to-transparent hover:from-white/[0.12] text-white border border-white/10 shadow-xl backdrop-blur-2xl'
        };

        const sizes = {
            sm: 'px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl',
            md: 'px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl',
            lg: 'px-10 py-5 text-sm font-black uppercase tracking-[0.2em] rounded-[2.5rem]',
            icon: 'p-3 rounded-2xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center gap-3 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden group active:translate-y-0.5',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {/* Visual Feedback Layer */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-500 pointer-events-none" />

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit z-20">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                <div className={cn('relative z-10 flex items-center gap-2.5 transition-all duration-500 group-hover:scale-[1.02]', loading && 'opacity-0')}>
                    {Icon && <Icon className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5', 'transition-transform duration-500 group-hover:rotate-12')} />}
                    <span className="relative">{children}</span>
                </div>

                {/* Atmospheric Glow on Hover */}
                {variant === 'glow' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                )}

                {/* Magnetic Border Reflection */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 rounded-inherit transition-all duration-500 pointer-events-none" />
            </button>
        );
    }
);

Button.displayName = 'Button';
