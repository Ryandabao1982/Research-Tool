import React from 'react';

export function ImportExportPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 animate-fade-in">
            <header className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sync & Portability</h2>
                <p className="text-muted-foreground">Manage your data and backup your knowledge.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl space-y-6 hover:border-vibe-cyan/30 transition-all border-dashed border-2 border-white/5">
                    <h3 className="text-xl font-bold">Import Knowledge</h3>
                    <p className="text-sm text-muted-foreground">Support for Markdown files, Notion exports, and Obsidian vaults.</p>
                    <button className="w-full py-3 glass rounded-xl hover:bg-white/5 transition-all font-semibold">Select Vault Folder</button>
                </div>

                <div className="glass p-8 rounded-3xl space-y-6 hover:border-vibe-blue/30 transition-all border-dashed border-2 border-white/5">
                    <h3 className="text-xl font-bold">Export Database</h3>
                    <p className="text-sm text-muted-foreground">Package your entire knowledge base into a portable JSON or PDF bundle.</p>
                    <button className="w-full py-3 glass rounded-xl hover:bg-white/5 transition-all font-semibold">Generate Export Bundle</button>
                </div>
            </div>
        </div>
    );
}
