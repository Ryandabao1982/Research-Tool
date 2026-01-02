import { Command } from 'cmdk';
import { useState, useEffect } from 'react';
import { Search, Brain, FileText, Sparkles, Loader2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import ReactMarkdown from 'react-markdown';

export function AskModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAskAI = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);

        try {
            const result = await invoke<string>('synthesize_query', { query });
            setResponse(result);
        } catch (error) {
            console.error('Failed to ask brain:', error);
            setResponse('**Error:** Failed to connect to the Neural Core. Please ensure Ollama is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle with Cmd+K handler should be in parent or global hook, 
    // but if this is mounted conditionally, it handles its own internal logic.

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'b' && (e.metaKey || e.ctrlKey) && e.altKey) {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        }


        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-neutral-950/80 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white border border-neutral-200 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                <Command label="Ask Brain" className="w-full">
                    <div className="flex items-center border-b border-neutral-200 px-3" cmdk-input-wrapper="">
                        <Sparkles className="w-5 h-5 text-primary mr-2 animate-pulse" />
                        <Command.Input
                            value={query}
                            onValueChange={setQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && query.length > 0 && !isLoading) {
                                    e.preventDefault();
                                    handleAskAI();
                                }
                            }}
                            className="w-full bg-transparent border-none outline-none py-4 text-lg text-neutral-900 placeholder-neutral-400 font-medium"
                            placeholder="Ask your brain anything..."
                        />
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-neutral-500 text-sm">
                            {query.length > 0 ? "No results found. Press Enter to ask AI." : "Start typing to search..."}
                        </Command.Empty>

                        {query.length > 0 && !response && !isLoading && (
                            <Command.Group heading="Actions">
                                <Command.Item
                                    onSelect={handleAskAI}
                                    className="flex items-center gap-2 px-3 py-3 border rounded-none text-neutral-900 hover:bg-neutral-50 cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors border-neutral-200"
                                >
                                    <Brain className="w-4 h-4 text-primary" />
                                    <span>Ask AI: "{query}"</span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {isLoading && (
                            <div className="p-8 flex flex-col items-center justify-center text-neutral-600 space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm font-medium animate-pulse">Synthesizing neural connections...</p>
                            </div>
                        )}

                        {response && (
                            <div className="p-4 bg-neutral-50 border border-neutral-200 mx-2 mt-2">
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{response}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <Command.Group heading="Recent Cards" className="mt-2 text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider px-2">
                            <Command.Item className="flex items-center gap-2 px-3 py-2 border rounded-none text-neutral-700 hover:bg-neutral-50 cursor-pointer aria-selected:bg-neutral-100 transition-colors text-sm font-sans font-normal normal-case border-neutral-200">
                                <FileText className="w-4 h-4 text-neutral-500" />
                                <span>Project Phoenix Methodology</span>
                            </Command.Item>
                            <Command.Item className="flex items-center gap-2 px-3 py-2 border rounded-none text-neutral-700 hover:bg-neutral-50 cursor-pointer aria-selected:bg-neutral-100 transition-colors text-sm font-sans font-normal normal-case border-neutral-200">
                                <FileText className="w-4 h-4 text-neutral-500" />
                                <span>Q4 Marketing Strategy</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
