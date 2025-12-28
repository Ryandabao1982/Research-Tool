import React, { createContext, useContext, useMemo } from 'react';
import { NoteService, SearchService } from '../types';
import { TauriNoteService, LocalNoteService } from './noteService';
import { TauriSearchService, LocalSearchService } from './searchService';

interface ServiceContextType {
    noteService: NoteService;
    searchService: SearchService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};

interface ServiceProviderProps {
    children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
    const services = useMemo(() => {
        // Detect if we are in a Tauri environment
        const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

        return {
            noteService: isTauri ? new TauriNoteService() : new LocalNoteService(),
            searchService: isTauri ? new TauriSearchService() : new LocalSearchService(),
        };
    }, []);

    return (
        <ServiceContext.Provider value={services}>
            {children}
        </ServiceContext.Provider>
    );
};
