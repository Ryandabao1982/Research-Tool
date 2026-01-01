import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';

interface Note {
  id: string;
  title: string;
  updated_at: string;
}

interface DashboardStats {
  totalNotes: number;
  totalFolders: number;
  totalTags: number;
  recentNotes: Note[];
}

export default function DashboardPage() {
  console.log('DashboardPage rendering');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="h-15 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50"
      >
        <motion.span
          className="text-2xl font-semibold text-white"
          whileHover={{ scale: 1.05 }}
        >
          SecondBrain
        </motion.span>
        <motion.span
          className="text-slate-300"
          whileHover={{ scale: 1.05 }}
        >
          Dashboard
        </motion.span>
      </motion.header>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-15 w-60 h-[calc(100vh-60px)] bg-white/5 backdrop-blur-2xl border-r border-white/10 p-5"
      >
        <motion.div
          className="mb-5"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            FOLDERS
          </span>
        </motion.div>

        <nav className="flex flex-col gap-2">
          <motion.button
            className="px-3 py-2 text-left bg-transparent border-none cursor-pointer text-sm text-white rounded-lg hover:bg-white/10 hover:scale-105 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Notes
          </motion.button>
          <motion.button
            className="px-3 py-2 text-left bg-white/10 border-none cursor-pointer text-sm text-white rounded-lg hover:bg-white/20 hover:scale-105 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Recent
          </motion.button>
          <motion.button
            className="px-3 py-2 text-left bg-transparent border-none cursor-pointer text-sm text-slate-400 rounded-lg hover:bg-white/10 hover:scale-105 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Favorites
          </motion.button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-60 p-10"
      >
        <div className="flex gap-10 flex-wrap">
          {/* Widget 1: Activity Heatmap */}
          <motion.div
            className="w-90 min-h-70 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <motion.h3
              className="mb-5 text-lg font-medium text-white"
              whileHover={{ scale: 1.05 }}
            >
              Activity Heatmap
            </motion.h3>
            <ActivityHeatmap />
          </motion.div>

          {/* Widget 2: Quick Stats */}
          <motion.div
            className="w-90 min-h-70 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:shadow-2xl hover:shadow-green-500/20 transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <motion.h3
              className="mb-5 text-lg font-medium text-white"
              whileHover={{ scale: 1.05 }}
            >
              Quick Stats
            </motion.h3>
            <div className="flex flex-col gap-4">
              <div className="text-center py-5">
                <motion.div
                  className="text-5xl font-light text-white"
                  whileHover={{ scale: 1.1 }}
                >
                  3
                </motion.div>
                <div className="text-base text-slate-300 mt-1">Notes</div>
              </div>
              <div className="flex justify-around border-t border-white/10 pt-4">
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-light text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    3
                  </motion.div>
                  <div className="text-xs text-slate-300">Folders</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-light text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    3
                  </motion.div>
                  <div className="text-xs text-slate-300">Tags</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Widget 3: Recent Notes */}
          <motion.div
            className="w-90 min-h-70 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <motion.h3
              className="mb-5 text-lg font-medium text-white"
              whileHover={{ scale: 1.05 }}
            >
              Recent Notes
            </motion.h3>
            <div className="flex flex-col gap-3">
              <motion.div
                className="py-3 border-b border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-sm text-white font-normal">
                  Welcome to SecondBrain
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Just now
                </div>
              </motion.div>
              <motion.div
                className="py-3 border-b border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-sm text-white font-normal">
                  Getting Started
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  1 day ago
                </div>
              </motion.div>
              <motion.div
                className="py-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-sm text-white font-normal">
                  Project Ideas
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  2 days ago
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </motion.div>
  );
}

function ActivityHeatmap() {
  const days = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    active: Math.random() > 0.5,
    intensity: Math.random(),
  }));

  return (
    <motion.div
      className="grid grid-cols-7 gap-1 mt-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {days.map((d) => (
        <motion.div
          key={d.day}
          className={cn(
            "aspect-square border border-slate-600 rounded-sm",
            d.active
              ? `bg-blue-500/${Math.round((0.3 + d.intensity * 0.7) * 100)}`
              : 'bg-slate-700'
          )}
          whileHover={{ scale: 1.2 }}
          title={`Day ${d.day}: ${d.active ? 'Active' : 'No activity'}`}
        />
      ))}
    </motion.div>
  );
}

function QuickStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-5">
        <motion.div
          className="text-5xl font-light text-white"
          whileHover={{ scale: 1.1 }}
        >
          {stats.totalNotes.toLocaleString()}
        </motion.div>
        <div className="text-base text-slate-300 mt-1">Notes</div>
      </div>

      <div className="flex justify-around border-t border-white/10 pt-4">
        <div className="text-center">
          <motion.div
            className="text-2xl font-light text-white"
            whileHover={{ scale: 1.1 }}
          >
            {stats.totalFolders}
          </motion.div>
          <div className="text-xs text-slate-300">Folders</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-2xl font-light text-white"
            whileHover={{ scale: 1.1 }}
          >
            {stats.totalTags}
          </motion.div>
          <div className="text-xs text-slate-300">Tags</div>
        </div>
      </div>
    </div>
  );
}

function RecentNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <motion.div
        className="text-slate-400 text-sm text-center py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No notes yet. Create your first note to get started.
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          className="py-3 border-b border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-white font-normal">
            {note.title}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {new Date(note.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}