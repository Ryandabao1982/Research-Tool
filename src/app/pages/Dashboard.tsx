import React, { useState } from 'react';
import Layout from '../layout';
import { TopBar } from '../components/layout/TopBar';
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

export default function DashboardPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleFeedbackSave = (data: any) => {
    console.log('Feedback received:', data);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-[#0f0f0f]">
        <TopBar title="Dashboard" />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12 py-8">
              
              {/* Feature Highlights Grid */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <FeatureCard 
                  title="Note Management"
                  description="Organize your thoughts efficiently"
                  detail="Get started with your notes now!"
                  progress={50}
                  image="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=300"
                  onClick={() => setIsFeedbackOpen(true)}
                />
                <FeatureCard 
                  title="Personal Notes"
                  description="How to categorize notes?"
                  detail="Tuesday 10/5, 3 PM"
                  progress={40}
                  actionLabel="Add Note"
                  image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
                  onClick={() => setIsFeedbackOpen(true)}
                />
                <FeatureCard 
                  title="Favorites"
                  description="Quick access to important notes"
                  detail="Friday 15/5, 10 AM"
                  actionLabel="View"
                  image="https://images.unsplash.com/photo-1499193558835-260384501f67?auto=format&fit=crop&q=80&w=300"
                  onClick={() => setIsFeedbackOpen(true)}
                />
                <FeatureCard 
                  title="Task List"
                  description="Manage your daily tasks"
                  detail="Monday 19/5, 1 PM"
                  image="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=300"
                  onClick={() => setIsFeedbackOpen(true)}
                />
              </section>

              {/* Your Notes - Interactive Calendar */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Your Notes</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/5 rounded-full px-5 py-2 shadow-lg">
                      <CalendarIcon className="w-4 h-4 text-brand-blue" />
                      <span className="text-xs font-bold text-white tracking-wide">May 01 - May 21, 2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><ChevronLeftIcon className="w-5 h-5" /></button>
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden grid grid-cols-7 border-collapse">
                  {[...Array(21)].map((_, i) => (
                    <CalendarCell 
                      key={i} 
                      day={i + 1} 
                      note={i === 9 ? {
                        title: 'Personal Notes',
                        time: '10 AM',
                        type: 'Favorites',
                        hasAction: true
                      } : i === 3 ? {
                        title: 'Note',
                        time: '3 PM',
                        type: 'Draft 5'
                      } : i === 14 ? {
                        title: 'Task List',
                        time: '10 AM',
                        type: 'Daily Note'
                      } : i === 18 ? {
                        title: 'Task Review',
                        time: '1 PM',
                        type: 'Weekly overview'
                      } : null}
                      isSelected={i === 9}
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


