import React, { useState } from 'react';
import Layout from '../layout';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  SearchIcon, 
  FileTextIcon, 
  SparklesIcon, 
  SettingsIcon,
  ClockIcon,
  TagIcon,
  FolderIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder components - will be moved to separate files later or imported if existing
const StatWidget = ({ label, value, icon, color }: any) => (
  <div className={`p-4 rounded-xl border bg-white/5 border-white/10 backdrop-blur-sm flex items-center gap-4`}>
    <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const QuickActionButton = ({ label, icon, onClick, color = "blue" }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
  >
    <div className={`p-4 rounded-full bg-${color}-500/20 text-${color}-400 mb-3 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-200 group-hover:text-white">{label}</span>
  </button>
);

const RecentNoteItem = ({ title, date, preview }: any) => (
  <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors mb-1">{title}</h3>
    <p className="text-xs text-gray-500 mb-2">{date}</p>
    <p className="text-sm text-gray-400 line-clamp-2">{preview}</p>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();

  // Mock data for now - will connect to store in Phase 2
  const stats = {
    notes: 12,
    tags: 5,
    folders: 3,
    aiChats: 8
  };

  const recentNotes = [
    { id: 1, title: 'Project Plan', date: '2 hours ago', preview: 'Initial draft for the Q4 roadmap...' },
    { id: 2, title: 'Meeting Notes', date: 'Yesterday', preview: 'Discussed the new feature requirements...' },
    { id: 3, title: 'Ideas', date: '2 days ago', preview: 'Random thoughts about the UI refactor...' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome back, User</h1>
          <p className="text-gray-400">Here's what's happening in your knowledge base.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatWidget label="Total Notes" value={stats.notes} icon={<FileTextIcon />} color="blue" />
          <StatWidget label="Tags" value={stats.tags} icon={<TagIcon />} color="purple" />
          <StatWidget label="Folders" value={stats.folders} icon={<FolderIcon />} color="yellow" />
          <StatWidget label="AI Chats" value={stats.aiChats} icon={<SparklesIcon />} color="pink" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton 
                label="New Note" 
                icon={<PlusIcon className="w-6 h-6" />} 
                onClick={() => navigate('/notes')}
                color="blue"
              />
              <QuickActionButton 
                label="Search" 
                icon={<SearchIcon className="w-6 h-6" />} 
                onClick={() => {}} 
                color="purple"
              />
              <QuickActionButton 
                label="AI Chat" 
                icon={<SparklesIcon className="w-6 h-6" />} 
                onClick={() => {}} 
                color="pink"
              />
              <QuickActionButton 
                label="Settings" 
                icon={<SettingsIcon className="w-6 h-6" />} 
                onClick={() => {}} 
                color="gray"
              />
            </div>
          </div>

          {/* Recent Notes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Notes</h2>
              <button 
                onClick={() => navigate('/notes')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentNotes.map((note) => (
                <RecentNoteItem key={note.id} {...note} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}