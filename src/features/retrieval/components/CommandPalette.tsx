import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { invoke } from '@tauri-apps/api/tauri';
import { Search, FileText, Command as CommandIcon, Plus, Settings, Shield, Globe, X, Info } from 'lucide-react';
import { useNotesStore } from '../../../shared/hooks/useNotesStore';
import { useNavigate } from 'react-router-dom';
import { useRoleStore, UserRole } from '../../../shared/stores/role-store';

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
}

interface SearchResultWithMetadata {
    results: SearchResult[];
    role_filter_applied: boolean;
    role_filter_type: string | null;
    global_search_active: boolean;
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
    const [globalSearch, setGlobalSearch] = useState(false);
    const [roleFilterInfo, setRoleFilterInfo] = useState<{ applied: boolean; type: string | null }>({ applied: false, type: null });
    
    const { setSelectedNoteId } = useNotesStore();
    const navigate = useNavigate();
    const { activeRole, setRole } = useRoleStore();

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

    // Debounced Search with Filters and Role Awareness
    useEffect(() => {
        const performSearch = async () => {
            if (query.trim().length === 0 && activeFilters.length === 0) {
                setResults([]);
                setActiveFilters([]);
                setRoleFilterInfo({ applied: false, type: null });
                return;
            }

            setIsLoading(true);
            try {
                const searchQuery = buildSearchQuery();
                const searchResults = await invoke<SearchResultWithMetadata>('search_notes', { 
                    query: searchQuery,
                    role: globalSearch ? null : activeRole,
                    globalSearch: globalSearch
                });
                setResults(searchResults.results);
                setRoleFilterInfo({ 
                    applied: searchResults.role_filter_applied, 
                    type: searchResults.role_filter_type 
                });
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
    }, [query, activeFilters, buildSearchQuery, activeRole, globalSearch]);

    // Real-time search update on role switch
    useEffect(() => {
        if (open && query.trim().length > 0) {
            // Re-run search immediately when role changes
            const performSearch = async () => {
                setIsLoading(true);
                try {
                    const searchQuery = buildSearchQuery();
                    const searchResults = await invoke<SearchResultWithMetadata>('search_notes', { 
                        query: searchQuery,
                        role: globalSearch ? null : activeRole,
                        globalSearch: globalSearch
                    });
                    setResults(searchResults.results);
                    setRoleFilterInfo({ 
                        applied: searchResults.role_filter_applied, 
                        type: searchResults.role_filter_type 
                    });
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            performSearch();
        }
    }, [activeRole]);

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

    // Toggle global search
    const toggleGlobalSearch = () => {
        setGlobalSearch(prev => !prev);
    };

    // Get role display label
    const getRoleLabel = (role: UserRole): string => {
        switch (role) {
            case 'learner': return 'Learner';
            case 'manager': return 'Manager';
            case 'coach': return 'Coach';
            default: return 'Unknown';
        }
    };

    // Get role filter description
    const getRoleFilterDescription = (): string => {
        if (globalSearch) {
            return 'Global search active - role filters bypassed';
        }
        if (!roleFilterInfo.applied || !roleFilterInfo.type) {
            return `Current role: ${getRoleLabel(activeRole)} (no filters)`;
        }
        switch (roleFilterInfo.type) {
            case 'learner': return 'Learner Mode: Excluding #work notes';
            case 'manager': return 'Manager Mode: Prioritizing #project notes';
            case 'coach': return 'Coach Mode: Prioritizing #coaching/#template notes';
            default: return `Role: ${roleFilterInfo.type}`;
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-neutral-950/80">
            <div className="w-full max-w-2xl border border-neutral-200 bg-white shadow-none overflow-hidden">
                <Command label="Command Palette" className="w-full">
                    {/* Header with Search Input */}
                    <div className="flex items-center border-b border-neutral-200 px-4">
                        <Search className="w-4 h-4 text-neutral-400 mr-3" />
                        <Command.Input
                            value={query}
                            onValueChange={handleInputChange}
                            autoFocus
                            className="w-full bg-transparent border-none outline-none py-4 text-sm font-sans text-neutral-900 placeholder-neutral-500"
                            placeholder="Search notes or type '>' for commands..."
                        />
                        {isLoading && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                        )}
                    </div>

                    {/* Role Filter Indicator Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-600">ROLE:</span>
                            <span className={`px-2 py-0.5 border ${globalSearch ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-neutral-300 bg-white text-neutral-700'}`}>
                                {getRoleLabel(activeRole)}
                            </span>
                            {roleFilterInfo.applied && !globalSearch && (
                                <span className="text-primary font-semibold">
                                    {roleFilterInfo.type === 'learner' ? 'EXCLUDE #work' : 
                                     roleFilterInfo.type === 'manager' ? 'PRIORITIZE #project' : 
                                     roleFilterInfo.type === 'coach' ? 'PRIORITIZE #coaching' : ''}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={toggleGlobalSearch}
                            className={`flex items-center gap-1 px-2 py-0.5 border transition-colors ${globalSearch ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-600'}`}
                            title="Toggle Global Search (bypass role filters)"
                        >
                            <Globe className="w-3 h-3" />
                            <span>{globalSearch ? 'GLOBAL' : 'ROLE'}</span>
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {activeFilters.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 border-t border-neutral-100 flex-wrap">
                            {activeFilters.map(filter => (
                                <div
                                    key={`${filter.type}:${filter.value}`}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 bg-primary/10 font-mono text-[9px] text-neutral-900"
                                >
                                    <span className="font-semibold">{filter.type}:</span>
                                    <span>{filter.value}</span>
                                    <button
                                        onClick={() => removeFilter(filter)}
                                        className="ml-2 hover:bg-red-100 border border-transparent rounded-none p-0.5 transition-colors"
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
                        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200">
                            <div className="font-mono text-[10px] text-neutral-600">
                                <span className="font-semibold">Available filters:</span>
                                <span className="ml-2 text-primary">tag:</span>
                                <span className="ml-2 text-primary">created:</span>
                                <span className="ml-2 text-neutral-500">(e.g., tag:work, created:today)</span>
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    <Command.List className="max-h-[50vh] overflow-y-auto p-2 font-sans overflow-x-hidden">
                        <Command.Empty className="py-6 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
                            NO RESULTS FOUND
                        </Command.Empty>

                        {query.startsWith('>') ? (
                            <Command.Group heading="SYSTEM COMMANDS" className="px-2 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/notes/new'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-neutral-200 bg-transparent hover:bg-neutral-50 transition-all cursor-pointer aria-selected:bg-neutral-100"
                                >
                                    <Plus className="w-4 h-4 text-neutral-400" />
                                    <span className="font-sans text-xs font-bold">CREATE NEW NOTE</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/settings'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-neutral-200 bg-transparent hover:bg-neutral-50 transition-all cursor-pointer aria-selected:bg-neutral-100"
                                >
                                    <Settings className="w-4 h-4 text-neutral-400" />
                                    <span className="font-sans text-xs font-bold">OPEN SETTINGS</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => { setOpen(false); navigate('/dashboard'); }}
                                    className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-neutral-200 bg-transparent hover:bg-neutral-50 transition-all cursor-pointer aria-selected:bg-neutral-100"
                                >
                                    <Shield className="w-4 h-4 text-neutral-400" />
                                    <span className="font-sans text-xs font-bold">MANAGE DASHBOARD</span>
                                </Command.Item>
                            </Command.Group>
                        ) : (
                            <Command.Group heading="RELEVANT NOTES" className="px-2 pb-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                                {results.map((res) => (
                                    <Command.Item
                                        key={res.id}
                                        onSelect={() => onSelect(res.id)}
                                        className="flex flex-col gap-1 px-3 py-3 border border-transparent bg-transparent transition-all cursor-pointer aria-selected:bg-neutral-100 mb-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-primary" />
                                            <span className="font-sans text-xs font-bold text-neutral-900">{res.title}</span>
                                            <span className="ml-auto font-mono text-[9px] text-neutral-500">{res.id.substring(0, 8)}</span>
                                        </div>
                                        {res.snippet && (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: res.snippet }}
                                                className="font-mono text-[10px] text-neutral-500 pl-5 line-clamp-1 leading-relaxed"
                                            />
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    {/* Footer with Controls */}
                    <div className="flex items-center justify-between px-3 py-2 mt-2 border-t border-neutral-200 pt-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 border border-neutral-200 font-mono text-[9px] text-neutral-500">ESC</span>
                                <span className="font-mono text-[9px] text-neutral-500 uppercase">CLOSE</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 border border-neutral-200 font-mono text-[9px] text-neutral-500">ENTER</span>
                                <span className="font-mono text-[9px] text-neutral-500 uppercase">OPEN</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                            <Info className="w-3 h-3 text-neutral-500" />
                            <span className="font-mono text-[9px] font-bold text-neutral-500">
                                {getRoleFilterDescription()}
                            </span>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
};
