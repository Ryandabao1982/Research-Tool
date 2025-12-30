import React from 'react';
import Layout from '../layout';
import { 
  StatCard, 
  QuickActionCard, 
  RecentNoteCard, 
  ActivityItem, 
  EmptyState,
  SectionHeader 
} from '../../shared/components/dashboard/Card';
import type { 
  Note 
} from '../../shared/types';
import type { 
  QuickAction, 
  RecentActivity 
} from '../../shared/types/dashboard';
import { 
  FileTextIcon, 
  SparklesIcon, 
  SearchIcon, 
  TagIcon,
  FolderIcon,
  PlusIcon,
  StarIcon,
  SettingsIcon,
  ClockIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../../shared/hooks/useNotesStore';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { notes } = useNotesStore();

  const recentNotes = notes.slice(0, 4);
  
  const stats = {
    totalNotes: notes.length,
    favorites: notes.filter(n => (n as any).isFavorite).length,
    folders: 0,
    tags: Array.from(new Set(notes.flatMap(n => (n as any).tags || []))).length
  };

  const recentActivity: RecentActivity[] = notes.slice(0, 5).map(note => ({
    id: note.id,
    type: 'note_updated',
    noteTitle: note.title,
    timestamp: note.updatedAt
  }));

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'create-note' || actionId === 'new-note') {
      navigate('/notes');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" 
          />
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">User</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Your research, insights, and knowledge, all in one place. What will you discover today?
            </p>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onClick={() => handleQuickAction(action.id)}
                />
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Notes"
              value={stats.totalNotes}
              icon={<FileTextIcon className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Favorites"
              value={stats.favorites}
              icon={<StarIcon className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="Folders"
              value={stats.folders}
              icon={<FolderIcon className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Tags"
              value={stats.tags}
              icon={<TagIcon className="w-6 h-6" />}
              color="pink"
            />
          </motion.div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Recent Notes */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <SectionHeader
                title="Recent Notes"
                action={{
                  label: 'View All',
                  onClick: () => navigate('/notes')
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note, index) => (
                      <RecentNoteCard
                        key={note.id}
                        note={note}
                        onClick={() => navigate('/notes')}
                      />
                    ))
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full"
                    >
                      <EmptyState
                        icon={<FileTextIcon className="w-16 h-16 text-slate-500" />}
                        title="Your knowledge base is empty"
                        description="Start capturing your thoughts, research, and ideas to see them here."
                        action={{
                          label: 'Create Your First Note',
                          onClick: () => navigate('/notes')
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={itemVariants} className="space-y-6">
              <SectionHeader title="Recent Activity" />
              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <ClockIcon className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-slate-500 font-medium">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
