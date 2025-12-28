import { invoke } from '@tauri-apps/api/tauri';
import {
    Plugin,
    PluginManifest,
    PluginService,
    PluginSettings
} from '../types';

/**
 * Implementation of the PluginService for KnowledgeBase Pro.
 * Manages side-loading and lifecycle of JavaScript plugins.
 */
export class TauriPluginService implements PluginService {
    async listPlugins(): Promise<Plugin[]> {
        return await invoke<Plugin[]>('plugin_list');
    }

    async loadPlugin(path: string): Promise<Plugin> {
        return await invoke<Plugin>('plugin_load', { path });
    }

    async unloadPlugin(id: string): Promise<void> {
        await invoke('plugin_unload', { id });
    }

    async togglePlugin(id: string, enabled: boolean): Promise<void> {
        await invoke('plugin_toggle', { id, enabled });
    }

    async getSettings(id: string): Promise<PluginSettings> {
        return await invoke<PluginSettings>('plugin_get_settings', { id });
    }

    async saveSettings(id: string, settings: PluginSettings): Promise<void> {
        await invoke('plugin_save_settings', { id, settings });
    }
}

/**
 * Local fallback for plugin management.
 * Simulates a plugin registry in localStorage.
 */
export class LocalPluginService implements PluginService {
    private getStorage(): Plugin[] {
        const data = localStorage.getItem('kb_pro_plugins');
        if (!data) {
            const seed: Plugin[] = [
                {
                    manifest: {
                        id: 'neural-linker',
                        name: 'Neural Linker',
                        version: '1.2.0',
                        author: 'Antigravity Internal',
                        description: 'Automatically scans your research for mentions of other notes and suggests bidirectional links.',
                        entry: 'neural-linker/index.ts'
                    },
                    enabled: true,
                    settings: {
                        autoSuggest: true,
                        minConfidence: 0.7
                    }
                },
                {
                    manifest: {
                        id: 'p1',
                        name: 'Vibrant Graph',
                        version: '1.0.0',
                        author: 'ResearchTeam',
                        description: 'Adds custom color palettes to the knowledge graph visualization.',
                        entry: 'index.js'
                    },
                    enabled: true,
                    settings: {}
                },
                {
                    manifest: {
                        id: 'p2',
                        name: 'PDF Intelligence',
                        version: '0.9.0',
                        author: 'NeuralCorp',
                        description: 'Enables deep-scanning of PDF attachments for the AI Assistant.',
                        entry: 'main.js'
                    },
                    enabled: false,
                    settings: {}
                }
            ];
            localStorage.setItem('kb_pro_plugins', JSON.stringify(seed));
            return seed;
        }
        return JSON.parse(data);
    }

    async listPlugins(): Promise<Plugin[]> {
        return this.getStorage();
    }

    async loadPlugin(path: string): Promise<Plugin> {
        const plugins = this.getStorage();
        const newPlugin: Plugin = {
            manifest: {
                id: crypto.randomUUID(),
                name: `Plugin from ${path.split('/').pop()}`,
                version: '1.0.0',
                author: 'Unknown',
                description: 'Dynamically loaded external enhancement.',
                entry: 'index.js'
            },
            enabled: true,
            settings: {}
        };
        plugins.push(newPlugin);
        localStorage.setItem('kb_pro_plugins', JSON.stringify(plugins));
        return newPlugin;
    }

    async unloadPlugin(id: string): Promise<void> {
        const plugins = this.getStorage().filter(p => p.manifest.id !== id);
        localStorage.setItem('kb_pro_plugins', JSON.stringify(plugins));
    }

    async togglePlugin(id: string, enabled: boolean): Promise<void> {
        const plugins = this.getStorage().map(p =>
            p.manifest.id === id ? { ...p, enabled } : p
        );
        localStorage.setItem('kb_pro_plugins', JSON.stringify(plugins));
    }

    async getSettings(id: string): Promise<PluginSettings> {
        const plugin = this.getStorage().find(p => p.manifest.id === id);
        return plugin?.settings || {};
    }

    async saveSettings(id: string, settings: PluginSettings): Promise<void> {
        const plugins = this.getStorage().map(p =>
            p.manifest.id === id ? { ...p, settings } : p
        );
        localStorage.setItem('kb_pro_plugins', JSON.stringify(plugins));
    }
}
