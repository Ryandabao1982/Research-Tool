import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Download,
    Upload,
    Database,
    History,
    FileJson,
    FileText,
    Briefcase,
    RefreshCw,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { toast } from 'react-hot-toast';

export function ImportExportPage() {
    const { fsService, noteService } = useServices();
    const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'pdf'>('markdown');

    // 1. Fetch Stats for Export
    const { data: notes } = useQuery({
        queryKey: ['notes-for-export'],
        queryFn: () => noteService.listNotes(),
    });

    // 2. Mutations
    const backupMutation = useMutation({
        mutationFn: () => fsService.createBackup('backup_path'),
        onSuccess: (data) => {
            toast.success(`Vault backup complete: ${(data.size / 1024 / 1024).toFixed(2)}MB`);
        }
    });

    const exportMutation = useMutation({
        mutationFn: () => fsService.exportNotes(notes?.map(n => n.id) || [], selectedFormat as any),
        onSuccess: () => {
            toast.success(`Exporting as ${selectedFormat.toUpperCase()}...`);
        }
    });

    const importMutation = useMutation({
        mutationFn: () => fsService.importFiles(['mock_path']),
        onSuccess: (data) => {
            toast.success(`Succesfully merged ${data.imported_count} research entities.`);
        }
    });

    return (
        <div className="p-10 max-w-[1200px] mx-auto space-y-12 animate-fade-in min-h-screen relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-vibe-cyan/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />

            <header className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibe-cyan/10 border border-vibe-cyan/20 text-vibe-cyan text-[10px] font-bold uppercase tracking-widest">
                    Vault Portability
                </div>
                <h2 className="text-6xl font-black tracking-tighter">
                    Sync & <span className="text-vibe-cyan">Port.</span>
                </h2>
                <p className="text-muted-foreground text-sm font-medium max-w-xl">
                    Your data belongs to you. Export your entire knowledge base into standard formats or create encrypted local backups.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Import & Export Tools */}
                <section className="space-y-8">
                    <Card variant="glass" className="p-8 space-y-6 hover:translate-y-[-4px] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-vibe-cyan/10 border border-vibe-cyan/20 flex items-center justify-center">
                                <Upload className="text-vibe-cyan" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Import Knowledge</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Bulk-import Markdown vaults, Notion exports, or Obsidian archives. Advanced parsing ensures your tags and folders are preserved.
                        </p>
                        <div className="space-y-4 pt-4">
                            <Button
                                variant="primary"
                                className="w-full h-14 bg-vibe-cyan hover:bg-vibe-cyan/80 text-black font-black"
                                onClick={() => importMutation.mutate()}
                                loading={importMutation.isPending}
                            >
                                SELECT FOLDER / ZIP
                            </Button>
                            <p className="text-[10px] text-center font-bold text-white/20 uppercase tracking-widest">
                                Fast local parsing • No telemetry
                            </p>
                        </div>
                    </Card>

                    <Card variant="glass" className="p-8 space-y-6 hover:translate-y-[-4px] transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-vibe-blue/10 border border-vibe-blue/20 flex items-center justify-center">
                                    <Download className="text-vibe-blue" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Data Export</h3>
                            </div>
                            <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                                {(['markdown', 'json', 'pdf'] as const).map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setSelectedFormat(fmt)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedFormat === fmt ? 'bg-vibe-blue text-white shadow-lg shadow-vibe-blue/20' : 'text-white/20 hover:text-white/40'
                                            }`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Export all {notes?.length || 0} notes currently in your database. Includes metadata, properties, and linked attachments.
                        </p>
                        <Button
                            variant="glow"
                            className="w-full h-14"
                            onClick={() => exportMutation.mutate()}
                            loading={exportMutation.isPending}
                            icon={Briefcase}
                        >
                            GENERATE {selectedFormat.toUpperCase()} BUNDLE
                        </Button>
                    </Card>
                </section>

                {/* Backup & History */}
                <section className="space-y-8">
                    <Card variant="solid" className="p-0 overflow-hidden border-white/5 bg-zinc-950/40">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                            <div className="flex items-center gap-4">
                                <Database className="text-vibe-purple" />
                                <h3 className="font-bold">Encrypted Local Backups</h3>
                            </div>
                            <History className="text-white/10 w-5 h-5" />
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <ShieldCheck className="text-green-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-tight">Latest Backup</div>
                                        <div className="text-[10px] font-medium text-white/20">Dec 28, 2025 • 42.4 MB</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase">Rollback</Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-white/40">Auto-Backup Frequency</span>
                                    <span className="text-xs font-black text-vibe-purple uppercase tracking-widest">Every 6 Hours</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-vibe-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full bg-zinc-800 hover:bg-zinc-700 h-14"
                                onClick={() => backupMutation.mutate()}
                                loading={backupMutation.isPending}
                                icon={RefreshCw}
                            >
                                TRIGGER MANUAL SNAPSHOT
                            </Button>
                        </div>
                    </Card>

                    <Card variant="glass" className="p-6 border-red-500/10 bg-red-500/[0.02]">
                        <div className="flex gap-4">
                            <AlertCircle className="text-red-500 w-6 h-6 shrink-0" />
                            <div className="space-y-2">
                                <h4 className="font-bold text-red-500">Atomic Cleanup</h4>
                                <p className="text-xs text-red-500/60 leading-relaxed">
                                    Irreversibly wipe your local database and cache. Ensure you have a valid backup bundle before proceeding with this action.
                                </p>
                                <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors mt-2">
                                    Wipe Database & Nucleus
                                </button>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Visual Noise Layer */}
            <div className="absolute inset-0 noise-overlay opacity-[0.02] pointer-events-none" />
        </div>
    );
}
