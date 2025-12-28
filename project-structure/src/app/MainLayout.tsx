import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FileText,
    Search,
    Tag,
    Settings,
    Share2,
    LayoutGrid,
    Moon,
    Sun,
    Monitor
} from 'lucide-react';
import { useTheme } from '../shared/theme/ThemeProvider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="w-64 glass-dark border-r border-white/5 flex flex-col z-10 transition-all duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-vibe-purple to-vibe-blue bg-clip-text text-transparent">
                        KnowledgeBase
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 font-medium tracking-widest uppercase">
                        Pro Edition
                    </p>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-2">
                    <NavItem to="/notes" icon={<FileText size={20} />} label="Notes" />
                    <NavItem to="/search" icon={<Search size={20} />} label="Search" />
                    <NavItem to="/tags" icon={<Tag size={20} />} label="Tags" />
                    <NavItem to="/graph" icon={<LayoutGrid size={20} />} label="Graph View" />
                    <NavItem to="/import-export" icon={<Share2 size={20} />} label="Sync & Export" />
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
                    >
                        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />}
                        <span className="capitalize">{theme} Mode</span>
                    </button>

                    <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vibe-purple/5 via-transparent to-transparent">
                <div className="noise-overlay" />
                <div className="relative z-0 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive
                    ? "bg-white/10 text-foreground shadow-atmosphere"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
        >
            <span className="group-hover:scale-110 transition-transform duration-200">
                {icon}
            </span>
            <span className="text-sm font-medium">{label}</span>

            {/* Hover background glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity" />
        </NavLink>
    );
}
