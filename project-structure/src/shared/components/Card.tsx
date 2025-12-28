import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'solid' | 'glow';
    interactive?: boolean;
}

export const Card = ({
    className,
    variant = 'glass',
    interactive = false,
    children,
    ...props
}: CardProps) => {
    const variants = {
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl',
        solid: 'bg-zinc-900 border border-white/5 shadow-xl',
        glow: 'bg-white/5 backdrop-blur-xl border border-vibe-purple/20 shadow-[0_0_40px_rgba(168,85,247,0.1)]',
    };

    return (
        <div
            className={cn(
                'rounded-[2rem] p-6 transition-all duration-500 relative overflow-hidden group',
                variants[variant],
                interactive && 'hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1 cursor-pointer',
                className
            )}
            {...props}
        >
            {/* Internal Noise Overlay */}
            <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none" />

            {/* Corner Glow for Interactive */}
            {interactive && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-vibe-purple/5 blur-[80px] group-hover:bg-vibe-purple/10 transition-all duration-500 pointer-events-none" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
