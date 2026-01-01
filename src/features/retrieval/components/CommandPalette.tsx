import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { invoke } from '@tauri-apps/api/tauri';
import { Search, FileText, Command as CommandIcon, Plus, Settings, Shield } from 'lucide-react';
import { useNotesStore } from '../../../shared/hooks/useNotesStore';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
}

interface ActiveFilter {
    type: 'tag' | 'created';
    value: string;
}

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [showFilterHint, setShowFilterHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setSelectedNoteId } = useNotesStore();
    const navigate = useNavigate();

    // Parse filters from query
    const parseFilters = useCallback((input: string): { searchQuery: string, filters: ActiveFilter[] } => {
        const filters: ActiveFilter[] = [];
        const terms: string[] = [];

        for (const term of input.split(/\s+/)) {
            const match = term.match(/^(\w+):(.+)/);
            if (match && match[1] && match[2]) {
                const type = match[1];
                const value = match[2];
                if (value.trim()) {
                    switch (type.toLowerCase()) {
                        case 'tag':
                            filters.push({ type: 'tag', value: value.trim() });
                            break;
                        case 'created':
                            filters.push({ type: 'created', value: value.trim() });
                            break;
                        default:
                            terms.push(term);
                            break;
                    }
                }
            } else {
                terms.push(term);
            }
        }

        return {
            searchQuery: terms.join(' '),
            filters,
        };
    }, []);

    const buildSearchQuery = useCallback((): string => {
        if (activeFilters.length === 0) return query;

        const filterStrings = activeFilters.map(f => `${f.type}:${f.value}`);
        const searchTerms = query.split(/\s+/)
            .filter(term => !term.includes(':'));

        return [...searchTerms, ...filterStrings].join(' ');
    }, [query, activeFilters]);

    // Debounced Search with Filters
    useEffect(() => {
        const performSearch = async () => {
            if (query.trim().length === 0 && activeFilters.length === 0) {
                setResults([]);
                setActiveFilters([]);
                return;
            }

            setIsLoading(true);
            try {
                const searchQuery = buildSearchQuery();
                const searchResults = await invoke<SearchResult[]>('search_notes', { query: searchQuery });
                setResults(searchResults);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => {
            clearTimeout(timer);
            setIsLoading(false);
        };
    }, [query, activeFilters, buildSearchQuery]);

    // Remove filter
    const removeFilter = (filterToRemove: ActiveFilter) => {
        setActiveFilters(prev => prev.filter(f => 
            !(f.type === filterToRemove.type && f.value === filterToRemove.value)
        ));
    };

    // Handle input change
    const handleInputChange = (value: string) => {
        setQuery(value);
        
        // Show filter hint when typing ':'
        const hasColonAtEnd = value.endsWith(':');
        setShowFilterHint(hasColonAtEnd && !value.includes(' ') && !value.match(/^(\w+):/));
        
        // Auto-detect filter type
        if (hasColonAtEnd) {
            const match = value.match(/^(\w+):$/);
            if (match && match[1]) {
                const filterType = match[1].toLowerCase();
                if (['tag', 'created'].includes(filterType)) {
                    setShowFilterHint(false);
                }
            }
        }
    };

    // Handle Global Key
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const onSelect = useCallback((id: string) => {
        setOpen(false);
        setSelectedNoteId(id);
        navigate('/notes');
    }, [navigate, setSelectedNoteId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-zinc-950/80">
            <div className="w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none overflow-hidden">
                <Command label="Command Palette" className="w-full">
                    <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4">
                        <Search className="w-4 h-4 text-zinc-400 mr-3" />
                        <Command.Input
                            value={query}
                            onValueChange={handleInputChange}
                            autoFocus
                            className="w-full bg-transparent border-none outline-none py-4 text-sm font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
                            placeholder="Search notes or type '>' for commands..."
                        />
                        {isLoading && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2" />
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {activeFilters.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
                            {activeFilters.map(filter => (
                                <div
                                    key={`${filter.type}:${filter.value}`}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-[9px] font-mono text-zinc-700 dark:text-zinc-200"
                                >
                                    <span className="font-semibold">{filter.type}:</span>
                                    <span>{filter.value}</span>
                                    <button
                                        onClick={() => removeFilter(filter)}
                                        className="ml-2 hover:bg-red-100 dark:hover:bg-red-900 rounded p-0.5 transition-colors"
                                        aria-label={`Remove ${filter.type} filter`}
                                    >
                                        <span className="text-xs">×</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filter Hint */}
                    {showFilterHint && (
                        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                            <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold">Available filters:</span>
                                <span className="ml-2 text-blue-600 dark:text-blue-400">tag:</span>
                                <span className="ml-2 text-blue-600 dark:text-blue-400">created:</span>
                                <span className="ml-2 text-zinc-500 dark:text-zinc-400">(e.g., tag:work, created:today)</span>
                            </div>
                        </div>
                    )}

                    <Command.List className="max-h-[50vh] overflow-y-auto p-2 font-sans overflow-x-hidden">
                        <Command.Empty className="py-6 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                            NO RESULTS FOUND
                        </Command.Empty>

                        {query.startsWith('>') ? (
                            <Command.Group heading="SYSTEM COMMANDS" className="px-2 pb-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/notes/new'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                                >
                                    <Plus className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs font-bold">CREATE NEW NOTE</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/settings'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                                >
                                    <Settings className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs font-bold">OPEN SETTINGS</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/dashboard'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                                >
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs font-bold">MANAGE DASHBOARD</span>
                                </Command.Item>
                            </Command.Group>
                        ) : (
                            <Command.Group heading="RELEVANT NOTES" className="px-2 pb-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                {results.map((res) => (
                                    <Command.Item
                                        key={res.id}
                                        onSelect={() => onSelect(res.id)}
                                        className="flex flex-col gap-1 px-3 py-3 border border-transparent bg-transparent transition-all cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 mb-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-blue-500" />
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{res.title}</span>
                                            <span className="ml-auto text-[9px] font-mono text-zinc-500">{res.id.substring(0, 8)}</span>
                                        </div>
                                        {res.snippet && (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: res.snippet }}
                                                className="text-[10px] font-mono text-zinc-500 pl-5 line-clamp-1 leading-relaxed"
                                            />
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="flex items-center justify-between px-3 py-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 text-[9px] font-mono text-zinc-400">ESC</span>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">CLOSE</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 text-[9px] font-mono text-zinc-400">ENTER</span>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">OPEN</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-40">
                            <CommandIcon className="w-3 h-3 text-zinc-500" />
                            <span className="text-[9px] font-mono font-bold text-zinc-500">NEURAL SEARCH v2.0</span>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
};
