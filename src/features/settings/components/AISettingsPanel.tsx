import React, { useEffect, useState } from 'react';
import { aiService, ModelStatus } from '../../../shared/services/aiService';
import { Sparkles, Trash2, RefreshCw, HardDrive, CheckCircle2 } from 'lucide-react';

export const AISettingsPanel = () => {
    const [status, setStatus] = useState<ModelStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const s = await aiService.getModelStatus();
            setStatus(s);
        } catch (e) {
            console.error("Failed to fetch model status", e);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete the local AI model? It will need to be re-downloaded to work.")) return;
        setIsLoading(true);
        try {
            await aiService.deleteModel();
            await fetchStatus();
        } catch (e) {
            console.error("Failed to delete model", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!status) return <div className="font-sans text-neutral-600 text-sm">Loading AI Status...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-sans font-bold text-neutral-900 text-lg">Local Intelligence Engine</h2>
                        <p className="font-mono text-xs font-medium text-neutral-600 uppercase tracking-wider">Qwen 2.5 0.5B Instruct (Quantized)</p>
                    </div>
                </div>
                <div className={`
                    px-3 py-1 border rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2
                    ${status.downloaded 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'}
                `}>
                    {status.downloaded ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                    {status.downloaded ? 'Ready' : 'Missing'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 border border-neutral-200 p-4">
                    <div className="flex items-center gap-2 text-neutral-600 mb-2">
                        <HardDrive className="w-4 h-4" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider">Disk Usage</span>
                    </div>
                    <p className="font-sans text-2xl font-bold text-neutral-900">{(status.model_size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 p-4 flex flex-col justify-center items-start">
                    <p className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Location</p>
                    <p className="font-mono text-xs text-neutral-700 break-all">{status.model_path}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                 {status.downloaded && (
                    <button 
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="rg-btn rg-btn-secondary text-red-600 hover:text-red-700 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset / Delete Model
                    </button>
                 )}
            </div>
        </div>
    );
};