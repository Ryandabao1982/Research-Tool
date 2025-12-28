import React from 'react';

export function SearchPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Global Search</h2>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-vibe-purple to-vibe-blue rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500" />
                    <input
                        type="text"
                        placeholder="Search notes, tags, or content..."
                        className="w-full relative glass px-6 py-4 rounded-xl outline-none focus:ring-1 focus:ring-vibe-blue transition-all"
                    />
                </div>
            </header>

            <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest px-1">Quick Filters</p>
                <div className="flex flex-wrap gap-3">
                    {['Created Today', 'Recently Edited', 'Images', 'Attachments', 'Unlinked'].map(f => (
                        <button key={f} className="px-5 py-2 glass rounded-full text-sm hover:border-white/20 transition-all font-medium">
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
