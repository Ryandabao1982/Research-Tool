import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Send, BrainCircuit, Quote, Clock, ShieldCheck } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AIChatPanelProps {
    activeNoteId?: string;
}

export function AIChatPanel({ activeNoteId }: AIChatPanelProps) {
    const { aiService } = useServices();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, citations?: any[] }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const generateMutation = useMutation({
        mutationFn: (q: string) => aiService.generate({
            query: q,
            context_documents: activeNoteId ? [activeNoteId] : [],
            stream: false
        }),
        onSuccess: (data) => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                citations: data.citations
            }]);
        }
    });

    const handleSend = () => {
        if (!query.trim() || generateMutation.isPending) return;
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        generateMutation.mutate(query);
        setQuery('');
    };

    return (
        <Card variant="solid" className="h-full flex flex-col p-0 border-white/5 bg-zinc-950/50 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
            {/* Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-vibe-blue/10 flex items-center justify-center border border-vibe-blue/20">
                        <BrainCircuit className="text-vibe-blue w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight uppercase">Research Assistant</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Phi-3.1 Mini Local</span>
                        </div>
                    </div>
                </div>
                <ShieldCheck className="text-white/10 w-5 h-5" />
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-8">
                        <Sparkles className="w-12 h-12 mb-2" />
                        <h4 className="font-bold">Neural Grounding Active</h4>
                        <p className="text-xs leading-relaxed">
                            I can analyze your current note or search across your entire knowledge base using local-first intelligence.
                        </p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={cn(
                        "flex flex-col gap-2 max-w-[85%]",
                        m.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                        <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-atmosphere",
                            m.role === 'user'
                                ? "bg-vibe-blue/10 text-vibe-blue border border-vibe-blue/20"
                                : "bg-white/5 text-white/80 border border-white/5"
                        )}>
                            {m.content}
                        </div>

                        {m.citations && m.citations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {m.citations.map((c, ci) => (
                                    <div key={ci} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                        <Quote size={10} /> {c.document_title}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest px-1">
                            {m.role === 'assistant' ? 'Assistant' : 'You'} • <Clock className="inline w-2 h-2" /> Just now
                        </div>
                    </div>
                ))}

                {generateMutation.isPending && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <BrainCircuit className="text-white/20 w-4 h-4" />
                        </div>
                        <div className="space-y-2 mt-1">
                            <div className="h-3 w-48 bg-white/5 rounded-full" />
                            <div className="h-3 w-32 bg-white/5 rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <footer className="p-6 bg-zinc-900/30 border-t border-white/5">
                <div className="relative group">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your knowledge base..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-vibe-blue/40 transition-all placeholder:text-white/10"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || generateMutation.isPending}
                        className="absolute right-2 top-2 bottom-2 w-10 h-10 rounded-xl bg-vibe-blue text-white flex items-center justify-center hover:bg-vibe-blue/80 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="mt-3 text-[9px] text-center text-white/10 font-bold uppercase tracking-[0.2em]">
                    Privacy Guaranteed • No Cloud Processing
                </p>
            </footer>
        </Card>
    );
}
