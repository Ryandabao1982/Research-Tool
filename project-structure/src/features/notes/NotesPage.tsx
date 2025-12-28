import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { NoteCard } from '../../shared/components/NoteCard';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { toast } from 'react-hot-toast';

export function NotesPage() {
    const { noteService } = useServices();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Fetch Notes
    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes', searchQuery],
        queryFn: () => noteService.listNotes({
            limit: 50,
            search: searchQuery
        }),
    });

    // 2. Create Note Mutation
    const createMutation = useMutation({
        mutationFn: () => noteService.createNote({
            title: 'New Research Entry',
            content: 'Start capturing your insights...',
            tags: ['research'],
        }),
        onSuccess: (newNote) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success('Discovered new knowledge', {
                icon: '✨',
                style: {
                    borderRadius: '16px',
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid rgba(168,85,247,0.2)',
                },
            });
            navigate(`/notes/${newNote.id}`);
        },
    });

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12 animate-fade-in min-h-screen flex flex-col">
            {/* Header Section */}
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibe-purple/10 border border-vibe-purple/20 text-vibe-purple text-[10px] font-bold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vibe-purple opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-vibe-purple"></span>
                        </span>
                        Live Knowledge Base
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter leading-none">
                        Deep <span className="text-vibe-purple">Storage.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
                        Manage your digital garden of {notes?.length || 0} interconnected notes.
                        Search through your second brain instantly.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 shadow-inner">
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl text-white/20">
                            <List className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        variant="glow"
                        size="lg"
                        icon={Plus}
                        onClick={() => createMutation.mutate()}
                        loading={createMutation.isPending}
                    >
                        New Entry
                    </Button>
                </div>
            </section>

            {/* Filter & Search Bar */}
            <Card variant="glass" className="p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <Input
                        placeholder="Search through titles and content..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none bg-transparent focus:bg-transparent"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                    <Button variant="ghost" icon={Filter} size="sm">Filters</Button>
                    <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                    <span className="text-[10px] uppercase font-bold text-white/20 tracking-tighter hidden md:block">
                        Sort: Recent
                    </span>
                </div>
            </Card>

            {/* Grid Content */}
            <div className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <Card key={i} className="h-64 animate-pulse-slow" />
                        ))}
                    </div>
                ) : notes && notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {notes.map((note: any, index: number) => (
                            <div
                                key={note.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <NoteCard
                                    note={note}
                                    onClick={(n) => navigate(`/notes/${n.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-vibe-purple/20 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center rotate-12">
                                <Search className="w-10 h-10 text-white/20 -rotate-12" />
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <h3 className="text-2xl font-bold">No knowledge found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                No notes match your current search criteria. Try a different query or create a fresh entry.
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => setSearchQuery('')}>Clear Search</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
