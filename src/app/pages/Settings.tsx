import React from 'react';
import Layout from '../layout';
import { AISettingsPanel } from '../../features/settings/components/AISettingsPanel';
import { TopBar } from '../../shared/components/layout/TopBar';

export default function SettingsPage() {
    return (
        <Layout>
            <div className="flex flex-col h-screen bg-background relative overflow-hidden">
                <TopBar title="Settings" />
                
                <main className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 py-8">
                        
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">Intelligence</h2>
                            <AISettingsPanel />
                        </section>

                        <section className="opacity-50 pointer-events-none">
                            <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                            <div className="bg-surface-100 border border-white/10 rounded-3xl p-8">
                                <p className="text-gray-500 text-sm">Backup & Restore features coming soon.</p>
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </Layout>
    );
}
