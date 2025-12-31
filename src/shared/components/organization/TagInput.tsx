import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService, Tag } from '../../services/organizationService';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { cn } from '../../utils';

interface TagInputProps {
    noteId: string;
}

export const TagInput: React.FC<TagInputProps> = ({ noteId }) => {
    const queryClient = useQueryClient();
    const [inputValue, setInputValue] = useState('');

    const { data: noteTags = [], isLoading: isLoadingNoteTags } = useQuery({
        queryKey: ['note-tags', noteId],
        queryFn: () => organizationService.getNoteTags(noteId),
        enabled: !!noteId,
    });

    const createTagMutation = useMutation({
        mutationFn: async (name: string) => {
            const tag = await organizationService.createTag(name);
            await organizationService.linkTagToNote(noteId, tag.id);
            return tag;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['note-tags', noteId] });
            setInputValue('');
        },
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            createTagMutation.mutate(inputValue.trim());
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <TagIcon className="w-3 h-3 text-gray-600" />
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Tags</label>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                {noteTags.map((tag) => (
                    <div
                        key={tag.id}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full group transition-colors"
                    >
                        <span className="text-[10px] font-bold text-brand-blue">#{tag.name}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-2.5 h-2.5 text-brand-blue hover:text-white" />
                        </button>
                    </div>
                ))}

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tag..."
                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-gray-400 placeholder:text-gray-700 min-w-[80px] py-1"
                />
            </div>
        </div>
    );
};
