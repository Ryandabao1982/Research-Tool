/**
 * Main App component that serves as the root of the application
 * Handles routing, layout, and global state management
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from './MainLayout';
import { useTheme } from '../shared/theme/ThemeProvider';

// Pages
import { NotesPage } from '../features/notes/NotesPage';
import { GraphPage } from '../features/graph/GraphPage';
import { SearchPage } from '../features/search/SearchPage';
import { TagsPage } from '../features/tags/TagsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ImportExportPage } from '../features/import-export/ImportExportPage';

export function App() {
    // Theme is handled at the root ThemeProvider level, 
    // but we can access it here if needed.
    const { isDark } = useTheme();

    return (
        <div className={isDark ? 'dark' : 'light'}>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Navigate to="/notes" replace />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/graph" element={<GraphPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/tags" element={<TagsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/import-export" element={<ImportExportPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/notes" replace />} />
                </Routes>
            </MainLayout>
        </div>
    );
}