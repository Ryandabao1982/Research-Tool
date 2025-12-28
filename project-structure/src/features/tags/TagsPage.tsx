import React from 'react';

export function TagsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Taxonomy</h2>
                <p className="text-muted-foreground">Manage your tags and categories.</p>
            </header>

            <div className="flex flex-wrap gap-4">
                {['Research', 'Phase 1', 'Ideas', 'Project', 'Draft', 'Review'].map(tag => (
                    <div key={tag} className="glass px-6 py-4 rounded-2xl flex items-center justify-between min-w-[160px] group hover:border-vibe-purple/40 transition-all cursor-pointer">
                        <span className="font-semibold">{tag}</span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md">12</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
