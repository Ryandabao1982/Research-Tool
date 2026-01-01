import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Search, Settings } from 'lucide-react';

export const Sidebar = () => {
    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: FileText, label: 'Notes', path: '/notes' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-20 h-screen fixed left-0 top-0 flex flex-col items-center py-8 glass-panel border-r border-white/5 z-50">
            <div className="mb-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--neon-purple)] to-[var(--neon-blue)]" />
            </div>

            <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
              p-3 rounded-xl transition-all duration-300 group relative
              ${isActive ? 'bg-white/10 text-[var(--neon-blue)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <item.icon size={24} strokeWidth={1.5} />
                        {/* Tooltip */}
                        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};
