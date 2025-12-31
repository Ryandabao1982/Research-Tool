import React, { useState } from 'react';
import Layout from '../layout';
import { TopBar } from '../../shared/components/layout/TopBar';
import { FeedbackModal } from '../../shared/components/modals/FeedbackModal';
import { FeatureCard } from '../../shared/components/dashboard/FeatureCard';
import { CalendarCell } from '../../shared/components/dashboard/CalendarCell';
import { DashboardSidebar } from '../../shared/components/dashboard/DashboardSidebar';
import {
  PlusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRoleStore } from '../../shared/stores/role-store';

import { useDashboardStats } from '../hooks/useDashboardStats';

export default function DashboardPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { activeRole } = useRoleStore();
  const { stats, isLoading } = useDashboardStats();

  const handleFeedbackSave = (data: any) => {
    console.log('Feedback received:', data);
  };

  if (isLoading || !stats) {
    return (
      <Layout>
        <div className="flex flex-col h-screen bg-[#0f0f0f] items-center justify-center">
          <div className="text-white opacity-50">Loading Dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-[#0f0f0f]">
        <TopBar title="Dashboard" />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12 py-8">

              {/* Feature Highlights Grid - Context Aware */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Manager & Coach View */}
                {(activeRole === 'manager' || activeRole === 'coach') && (
                  <FeatureCard
                    title="Team Tasks"
                    description="Delegate and track progress"
                    detail={`${stats.tasksPending} Pending Reviews`}
                    progress={stats.tasksPending > 0 ? 75 : 100}
                    image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300"
                    onClick={() => setIsFeedbackOpen(true)}
                  />
                )}

                {/* Learner & Shared View */}
                <FeatureCard
                  title="Personal Notes"
                  description="Capture your daily thoughts"
                  detail={`${stats.notesCount} notes total`}
                  progress={40}
                  actionLabel="Add Note"
                  image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
                  onClick={() => setIsFeedbackOpen(true)}
                />

                {/* Learner Only */}
                {activeRole === 'learner' && (
                  <FeatureCard
                    title="Study Queues"
                    description="Active Recall Sessions"
                    detail={`Streak: ${stats.studyStreak} days`}
                    progress={10}
                    actionLabel="Start"
                    image="https://images.unsplash.com/photo-1499193558835-260384501f67?auto=format&fit=crop&q=80&w=300"
                    onClick={() => setIsFeedbackOpen(true)}
                  />
                )}

                {/* Manager Only */}
                {activeRole === 'manager' && (
                  <FeatureCard
                    title="Analytics"
                    description="Knowledge Base Health"
                    detail="+15% Growth"
                    image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300"
                    onClick={() => setIsFeedbackOpen(true)}
                  />
                )}
              </section>

              {/* Your Notes - Interactive Calendar */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Activity Heatmap</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/5 rounded-full px-5 py-2 shadow-lg">
                      <CalendarIcon className="w-4 h-4 text-brand-blue" />
                      <span className="text-xs font-bold text-white tracking-wide">Last 21 Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><ChevronLeftIcon className="w-5 h-5" /></button>
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden grid grid-cols-7 border-collapse">
                  {stats.activityHeatmap.map((day, i) => (
                    <CalendarCell
                      key={i}
                      day={i + 1}
                      note={day.note}
                      isSelected={!!day.note}
                    />
                  ))}
                </div>
              </section>
            </div>
          </main>

          {/* Contextual Right Sidebar */}
          <DashboardSidebar />
        </div>

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          onSave={handleFeedbackSave}
        />
      </div>
    </Layout>
  );
}


