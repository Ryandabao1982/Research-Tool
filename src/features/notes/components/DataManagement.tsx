import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { toast } from 'sonner';
import { Download, Upload, ShieldCheck, Database, FileText } from 'lucide-react';

export const DataManagement: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleImport = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Folder to Import Markdown Files',
            });

            if (selected && typeof selected === 'string') {
                setIsImporting(true);
                const count = await invoke<number>('import_files', { path: selected });
                toast.success(`Successfully imported ${count} notes`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to import files');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExport = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Destination for Export',
            });

            if (selected && typeof selected === 'string') {
                setIsExporting(true);
                await invoke('export_notes', { path: selected });
                toast.success('Successfully exported all notes');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to export notes');
        } finally {
            setIsExporting(false);
        }
    };

    const handleBackup = async () => {
        try {
            const selected = await save({
                filters: [{
                    name: 'SQLite Database',
                    extensions: ['db', 'sqlite']
                }],
                title: 'Save Database Backup',
            });

            if (selected) {
                setIsBackingUp(true);
                await invoke('create_backup', { path: selected });
                toast.success('Database backup created successfully');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    return (
        <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Data Sovereignty</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {/* Import */}
                <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 text-left"
                >
                    <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">IMPORT</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">MD Files → DB</span>
                    </div>
                    {isImporting && <span className="ml-auto text-[8px] animate-pulse font-mono text-blue-400">BUSY</span>}
                </button>

                {/* Export */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 text-left"
                >
                    <Download className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">EXPORT</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">DB → MD Files</span>
                    </div>
                    {isExporting && <span className="ml-auto text-[8px] animate-pulse font-mono text-blue-400">BUSY</span>}
                </button>

                {/* Backup */}
                <button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 text-left"
                >
                    <ShieldCheck className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">BACKUP</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">Secure DB Copy</span>
                    </div>
                    {isBackingUp && <span className="ml-auto text-[8px] animate-pulse font-mono text-blue-400">BUSY</span>}
                </button>
            </div>

            <div className="p-3 bg-white/5 border border-white/5">
                <div className="flex items-start gap-2">
                    <FileText className="w-3 h-3 text-zinc-600 mt-0.5" />
                    <p className="text-[9px] text-zinc-500 font-mono leading-tight uppercase">
                        LOCAL-FIRST DATA OWNERSHIP. NO CLOUD OVERWRITE.
                    </p>
                </div>
            </div>
        </div>
    );
};
