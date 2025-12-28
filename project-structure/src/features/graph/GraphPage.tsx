import React from 'react';

export function GraphPage() {
    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="p-8 pb-0">
                <h2 className="text-3xl font-bold tracking-tight">Knowledge Graph</h2>
                <p className="text-muted-foreground">Visualize connections between your ideas.</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl h-[500px] glass rounded-3xl flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-white/10">
                    <div className="w-24 h-24 bg-vibe-blue/20 rounded-full flex items-center justify-center animate-glow-pulse">
                        <div className="w-12 h-12 bg-vibe-blue/40 rounded-full" />
                    </div>
                    <h3 className="text-xl font-medium">Graph Engine Initialization</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        The interactive graph view uses D3.js to render your note network.
                        Connect notes using wikilinks to see your knowledge grow.
                    </p>
                    <button className="text-vibe-blue text-sm font-semibold hover:underline">
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
}
