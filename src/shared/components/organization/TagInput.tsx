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

    const deleteTagMutation = useMutation({
        mutationFn: (tagId: string) => organizationService.unlinkTagFromNote(noteId, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['note-tags', noteId] });
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
                <TagIcon className="w-3 h-3 text-neutral-600" />
                <label className="font-mono text-xs text-neutral-600 uppercase tracking-wider">Tags</label>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-neutral-50 border border-neutral-200">
                {noteTags.map((tag) => (
                    <div
                        key={tag.id}
                        className="flex items-center gap-1.5 px-3 py-1 border rounded-none bg-primary/10 border-primary/20 group transition-colors"
                    >
                        <span className="font-mono text-xs font-bold text-primary">#{tag.name}</span>
                        <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteTagMutation.mutate(tag.id)}
                        >
                            <X className="w-2.5 h-2.5 text-primary hover:text-neutral-900" />
                        </button>
                    </div>
                ))}

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tag..."
                    className="flex-1 bg-transparent border-none outline-none font-mono text-xs font-bold text-neutral-500 placeholder:text-neutral-300 min-w-[80px] py-1"
                />
            </div>
        </div>
    );
};
