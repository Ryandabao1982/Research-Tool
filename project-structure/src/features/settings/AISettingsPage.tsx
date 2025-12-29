import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Settings, BrainCircuit, Zap, Database, Shield, Key, 
    Save, RotateCcw, Download, Upload, Check, X, AlertCircle,
    Monitor, HardDrive, Cpu, Sliders
} from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { AIModel, AIProviderConfig, ProviderType } from '../../shared/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AISettingsProps {
    className?: string;
}

export function AISettings({ className }: AISettingsProps) {
    const { aiService } = useServices();
    const queryClient = useQueryClient();
    
    // State
    const [selectedProvider, setSelectedProvider] = useState<ProviderType>('Ollama');
    const [apiKey, setApiKey] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('http://localhost:11434');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [streaming, setStreaming] = useState(true);
    const [includeCitations, setIncludeCitations] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [gpuAcceleration, setGpuAcceleration] = useState(true);
    const [memoryLimit, setMemoryLimit] = useState(4096);
    const [customModelPath, setCustomModelPath] = useState('');
    
    // UI State
    const [showApiToken, setShowApiToken] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    // Queries
    const { data: models = [], isLoading: modelsLoading } = useQuery({
        queryKey: ['ai-models'],
        queryFn: () => aiService.getAvailableModels(),
        refetchInterval: 30000,
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['ai-providers'],
        queryFn: async () => [
            {
                id: 'ollama',
                name: 'Ollama',
                type: 'Ollama' as ProviderType,
                status: 'connected',
                modelCount: models.length,
                lastSync: new Date().toISOString()
            }
        ]
    });

    // Mutations
    const saveSettingsMutation = useMutation({
        mutationFn: async (settings: any) => {
            // Save to local storage for now (would be backend in real implementation)
            localStorage.setItem('kb-ai-settings', JSON.stringify(settings));
            
            // Apply settings to AI service
            if (selectedProvider === 'Ollama') {
                await aiService.registerProvider('ollama', {
                    provider_type: 'Ollama',
                    api_endpoint: apiEndpoint,
                                    api_key: apiKey || undefined,
                                    model: 'phi3.1:mini',
                                    model_id: 'phi3.1:mini',
                    enabled: true,
                    priority: 1
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-models'] });
        }
    });

    const testConnectionMutation = useMutation({
        mutationFn: async () => {
            setIsTestingConnection(true);
            setConnectionStatus('testing');
            
            try {
                // Test connection to AI service
                await aiService.getAvailableModels();
                setConnectionStatus('success');
                setTimeout(() => setConnectionStatus('idle'), 3000);
            } catch (error) {
                setConnectionStatus('error');
                setTimeout(() => setConnectionStatus('idle'), 3000);
                throw error;
            } finally {
                setIsTestingConnection(false);
            }
        }
    });

    const resetSettingsMutation = useMutation({
        mutationFn: async () => {
            localStorage.removeItem('kb-ai-settings');
            
            // Reset to defaults
            setApiKey('');
            setApiEndpoint('http://localhost:11434');
            setTemperature(0.7);
            setMaxTokens(2048);
            setStreaming(true);
            setIncludeCitations(true);
            setAutoSave(true);
            setGpuAcceleration(true);
            setMemoryLimit(4096);
            setCustomModelPath('');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-models'] });
        }
    });

    // Load settings on mount
    useEffect(() => {
        const saved = localStorage.getItem('kb-ai-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            setApiKey(settings.apiKey || '');
            setApiEndpoint(settings.apiEndpoint || 'http://localhost:11434');
            setTemperature(settings.temperature ?? 0.7);
            setMaxTokens(settings.maxTokens ?? 2048);
            setStreaming(settings.streaming ?? true);
            setIncludeCitations(settings.includeCitations ?? true);
            setAutoSave(settings.autoSave ?? true);
            setGpuAcceleration(settings.gpuAcceleration ?? true);
            setMemoryLimit(settings.memoryLimit ?? 4096);
            setCustomModelPath(settings.customModelPath || '');
        }
    }, []);

    const handleSaveSettings = () => {
        saveSettingsMutation.mutate({
            selectedProvider,
            apiKey,
            apiEndpoint,
            temperature,
            maxTokens,
            streaming,
            includeCitations,
            autoSave,
            gpuAcceleration,
            memoryLimit,
            customModelPath
        });
    };

    const handleTestConnection = () => {
        testConnectionMutation.mutate();
    };

    const handleExportSettings = () => {
        const settings = {
            selectedProvider,
            apiKey,
            apiEndpoint,
            temperature,
            maxTokens,
            streaming,
            includeCitations,
            autoSave,
            gpuAcceleration,
            memoryLimit,
            customModelPath
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kb-ai-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target?.result as string);
                    setApiKey(settings.apiKey || '');
                    setApiEndpoint(settings.apiEndpoint || 'http://localhost:11434');
                    setTemperature(settings.temperature ?? 0.7);
                    setMaxTokens(settings.maxTokens ?? 2048);
                    setStreaming(settings.streaming ?? true);
                    setIncludeCitations(settings.includeCitations ?? true);
                    setAutoSave(settings.autoSave ?? true);
                    setGpuAcceleration(settings.gpuAcceleration ?? true);
                    setMemoryLimit(settings.memoryLimit ?? 4096);
                    setCustomModelPath(settings.customModelPath || '');
                } catch (error) {
                    console.error('Failed to import settings:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Card className={cn("h-full overflow-y-auto", className)}>
            <div className="p-8 space-y-8">
                
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-vibe-blue/10 flex items-center justify-center border border-vibe-blue/20">
                            <Settings className="text-vibe-blue w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight">AI Settings</h2>
                            <p className="text-sm text-white/40">Configure your AI assistants and models</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportSettings}
                            className="hidden"
                            id="import-settings"
                        />
                        <label htmlFor="import-settings">
                            <Button variant="ghost" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Import
                            </Button>
                        </label>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExportSettings}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetSettingsMutation.mutate()}
                            disabled={resetSettingsMutation.isPending}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </header>

                {/* Provider Configuration */}
                <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        AI Provider
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {providers.map(provider => (
                            <div
                                key={provider.id}
                                onClick={() => setSelectedProvider(provider.type)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all",
                                    selectedProvider === provider.type
                                        ? "border-vibe-blue bg-vibe-blue/5"
                                        : "border-white/10 hover:border-white/20 bg-white/5"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">{provider.name}</h4>
                                        <p className="text-sm text-white/40">
                                            {provider.modelCount} models available
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        provider.status === 'connected' ? "bg-green-500" : "bg-red-500"
                                    )} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* API Configuration */}
                {selectedProvider === 'Ollama' && (
                    <section className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            API Configuration
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">API Endpoint</label>
                                <input
                                    type="text"
                                    value={apiEndpoint}
                                    onChange={(e) => setApiEndpoint(e.target.value)}
                                    placeholder="http://localhost:11434"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-vibe-blue/40"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">API Key (Optional)</label>
                                <div className="relative">
                                    <input
                                        type={showApiToken ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter your API key"
                                        className="w-full px-3 py-2 pr-20 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-vibe-blue/40"
                                    />
                                    <button
                                        onClick={() => setShowApiToken(!showApiToken)}
                                        className="absolute right-2 top-2 text-white/40 hover:text-white/60"
                                    >
                                        {showApiToken ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestConnection}
                                    disabled={isTestingConnection}
                                >
                                    {isTestingConnection ? (
                                        <>
                                            <Monitor className="w-4 h-4 mr-2 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-2" />
                                            Test Connection
                                        </>
                                    )}
                                </Button>
                                
                                {connectionStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-green-500">
                                        <Check className="w-4 h-4" />
                                        <span className="text-sm">Connection successful</span>
                                    </div>
                                )}
                                
                                {connectionStatus === 'error' && (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Connection failed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Model Settings */}
                <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Model Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Temperature: {temperature.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white/40 mt-1">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Max Tokens: {maxTokens}
                            </label>
                            <input
                                type="range"
                                min="128"
                                max="4096"
                                step="128"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white/40 mt-1">
                                <span>128</span>
                                <span>4096</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={streaming}
                                onChange={(e) => setStreaming(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Enable streaming responses</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeCitations}
                                onChange={(e) => setIncludeCitations(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Include citations</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoSave}
                                onChange={(e) => setAutoSave(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Auto-save conversations</span>
                        </label>
                    </div>
                </section>

                {/* Performance Settings */}
                <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Performance
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Memory Limit: {memoryLimit}MB
                            </label>
                            <input
                                type="range"
                                min="1024"
                                max="8192"
                                step="512"
                                value={memoryLimit}
                                onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white/40 mt-1">
                                <span>1GB</span>
                                <span>8GB</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={gpuAcceleration}
                                    onChange={(e) => setGpuAcceleration(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">GPU acceleration</span>
                            </label>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Custom Model Path
                                </label>
                                <input
                                    type="text"
                                    value={customModelPath}
                                    onChange={(e) => setCustomModelPath(e.target.value)}
                                    placeholder="/path/to/models/"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-vibe-blue/40"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Available Models */}
                <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Available Models
                    </h3>
                    
                    {modelsLoading ? (
                        <div className="flex items-center gap-2 text-white/40">
                            <Monitor className="w-4 h-4 animate-spin" />
                            <span>Loading models...</span>
                        </div>
                    ) : models.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {models.map(model => (
                                <div key={model.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-semibold">{model.name}</h4>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            model.requires_gpu ? "bg-orange-500" : "bg-green-500"
                                        )} />
                                    </div>
                                    
                                    <p className="text-sm text-white/60 mb-3">{model.description}</p>
                                    
                                    <div className="space-y-1 text-xs text-white/40">
                                        <div className="flex justify-between">
                                            <span>Context:</span>
                                            <span>{model.context_length.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Size:</span>
                                            <span>{model.size_mb}MB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>GPU:</span>
                                            <span>{model.requires_gpu ? 'Required' : 'Optional'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1 mt-3">
                                        {model.capabilities.includes('Streaming') && (
                                            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[9px] rounded border border-blue-500/30">
                                                Streaming
                                            </div>
                                        )}
                                        {model.capabilities.includes('ChatCompletion') && (
                                            <div className="px-2 py-1 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30">
                                                Chat
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-white/40">
                            <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No models available. Check your connection settings.</p>
                        </div>
                    )}
                </section>

                {/* Save Button */}
                <footer className="flex justify-between items-center pt-6 border-t border-white/10">
                    <p className="text-sm text-white/40">
                        Settings are saved locally and applied immediately
                    </p>
                    
                    <Button
                        onClick={handleSaveSettings}
                        disabled={saveSettingsMutation.isPending}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                </footer>
            </div>
        </Card>
    );
}