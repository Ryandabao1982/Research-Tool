import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Settings,
    Puzzle,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Shield,
    Download,
    Terminal
} from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { toast } from 'react-hot-toast';

export function SettingsPage() {
    const { pluginService } = useServices();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'general' | 'plugins' | 'security'>('plugins');

    // 1. Fetch Plugins
    const { data: plugins, isLoading } = useQuery({
        queryKey: ['plugins'],
        queryFn: () => pluginService.listPlugins(),
    });

    // 2. Mutations
    const togglePluginMutation = useMutation({
        mutationFn: ({ id, enabled }: { id: string, enabled: boolean }) =>
            pluginService.togglePlugin(id, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plugins'] });
            toast.success('System configuration updated');
        },
    });

    const loadPluginMutation = useMutation({
        mutationFn: (path: string) => pluginService.loadPlugin(path),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plugins'] });
            toast.success('New enhancement registered');
        },
    });

    return (
        <div className="p-10 max-w-[1200px] mx-auto space-y-12 animate-fade-in min-h-screen">
            <header className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibe-purple/10 border border-vibe-purple/20 text-vibe-purple text-[10px] font-bold uppercase tracking-widest">
                    Control Center
                </div>
                <h2 className="text-6xl font-black tracking-tighter">
                    System <span className="text-vibe-purple">Nucleus.</span>
                </h2>

                <div className="flex gap-4 border-b border-white/5 pt-6">
                    {['general', 'plugins', 'security'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-vibe-purple border-b-2 border-vibe-purple' : 'text-white/20 hover:text-white/40'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'plugins' && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">Plugin Registry</h3>
                            <p className="text-sm text-muted-foreground">Extend your second brain with custom JavaScript modules.</p>
                        </div>
                        <Button variant="glow" icon={Plus} onClick={() => loadPluginMutation.mutate('C:/Plugins/NewExtension.js')}>
                            Load Plugin
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            [1, 2].map(i => <Card key={i} className="h-48 animate-pulse" />)
                        ) : plugins?.map(plugin => (
                            <Card key={plugin.manifest.id} variant="glass" className="p-6 flex flex-col justify-between group h-56">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Puzzle className={plugin.enabled ? "text-vibe-purple" : "text-white/10"} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-none">{plugin.manifest.name}</h4>
                                                <span className="text-[10px] font-medium text-white/20">v{plugin.manifest.version} by {plugin.manifest.author}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => togglePluginMutation.mutate({ id: plugin.manifest.id, enabled: !plugin.enabled })}
                                            className="transition-colors"
                                        >
                                            {plugin.enabled ? (
                                                <ToggleRight className="text-vibe-purple w-8 h-8" />
                                            ) : (
                                                <ToggleLeft className="text-white/10 w-8 h-8" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{plugin.manifest.description}</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] uppercase font-bold" icon={Settings}>Config</Button>
                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] uppercase font-bold text-red-400" icon={Trash2}>Remove</Button>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/10" />
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card variant="solid" className="p-8 border-dashed border-2 border-white/5 flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-zinc-900 flex items-center justify-center border border-white/10">
                            <Terminal className="text-white/20" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="font-bold">Dynamic Enhancement Runtime</h4>
                            <p className="text-sm text-muted-foreground">All plugins run in a secured sandbox with scoped access to the KnowledgeBase API.</p>
                        </div>
                        <Button variant="secondary">API Docs</Button>
                    </Card>
                </section>
            )}

            {activeTab === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card variant="glass" className="p-8 space-y-4">
                        <Shield className="text-vibe-purple w-12 h-12" />
                        <h4 className="text-xl font-bold">Biometric Vault</h4>
                        <p className="text-sm text-muted-foreground">Require fingerprint or face ID to open specific folders or private research notes.</p>
                        <Button variant="secondary" className="w-full">Enable Vault</Button>
                    </Card>
                    <Card variant="glass" className="p-8 space-y-4">
                        <Download className="text-vibe-purple w-12 h-12" />
                        <h4 className="text-xl font-bold">Local Encryption</h4>
                        <p className="text-sm text-muted-foreground">Your knowledge base is encrypted using AES-256-GCM. Rotate your master key here.</p>
                        <Button variant="secondary" className="w-full">Rotate Keys</Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
