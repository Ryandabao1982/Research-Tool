import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ChevronLeft, Eye, Edit3, Share2, MoreHorizontal, Clock, Hash, BrainCircuit } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { MarkdownPreview } from './MarkdownPreview';
import { AIChatPanel } from '../ai/AIChatPanel';
import { NeuralLinkerPanel } from './NeuralLinkerPanel';
import { TagSelector } from './TagSelector';
import { Button } from '../../shared/components/Button';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

export function NoteEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { noteService } = useServices();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
    const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);

    // 1. Fetch Note
    const { data: note, isLoading } = useQuery({
        queryKey: ['note', id],
        queryFn: () => noteService.getNote(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags || []);
        }
    }, [note]);

    // 2. Save Mutation
    const saveMutation = useMutation({
        mutationFn: () => noteService.updateNote(id!, { title, content, tags }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['note', id] });
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success('Knowledge synchronized', {
                icon: '💾',
                style: {
                    borderRadius: '16px',
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid rgba(168,85,247,0.2)',
                },
            });
        },
    });

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-vibe-purple/20 border-t-vibe-purple rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
            {/* Editor Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/notes')} className="rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-lg font-black tracking-tight focus:outline-none placeholder:text-white/20 w-64 md:w-96"
                            placeholder="Untitled Research..."
                        />
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-white/30 tracking-widest leading-none relative">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> modified {note ? 'recently' : 'now'}</span>
                            <div className="relative">
                                <span
                                    onClick={() => setIsTagSelectorOpen(!isTagSelectorOpen)}
                                    className={cn(
                                        "flex items-center gap-1 cursor-pointer transition-colors",
                                        isTagSelectorOpen || tags.length > 0 ? "text-vibe-purple" : "hover:text-vibe-purple"
                                    )}
                                >
                                    <Hash className="w-3 h-3" /> {tags.length > 0 ? `${tags.length} Tag${tags.length > 1 ? 's' : ''}` : 'Add Tags'}
                                </span>
                                <AnimatePresence>
                                    {isTagSelectorOpen && (
                                        <TagSelector
                                            selectedTags={tags}
                                            onTagsChange={setTags}
                                            onClose={() => setIsTagSelectorOpen(false)}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-1 rounded-xl border border-white/5 flex">
                        <Button
                            variant={!isPreview ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setIsPreview(false)}
                            className={!isPreview ? 'bg-white/10' : 'text-white/20'}
                            icon={Edit3}
                        >
                            Write
                        </Button>
                        <Button
                            variant={isPreview ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setIsPreview(true)}
                            className={isPreview ? 'bg-white/10' : 'text-white/20'}
                            icon={Eye}
                        >
                            Preview
                        </Button>
                    </div>
                    <Button
                        variant={isAIPanelOpen ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                        className={isAIPanelOpen ? 'text-vibe-blue bg-vibe-blue/10 border-vibe-blue/20' : 'text-white/40'}
                        icon={BrainCircuit}
                    >
                        Ask AI
                    </Button>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><MoreHorizontal className="w-4 h-4" /></Button>
                    <Button
                        variant="glow"
                        size="sm"
                        icon={Save}
                        onClick={() => saveMutation.mutate()}
                        loading={saveMutation.isPending}
                    >
                        Sync
                    </Button>
                </div>
            </header>

            {/* Editor Workspace */}
            <main className="flex-1 flex overflow-hidden">
                {/* Writing Area */}
                <div className={cn(
                    "flex-1 transition-all duration-500 overflow-hidden",
                    isPreview ? "hidden md:block opacity-30 pointer-events-none" : "block opacity-100"
                )}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full p-12 bg-transparent text-white/80 resize-none focus:outline-none font-mono text-base leading-relaxed scrollbar-hidden selection:bg-vibe-purple/30"
                        placeholder="Capture your stream of consciousness..."
                        autoFocus
                    />
                </div>

                {/* Separator */}
                <div className={cn(
                    "hidden md:block w-[1px] bg-white/5 h-full",
                    isPreview ? "opacity-0" : "opacity-100"
                )} />

                {/* Preview Area */}
                <div className={cn(
                    "flex-1 h-full bg-zinc-900/10 transition-all duration-500 overflow-y-auto",
                    isPreview ? "block w-full opacity-100" : "hidden md:block opacity-30 md:max-w-xl lg:max-w-2xl"
                )}>
                    <MarkdownPreview content={content} />
                </div>

                {/* AI Sidebar */}
                <div className={cn(
                    "transition-all duration-500 ease-in-out border-l border-white/5 bg-zinc-950",
                    isAIPanelOpen ? "w-[400px] opacity-100" : "w-0 opacity-0 pointer-events-none overflow-hidden"
                )}>
                    <div className="w-[400px] h-full p-4">
                        <AIChatPanel activeNoteId={id} />
                    </div>
                </div>
            </main>

            {/* Plugin Layer: Neural Linker */}
            <NeuralLinkerPanel noteId={id!} content={content} title={title} />

            {/* Visual Noise Layer */}
            <div className="fixed inset-0 pointer-events-none noise-overlay opacity-[0.02] z-50" />
        </div>
    );
}
