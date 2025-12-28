import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { NoteCard } from '../../shared/components/NoteCard';
import { toast } from 'react-hot-toast';

export function NotesPage() {
    const { noteService } = useServices();
    const queryClient = useQueryClient();

    // 1. Fetch Notes
    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: () => noteService.listNotes({ limit: 50 }),
    });

    // 2. Create Note Mutation
    const createMutation = useMutation({
        mutationFn: () => noteService.createNote({
            title: 'New Research Note',
            content: 'Start writing your thoughts here...',
            tags: ['research', 'new'],
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success('Note created');
        },
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in h-full flex flex-col">
            {/* Header Actions */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        Notes
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {notes?.length || 0} items found in your knowledge base
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-vibe-purple transition-colors" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-vibe-purple/50 transition-all text-sm"
                        />
                    </div>
                    <button className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-vibe-purple text-white rounded-xl hover:bg-vibe-purple/80 hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-vibe-purple/20 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create</span>
                    </button>
                </div>
            </header>

            {/* Grid Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 glass rounded-3xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : notes && notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {notes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onClick={(n) => console.log('Open note:', n.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-lg font-medium">No notes discovered yet.</p>
                    <button
                        onClick={() => createMutation.mutate()}
                        className="text-vibe-purple font-bold hover:underline"
                    >
                        Create your first entry
                    </button>
                </div>
            )}
        </div>
    );
}
