import React, { useState } from 'react';
import Layout from '../layout';
import { 
  StatCard, 
  QuickActionCard, 
  RecentNoteCard, 
  ActivityItem, 
  EmptyState,
  SectionHeader 
} from '@/shared/components/dashboard/Card';
import type { 
  Note 
} from '@/shared/types';
import type { 
  DashboardStats, 
  QuickAction, 
  RecentActivity 
} from '@/shared/types/dashboard';
import { 
  FileTextIcon, 
  SparklesIcon, 
  SearchIcon, 
  TagIcon,
  ClockIcon,
  FolderIcon,
  PlusIcon,
  StarIcon,
  SettingsIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const quickActions: QuickAction[] = [
  {
    id: 'new-note',
    title: 'New Note',
    description: 'Create a new knowledge note',
    icon: <PlusIcon className="w-5 h-5" />,
    shortcut: 'Ctrl+N',
    action: 'create-note'
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    description: 'Chat with your AI assistant',
    icon: <SparklesIcon className="w-5 h-5" />,
    shortcut: 'Ctrl+K',
    action: 'ai-chat'
  },
  {
    id: 'search',
    title: 'Search Notes',
    description: 'Find anything instantly',
    icon: <SearchIcon className="w-5 h-5" />,
    shortcut: 'Ctrl+F',
    action: 'search'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure your workspace',
    icon: <SettingsIcon className="w-5 h-5" />,
    action: 'settings'
  }
];

const mockStats: DashboardStats = {
  totalNotes: 142,
  totalFolders: 8,
  totalTags: 23,
  recentNotesCount: 12,
  favoriteNotesCount: 28,
  dailyNotesCount: 45,
  totalWords: 28456,
  linksCreated: 67
};

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    content: 'Understanding neural networks and backpropagation algorithms...',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 1800000),
    tags: ['ml', 'ai'],
    isFavorite: true
  },
  {
    id: '2',
    title: 'React Server Components',
    content: 'Exploring the new paradigm with RSC and Next.js 13...',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
    tags: ['react', 'frontend'],
    isFavorite: false
  }
];

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'note_created',
    noteTitle: 'Machine Learning Fundamentals',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: '2',
    type: 'note_updated',
    noteTitle: 'React Server Components',
    details: 'Added section on streaming',
    timestamp: new Date(Date.now() - 3600000)
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats] = useState<DashboardStats>(mockStats);
  const [recentNotes] = useState<Note[]>(mockNotes);
  const [recentActivity] = useState<RecentActivity[]>(mockActivities);

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'create-note' || actionId === 'new-note') {
      navigate('/notes');
    }
    console.log('Action triggered:', actionId);
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-5rem)]">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" style={{ filter: 'blur(100px)' }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, User</h1>
            <p className="text-slate-400">Here's what's happening in your knowledge base today.</p>
          </motion.div>

          {/* Quick Actions Section */}
          <div className="space-y-4">
            <SectionHeader title="Quick Actions" delay={0.1} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onClick={() => handleQuickAction(action.id)}
                  delay={0.15 + (index * 0.05)}
                />
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Notes"
              value={stats.totalNotes}
              icon={<FileTextIcon className="w-5 h-5" />}
              trend={{ value: 12, label: 'this month' }}
              color="blue"
              delay={0.3}
            />
            <StatCard
              title="Favorites"
              value={stats.favoriteNotesCount}
              icon={<StarIcon className="w-5 h-5" />}
              color="purple"
              delay={0.35}
            />
            <StatCard
              title="Folders"
              value={stats.totalFolders}
              icon={<FolderIcon className="w-5 h-5" />}
              color="green"
              delay={0.4}
            />
            <StatCard
              title="Tags"
              value={stats.totalTags}
              icon={<TagIcon className="w-5 h-5" />}
              color="pink"
              delay={0.45}
            />
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Notes */}
            <div className="lg:col-span-2 space-y-4">
              <SectionHeader
                title="Recent Notes"
                action={{
                  label: 'View All',
                  onClick: () => navigate('/notes')
                }}
                delay={0.5}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note, index) => (
                    <RecentNoteCard
                      key={note.id}
                      note={note}
                      onClick={() => navigate('/notes')}
                      delay={0.55 + (index * 0.1)}
                    />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={<FileTextIcon className="w-12 h-12 text-slate-400" />}
                      title="No notes yet"
                      description="Start by creating your first knowledge note"
                      action={{
                        label: 'Create Note',
                        onClick: () => navigate('/notes')
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
              <SectionHeader title="Recent Activity" delay={0.5} />
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    delay={0.6 + (index * 0.08)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
