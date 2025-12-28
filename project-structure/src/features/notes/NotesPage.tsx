import React from 'react';

export function NotesPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Recent Notes</h2>
                <p className="text-muted-foreground">Manage and organize your knowledge base.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass p-6 rounded-2xl space-y-4 group cursor-pointer hover:shadow-glow/20 transition-all duration-300">
                        <div className="h-2 w-12 bg-vibe-purple rounded-full" />
                        <h3 className="text-xl font-semibold">Knowledge Graph Concept {i}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            The integration of bidirectional links and graph visualization allows for a deeper understanding of connections between diverse topics...
                        </p>
                        <div className="flex gap-2">
                            <span className="text-[10px] uppercase tracking-winest px-2 py-1 bg-white/5 rounded-md text-muted-foreground">Research</span>
                            <span className="text-[10px] uppercase tracking-winest px-2 py-1 bg-white/5 rounded-md text-muted-foreground">Phase 1</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <button className="relative group px-8 py-3 rounded-full font-bold text-white transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-vibe-purple via-vibe-blue to-vibe-cyan group-hover:scale-110 transition-transform duration-500" />
                    <span className="relative z-10">Create New Note</span>
                </button>
            </div>
        </div>
    );
}
