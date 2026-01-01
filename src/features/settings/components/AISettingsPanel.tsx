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

    if (!status) return <div className="text-gray-500 text-sm">Loading AI Status...</div>;

    return (
        <div className="bg-surface-100 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center border border-brand-blue/20">
                        <Sparkles className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg tracking-tight">Local Intelligence Engine</h2>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Qwen 2.5 0.5B Instruct (Quantized)</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full border ${status.downloaded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'} text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                   {status.downloaded ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                   {status.downloaded ? 'Ready' : 'Missing'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <HardDrive className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Disk Usage</span>
                    </div>
                    <p className="text-2xl font-black text-white">{(status.model_size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center items-start">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</p>
                    <p className="text-xs font-mono text-gray-300 break-all">{status.model_path}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                 {status.downloaded && (
                    <button 
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset / Delete Model
                    </button>
                 )}
            </div>
        </div>
    );
};
