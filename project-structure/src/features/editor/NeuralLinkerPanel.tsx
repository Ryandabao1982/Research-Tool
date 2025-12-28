import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Link2, X, Check, BrainCircuit } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { NeuralLinker, LinkSuggestion } from '../../plugins/neural-linker';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { toast } from 'react-hot-toast';

interface NeuralLinkerPanelProps {
    noteId: string;
    content: string;
    title: string;
}

export function NeuralLinkerPanel({ noteId, content, title }: NeuralLinkerPanelProps) {
    const { noteService, pluginService } = useServices();
    const queryClient = useQueryClient();

    // 1. Check if plugin is enabled
    const { data: plugins } = useQuery({
        queryKey: ['plugins'],
        queryFn: () => pluginService.listPlugins(),
    });

    const isEnabled = useMemo(() =>
        plugins?.find(p => p.manifest.id === 'neural-linker')?.enabled ?? false,
        [plugins]);

    // 2. Fetch all notes to compare
    const { data: allNotes } = useQuery({
        queryKey: ['notes'],
        queryFn: () => noteService.listNotes(),
        enabled: isEnabled
    });

    // 3. Generate Suggestions
    const suggestions = useMemo(() => {
        if (!isEnabled || !allNotes || !content) return [];
        const mockNote = { id: noteId, title, content, tags: [], updated_at: '', created_at: '', is_daily_note: false, properties: {}, word_count: 0, reading_time: 0 };
        return NeuralLinker.suggestLinks(mockNote as any, allNotes);
    }, [isEnabled, allNotes, content, noteId, title]);

    // 4. Mutation to apply link
    const applyLinkMutation = useMutation({
        mutationFn: async (suggestion: LinkSuggestion) => {
            // Logic: Wrap the first mention in Markdown link syntax
            const regex = new RegExp(`(${suggestion.target_title})`, 'i');
            const newContent = content.replace(regex, `[[$1]]`);
            await noteService.updateNote(noteId, { content: newContent });
            return newContent;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['note', noteId] });
            toast.success('Bidirectional link established');
        }
    });

    if (!isEnabled || suggestions.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <Card variant="glass" className="p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-vibe-purple/20 bg-zinc-900/80 backdrop-blur-2xl px-6 min-w-[500px]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-vibe-purple/20 flex items-center justify-center animate-pulse">
                        <Zap size={14} className="text-vibe-purple fill-vibe-purple/20" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-vibe-purple uppercase tracking-widest">Neural Linker</div>
                        <div className="text-xs font-medium text-white/60">{suggestions.length} connections found</div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-white/5" />

                <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hidden py-1">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => applyLinkMutation.mutate(s)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-vibe-purple/40 hover:bg-vibe-purple/10 transition-all text-left group shrink-0"
                        >
                            <Link2 size={12} className="text-white/20 group-hover:text-vibe-purple transition-colors" />
                            <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors">{s.target_title}</span>
                            <div className="text-[8px] font-black text-vibe-purple/40 group-hover:text-vibe-purple transition-colors">{(s.confidence * 100).toFixed(0)}%</div>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><X size={14} /></Button>
                </div>
            </Card>
        </div>
    );
}
