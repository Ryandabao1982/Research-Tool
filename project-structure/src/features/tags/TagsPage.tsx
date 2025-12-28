import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag as TagIcon, FolderPlus, Hash, Search, Plus, Trash2, Edit3, Palette } from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { FolderTree } from '../../shared/components/FolderTree';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { toast } from 'react-hot-toast';

export function TagsPage() {
    const { noteService } = useServices();
    const queryClient = useQueryClient();
    const [selectedFolderId, setSelectedFolderId] = useState<string>();

    // 1. Fetch Data
    const { data: folders } = useQuery({
        queryKey: ['folders'],
        queryFn: () => noteService.listFolders(),
    });

    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: () => noteService.listTags(),
    });

    // 2. Mutations
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => noteService.createFolder(name, selectedFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            toast.success('Collection established');
        },
    });

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12 animate-fade-in min-h-screen">
            <header className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibe-purple/10 border border-vibe-purple/20 text-vibe-purple text-[10px] font-bold uppercase tracking-widest">
                    Taxonomy & Organization
                </div>
                <h2 className="text-6xl font-black tracking-tighter">
                    Master <span className="text-vibe-purple">Structure.</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
                    Categorize your knowledge through hierarchical folders and multi-dimensional tags.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left: Folders Taxonomy */}
                <section className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                            <FolderPlus size={14} /> Hierarchical Tree
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => createFolderMutation.mutate('New Group')}
                        >
                            <Plus size={16} />
                        </Button>
                    </div>

                    <Card variant="solid" className="p-2 min-h-[500px] border-white/5 bg-zinc-900/40 backdrop-blur-md">
                        {folders && (
                            <FolderTree
                                folders={folders}
                                selectedId={selectedFolderId}
                                onSelect={setSelectedFolderId}
                                onCreateSubfolder={(pid) => {
                                    setSelectedFolderId(pid);
                                    createFolderMutation.mutate('Sub-collection');
                                }}
                            />
                        )}
                        {!folders?.length && (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
                                <FolderPlus size={48} className="mb-4" />
                                <p className="text-sm font-bold">No collections found</p>
                            </div>
                        )}
                    </Card>
                </section>

                {/* Right: Tag System */}
                <section className="lg:col-span-8 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                                <Hash size={14} /> Dimensional Tags
                            </h3>
                            <div className="flex items-center gap-2">
                                <Input placeholder="Filter tags..." icon={Search} className="py-2 text-xs w-48" />
                                <Button variant="secondary" size="sm" icon={Plus}>New Tag</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {tags?.map(tag => (
                                <Card
                                    key={tag.id}
                                    variant="glass"
                                    interactive
                                    className="p-4 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                                            style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40` }}
                                        >
                                            <TagIcon size={18} style={{ color: tag.color }} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight group-hover:text-vibe-purple transition-colors">
                                                #{tag.name}
                                            </h4>
                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
                                                24 Entries
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white"><Edit3 size={14} /></button>
                                        <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions / Integration */}
                    <Card variant="glow" className="p-8 border-vibe-purple/10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-vibe-purple/10 flex items-center justify-center border border-vibe-purple/20">
                            <Palette className="text-vibe-purple" size={32} />
                        </div>
                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <h4 className="text-xl font-bold">Taxonomy Management</h4>
                            <p className="text-sm text-muted-foreground max-w-lg">
                                Organizing your knowledge early prevents the "digital swamp." Use semantic tags for cross-referencing and folders for physical containment.
                            </p>
                        </div>
                        <Button variant="primary">Bulk Action</Button>
                    </Card>
                </section>
            </div>
        </div>
    );
}
