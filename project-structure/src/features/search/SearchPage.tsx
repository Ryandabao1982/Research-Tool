import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Folder, Tag, Calendar, ArrowRight } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { NoteCard } from '../../shared/components/NoteCard';
import { Card } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';

export function SearchPage() {
    const { searchService } = useServices();
    const [query, setQuery] = useState('');

    // 1. Search Logic
    const { data: results, isLoading } = useQuery({
        queryKey: ['search', query],
        queryFn: () => searchService.search(query, { limit: 20 }),
        enabled: query.length > 1,
    });

    // 2. Suggestions Logic (Mocked in service)
    const { data: suggestions } = useQuery({
        queryKey: ['suggestions', query],
        queryFn: () => searchService.getSuggestions(query),
        enabled: query.length > 1 && query.length < 10,
    });

    return (
        <div className="p-10 max-w-5xl mx-auto space-y-12 animate-fade-in min-h-screen">
            <header className="space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vibe-blue/10 border border-vibe-blue/20 text-vibe-blue text-[10px] font-bold uppercase tracking-[0.2em] mx-auto">
                    <Sparkles className="w-3 h-3" />
                    Neural Retrieval Engine
                </div>
                <h2 className="text-5xl font-black tracking-tighter">
                    Search Your <span className="text-vibe-blue shadow-vibe-blue/20">Knowledge.</span>
                </h2>

                <div className="max-w-2xl mx-auto">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search keywords, #tags, or project names..."
                        icon={Search}
                        className="text-lg py-6 rounded-3xl"
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Left Sidebar: Filters */}
                <aside className="space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Discovery Filters</h4>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-xs h-10" icon={Folder}>Archives</Button>
                            <Button variant="ghost" className="w-full justify-start text-xs h-10" icon={Tag}>Taxonomy</Button>
                            <Button variant="ghost" className="w-full justify-start text-xs h-10" icon={Calendar}>Timeline</Button>
                        </div>
                    </div>

                    {suggestions && suggestions.length > 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Suggestions</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-vibe-blue/30 hover:text-vibe-blue transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Right Content: Results */}
                <div className="md:col-span-3 space-y-6">
                    {query.length <= 1 ? (
                        <Card variant="glass" className="h-[400px] flex flex-col items-center justify-center text-center p-12 border-dashed">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready to explore?</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                Type at least 2 characters to trigger the high-performance FTS5 search engine.
                            </p>
                        </Card>
                    ) : isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 glass rounded-3xl animate-pulse bg-white/5" />
                            ))}
                        </div>
                    ) : results && results.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                    {results.length} Matches found
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-500/80 uppercase">Real-time index</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {results.map((result) => (
                                    <Card
                                        key={result.note_id}
                                        interactive
                                        className="p-5 flex items-center justify-between group"
                                        onClick={() => window.location.hash = `/notes/${result.note_id}`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg group-hover:text-vibe-blue transition-colors">{result.title}</h3>
                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground font-mono">
                                                    {(result.relevance_score * 100).toFixed(0)}% match
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{result.content_snippet}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-vibe-blue transition-all group-hover:translate-x-1" />
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card variant="glass" className="h-[400px] flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-red-500/30" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No intelligence found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                The term "{query}" does not appear in your knowledge base. Try adjusting your query or tags.
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Bottom Visualization Hint */}
            <Card variant="glow" className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-vibe-blue/10">
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xl font-bold">Visual Discovery</h4>
                    <p className="text-sm text-muted-foreground">Switch to the Graph View to see how these search results are connected silimar topics.</p>
                </div>
                <Button variant="secondary" icon={Sparkles}>Open Graph</Button>
            </Card>
        </div>
    );
}
