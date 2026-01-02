import React from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '../../shared/components/layout/TopBar';
import { Card, StatCard, QuickActionCard, SectionHeader } from '../../shared/components/dashboard/Card';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-50"
    >
      <TopBar title="Dashboard" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Quick Actions */}
        <SectionHeader 
          title="Quick Actions" 
          action={{ label: 'View All Notes', onClick: () => navigate('/notes') }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            action={{
              id: 'new-note',
              title: 'New Note',
              description: 'Create a knowledge note',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
              shortcut: 'Ctrl+N'
            }}
            onClick={() => navigate('/notes/new')}
          />
          <QuickActionCard
            action={{
              id: 'capture',
              title: 'Quick Capture',
              description: 'Rapid thought capture',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
              shortcut: 'Alt+Space'
            }}
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', altKey: true }))}
          />
          <QuickActionCard
            action={{
              id: 'ask-ai',
              title: 'Ask AI',
              description: 'Synthesize insights',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              shortcut: 'Ctrl+B'
            }}
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, altKey: true }))}
          />
        </div>

        {/* Stats */}
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Notes"
            value={42}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            trend={{ value: 12, label: 'this month' }}
            color="blue"
          />
          <StatCard
            title="Active Folders"
            value={8}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
            color="green"
          />
          <StatCard
            title="Tags"
            value={15}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            color="orange"
          />
        </div>

        {/* Recent Notes */}
        <SectionHeader title="Recent Notes" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover onClick={() => navigate('/notes')}>
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-lg">Project Architecture</h3>
              <p className="font-sans text-sm text-neutral-600 line-clamp-2">
                Design system implementation for Rational Grid with 8px spacing...
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">ID: abc123</span>
                <span className="font-mono text-xs text-neutral-500">2h ago</span>
              </div>
            </div>
          </Card>
          <Card hover onClick={() => navigate('/notes')}>
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-lg">Meeting Notes</h3>
              <p className="font-sans text-sm text-neutral-600 line-clamp-2">
                Q4 planning session with team leads and stakeholders...
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">ID: def456</span>
                <span className="font-mono text-xs text-neutral-500">5h ago</span>
              </div>
            </div>
          </Card>
          <Card hover onClick={() => navigate('/notes')}>
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-lg">Research Ideas</h3>
              <p className="font-sans text-sm text-neutral-600 line-clamp-2">
                Exploring new approaches to knowledge management...
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">ID: ghi789</span>
                <span className="font-mono text-xs text-neutral-500">1d ago</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </motion.div>
  );
}