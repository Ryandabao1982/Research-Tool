import React, { useState, useMemo } from 'react';
import Layout from '../layout';
import { cn } from '@/shared/utils';
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
  LinkIcon,
  PlusIcon,
  StarIcon,
  ChevronRightIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    id: 'daily-note',
    title: 'Daily Note',
    description: 'Start your daily reflection',
    icon: <ClockIcon className="w-5 h-5" />,
    shortcut: 'Ctrl+D',
    action: 'daily-note'
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
  },
  {
    id: '3',
    title: 'Figma Design System',
    content: 'Building a comprehensive design system with components...',
    createdAt: new Date(Date.now() - 10800000),
    updatedAt: new Date(Date.now() - 7200000),
    tags: ['design', 'figma'],
    isFavorite: true
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
  },
  {
    id: '3',
    type: 'link_created',
    details: 'Connected "ML Basics" to "Deep Learning"',
    timestamp: new Date(Date.now() - 5400000)
  },
  {
    id: '4',
    type: 'ai_interaction',
    details: 'Generated summary for 3 notes',
    timestamp: new Date(Date.now() - 7200000)
  }
];

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [recentNotes] = useState<Note[]>(mockNotes);
  const [recentActivity] = useState<RecentActivity[]>(mockActivities);

  const handleQuickAction = (actionId: string) => {
    console.log('Action triggered:', actionId);
  };

  const handleNoteClick = (noteId: string) => {
    console.log('Note clicked:', noteId);
  };

  const handleFavoriteToggle = (noteId: string) => {
    console.log('Favorite toggled:', noteId);
  };

  const handleViewAllNotes = () => {
    console.log('View all notes');
  };

  const handleViewAllActivity = () => {
    console.log('View all activity');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"
            style={{ filter: 'blur(100px)' }}
          />
          
          <div className="relative z-10 space-y-6 p-6 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
                    KnowledgeBase Pro
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Your AI-powered research assistant
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <SparklesIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionHeader
                title="Quick Actions"
                delay={0.15}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onClick={() => handleQuickAction(action.id)}
                  delay={0.25 + (index * 0.05)}
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                title="Total Notes"
                value={stats.totalNotes}
                icon={<FileTextIcon className="w-5 h-5" />}
                trend={{ value: 12, label: 'this month' }}
                color="blue"
                delay={0.35}
              />
              <StatCard
                title="Favorites"
                value={stats.favoriteNotesCount}
                icon={<StarIcon className="w-5 h-5" />}
                trend={{ value: 5, label: 'this week' }}
                color="purple"
                delay={0.4}
              />
              <StatCard
                title="Folders"
                value={stats.totalFolders}
                icon={<FolderIcon className="w-5 h-5" />}
                color="green"
                delay={0.45}
              />
              <StatCard
                title="Total Words"
                value={stats.totalWords}
                icon={<TagIcon className="w-5 h-5" />}
                trend={{ value: 8, label: 'this week' }}
                color="pink"
                delay={0.5}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader
                  title="Recent Notes"
                  action={{
                    label: 'View All',
                    onClick: handleViewAllNotes
                  }}
                  delay={0.6}
                />
                <div className="space-y-3">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note, index) => (
                      <RecentNoteCard
                        key={note.id}
                        note={note}
                        onClick={() => handleNoteClick(note.id)}
                        onFavorite={() => handleFavoriteToggle(note.id)}
                        delay={0.65 + (index * 0.1)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<FileTextIcon className="w-12 h-12 text-slate-400" />}
                      title="No notes yet"
                      description="Start by creating your first knowledge note"
                      action={{
                        label: 'Create Note',
                        onClick: () => handleQuickAction('new-note')
                      }}
                      delay={0.65}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader
                  title="Recent Activity"
                  action={{
                    label: 'View All',
                    onClick: handleViewAllActivity
                  }}
                  delay={0.6}
                />
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      delay={0.65 + (index * 0.08)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
