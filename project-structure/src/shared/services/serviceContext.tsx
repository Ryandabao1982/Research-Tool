import React, { createContext, useContext, useMemo } from 'react';
import { NoteService, SearchService, AIService, PluginService } from '../types';
import { TauriNoteService, LocalNoteService } from './noteService';
import { TauriSearchService, LocalSearchService } from './searchService';
import { TauriAIService, LocalAIService } from './aiService';
import { TauriPluginService, LocalPluginService } from './pluginService';

interface ServiceContextType {
    noteService: NoteService;
    searchService: SearchService;
    aiService: AIService;
    pluginService: PluginService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function useServices() {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
}

interface ServiceProviderProps {
    children: React.ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
    const services = useMemo(() => {
        // Determine if we're running in Tauri or a browser
        const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;

        return {
            noteService: isTauri ? new TauriNoteService() : new LocalNoteService(),
            searchService: isTauri ? new TauriSearchService() : new LocalSearchService(),
            aiService: isTauri ? new TauriAIService() : new LocalAIService(),
            pluginService: isTauri ? new TauriPluginService() : new LocalPluginService(),
        };
    }, []);

    return (
        <ServiceContext.Provider value={services}>
            {children}
        </ServiceContext.Provider>
    );
}
