import React from 'react';
import Layout from '../layout';

export default function SettingsPage() {
    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">System Configuration</p>
                    <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-100">AI Model</span>
                            <span className="text-blue-400 font-mono text-xs">knowledge-core-v1.0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-100">Search Engine</span>
                            <span className="text-blue-400 font-mono text-xs">SQLite FTS5</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-zinc-100">Storage Location</span>
                            <span className="text-blue-400 font-mono text-xs">Local / Sovereign</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
