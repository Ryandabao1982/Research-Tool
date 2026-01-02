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
        <aside className="w-20 h-screen fixed left-0 top-0 flex flex-col items-center py-8 bg-white border-r border-neutral-200 z-50">
            <div className="mb-10">
                <div className="w-10 h-10 border border-neutral-200 bg-neutral-50 flex items-center justify-center font-mono text-xs font-bold text-neutral-900">
                    KB
                </div>
            </div>

            <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
              p-3 border rounded-none transition-colors group relative
              ${isActive 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'}
            `}
                    >
                        <item.icon size={24} strokeWidth={1.5} />
                        {/* Tooltip */}
                        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 rounded-none">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};
