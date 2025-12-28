import React from 'react';

export function SettingsPage() {
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-12 animate-fade-in">
            <header className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">Customize your experience and manage resources.</p>
            </header>

            <section className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/5 pb-2">Appearance</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                        <div>
                            <p className="font-medium">Glassmorphism Intensity</p>
                            <p className="text-sm text-muted-foreground">Adjust the blur and transparency level.</p>
                        </div>
                        <input type="range" className="accent-vibe-purple" />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/5 pb-2">AI & Local Models</h3>
                <div className="p-4 glass rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">Primary Model</p>
                        <span className="text-xs font-mono bg-vibe-blue/10 text-vibe-blue px-3 py-1 rounded-full uppercase">Phi-3.1 Mini</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Local inference is handled via Ollama integration. Ensure Ollama is running in the background for AI features.</p>
                </div>
            </section>
        </div>
    );
}
