import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: LucideIcon;
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', icon: Icon, loading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-xl backdrop-blur-md',
            secondary: 'bg-vibe-blue/10 hover:bg-vibe-blue/20 text-vibe-blue border border-vibe-blue/20',
            ghost: 'bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white border-transparent',
            glow: 'bg-vibe-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02] active:scale-[0.98]',
            danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-lg',
            md: 'px-5 py-2.5 text-sm rounded-xl',
            lg: 'px-8 py-4 text-base rounded-2xl',
            icon: 'p-2.5 rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
                    {Icon && <Icon className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5')} />}
                    {children}
                </div>

                {/* Shine effect on hover for Glow/Primary */}
                {(variant === 'glow' || variant === 'primary') && (
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
