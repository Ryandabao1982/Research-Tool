import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Share2, Settings, Maximize2, ZoomIn, ZoomOut, Zap, Download } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { GraphContainer } from './GraphContainer';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';

export function GraphPage() {
    const { noteService } = useServices();
    const navigate = useNavigate();
    const [focusId, setFocusId] = useState<string | null>(null);

    // 1. Fetch Graphs Data
    const { data: notes } = useQuery({
        queryKey: ['notes-graph'],
        queryFn: () => noteService.listNotes(),
    });

    const { data: links } = useQuery({
        queryKey: ['links-graph'],
        queryFn: () => noteService.listLinks(),
    });

    return (
        <div className="flex flex-col h-screen animate-fade-in overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vibe-blue/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            {/* Top Header Overlay */}
            <header className="absolute top-0 left-0 right-0 p-8 z-10 flex justify-between items-start pointer-events-none">
                <div className="space-y-1 pointer-events-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibe-blue/10 border border-vibe-blue/20 text-vibe-blue text-[10px] font-bold uppercase tracking-widest mb-2">
                        <Zap className="w-3 h-3 fill-vibe-blue" />
                        Active Visualization
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">
                        Knowledge <span className="text-vibe-blue">Graph.</span>
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        Discover {links?.length || 0} connections across {notes?.length || 0} research nodes.
                    </p>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <Button variant="primary" size="icon" icon={Share2} />
                    <Button variant="primary" size="icon" icon={Settings} />
                </div>
            </header>

            {/* Main Viewport */}
            <div className="flex-1 relative">
                {notes && links ? (
                    <GraphContainer
                        notes={notes}
                        links={links}
                        onNodeClick={(id) => navigate(`/notes/${id}`)}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center opacity-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-vibe-blue" />
                    </div>
                )}
            </div>

            {/* Controls Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
                    <Card variant="glass" className="p-1 rounded-2xl flex gap-1 items-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10" icon={ZoomIn} />
                        <div className="w-[1px] h-4 bg-white/10" />
                        <Button variant="ghost" size="icon" className="h-10 w-10" icon={ZoomOut} />
                        <div className="w-[1px] h-4 bg-white/10" />
                        <Button variant="ghost" size="icon" className="h-10 w-10" icon={Maximize2} />
                    </Card>
                </div>

                <div className="pointer-events-auto flex items-center gap-4">
                    <Card variant="glass" className="py-2 px-6 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-white/40 tracking-tight">System Map v2.4</span>
                    </Card>
                    <Button variant="glow" icon={Download}>Export Graph</Button>
                </div>
            </div>

            {/* Noise layer */}
            <div className="absolute inset-0 noise-overlay opacity-[0.02] pointer-events-none" />
        </div>
    );
}
