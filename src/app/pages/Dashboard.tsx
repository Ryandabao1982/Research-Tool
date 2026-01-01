import React, { useState } from 'react';
import Layout from '../layout';
import { TopBar } from '../../shared/components/layout/TopBar';
import { FeedbackModal } from '../../shared/components/modals/FeedbackModal';
import { FeatureCard } from '../../shared/components/dashboard/FeatureCard';
import { CalendarCell } from '../../shared/components/dashboard/CalendarCell';
import { DashboardSidebar } from '../../shared/components/dashboard/DashboardSidebar';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useRoleStore } from '../../shared/stores/role-store';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { FeedbackData } from '../../shared/types/dashboard';

// Constants for assets
const ASSETS = {
  TEAM_TASKS: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300",
  PERSONAL_NOTES: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
  STUDY_QUEUES: "https://images.unsplash.com/photo-1499193558835-260384501f67?auto=format&fit=crop&q=80&w=300",
  ANALYTICS: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300"
};

export default function DashboardPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const { activeRole } = useRoleStore();
  const { stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  const handleFeedbackSave = (data: FeedbackData) => {
    // Replaced console.log with potential logic or comment
    // TODO: Implement actual feedback submission
  };

  if (isLoading || !stats) {
    return (
      <Layout>
        <div className="flex flex-col h-screen bg-background items-center justify-center">
          <div className="text-white opacity-50">Loading Dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-background relative overflow-hidden">
        {/* Ambient Background - Neural Aura */}
        {/* Using pointer-events-none to prevent z-index issues blocking interaction */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/20 blur-3xl rounded-full mix-blend-screen opacity-60" />
           <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-purple-500/10 blur-3xl rounded-full mix-blend-screen opacity-50" />
        </div>

        <TopBar 
            title="Dashboard" 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            showMenuButton={true} // Assuming TopBar can support a menu trigger
        />

        <div className="flex-1 flex overflow-hidden z-10 relative">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 py-8">

              {/* Feature Highlights Grid - Context Aware */}
              {/* Improved responsiveness with md:grid-cols-2 */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Manager & Coach View */}
                {(activeRole === 'manager' || activeRole === 'coach') && (
                  <FeatureCard
                    title="Team Tasks"
                    description="Delegate and track progress"
                    detail={`${stats.tasksPending} Pending Reviews`}
                    progress={stats.tasksPending > 0 ? 75 : 100}
                    image={ASSETS.TEAM_TASKS}
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
                  image={ASSETS.PERSONAL_NOTES}
                  onClick={() => navigate('/notes')}
                />

                {/* Learner Only */}
                {activeRole === 'learner' && (
                  <FeatureCard
                    title="Study Queues"
                    description="Active Recall Sessions"
                    detail={`Streak: ${stats.studyStreak} days`}
                    progress={10}
                    actionLabel="Start"
                    image={ASSETS.STUDY_QUEUES}
                    onClick={() => setIsFeedbackOpen(true)}
                  />
                )}

                {/* Manager Only */}
                {activeRole === 'manager' && (
                  <FeatureCard
                    title="Analytics"
                    description="Knowledge Base Health"
                    detail="+15% Growth"
                    image={ASSETS.ANALYTICS}
                    onClick={() => setIsFeedbackOpen(true)}
                  />
                )}
              </section>

              {/* Your Notes - Interactive Calendar */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Activity Heatmap</h2>
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-3 bg-surface-200 border border-white/5 rounded-full px-5 py-2 shadow-lg">
                      <CalendarIcon className="w-4 h-4 text-brand-blue" />
                      <span className="text-xs font-bold text-white tracking-wide">Last 21 Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        aria-label="Previous Period"
                        className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button 
                        aria-label="Next Period"
                        className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-100/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-glass overflow-hidden grid grid-cols-7 border-collapse">
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
          {/* Responsive Sidebar - hidden on mobile unless toggled (implementation of toggle visibility logic depends on Sidebar internals or wrapper) */}
          <DashboardSidebar 
             className={`${isSidebarOpen ? 'block fixed inset-y-0 right-0 z-50 bg-background w-80 shadow-2xl' : 'hidden'} 2xl:block relative`}
          />
          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
              <div 
                  className="fixed inset-0 bg-black/50 z-40 2xl:hidden"
                  onClick={() => setIsSidebarOpen(false)}
              />
          )}
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