import { useState } from 'react';
import { Search, X, Plus, Hash, Check } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tag } from '../../shared/types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TagSelectorProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    onClose: () => void;
}

export function TagSelector({ selectedTags, onTagsChange, onClose }: TagSelectorProps) {
    const { noteService } = useServices();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: allTags } = useQuery({
        queryKey: ['tags'],
        queryFn: () => noteService.listTags(),
    });

    const filteredTags = allTags?.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            onTagsChange(selectedTags.filter(t => t !== tagName));
        } else {
            onTagsChange([...selectedTags, tagName]);
        }
    };

    const addNewTag = () => {
        const trimmed = searchQuery.trim().toLowerCase();
        if (trimmed && !selectedTags.includes(trimmed)) {
            onTagsChange([...selectedTags, trimmed]);
            setSearchQuery('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-full mt-4 left-0 w-80 z-30"
        >
            <div className="glass-dark border border-white/10 rounded-3xl p-5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-vibe-purple">Taxonomy Manager</h3>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search or create tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNewTag()}
                            icon={Search}
                            className="bg-white/5 border-white/5 h-10 text-xs"
                        />
                        {searchQuery && !filteredTags.some((t: Tag) => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
                            <button
                                onClick={addNewTag}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-vibe-blue hover:text-vibe-blue/80 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                            >
                                <Plus size={12} /> Create
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto scrollbar-hidden space-y-1">
                        {filteredTags.length > 0 ? (
                            filteredTags.map((tag: Tag) => {
                                const isSelected = selectedTags.includes(tag.name);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300",
                                            isSelected ? "bg-vibe-purple/10 text-white" : "hover:bg-white/5 text-white/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} className={cn(isSelected ? "text-vibe-purple" : "text-white/20")} />
                                            <span className="text-xs font-medium">{tag.name}</span>
                                        </div>
                                        {isSelected && <Check size={12} className="text-vibe-purple" />}
                                    </button>
                                );
                            })
                        ) : searchQuery ? (
                            <div className="py-4 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                Hit enter to create "{searchQuery}"
                            </div>
                        ) : (
                            <div className="py-4 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                No tags discovered yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                    {selectedTags.map(tag => (
                        <div
                            key={tag}
                            className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg bg-vibe-purple/10 text-vibe-purple border border-vibe-purple/20"
                        >
                            {tag}
                            <button onClick={() => toggleTag(tag)}>
                                <X size={8} />
                            </button>
                        </div>
                    ))}
                    {selectedTags.length === 0 && (
                        <div className="text-[9px] font-bold text-white/10 italic">No tags associated with this resonance</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
