import React from 'react';
import Layout from '../layout';
import { TopBar } from '../components/layout/TopBar';
import { 
  PlusIcon,
  PlayIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FileTextIcon,
  LayoutGridIcon,
  Edit3Icon,
  CalendarIcon,
  MoreVerticalIcon,
  PlayCircleIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

// --- Local Components ---

const FeatureCard = ({ 
  title, 
  description, 
  detail, 
  image, 
  progress, 
  actionLabel, 
  variant = 'blue' 
}: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#1a1a1a] rounded-[2.5rem] p-6 border border-white/5 flex gap-6 group cursor-pointer"
  >
    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 flex-shrink-0 flex items-center justify-center">
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <LayoutGridIcon className="w-10 h-10 text-white/20" />
      )}
    </div>
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {actionLabel && (
          <button className="px-4 py-1.5 rounded-full bg-[#bd00ff] text-white text-xs font-bold hover:bg-[#a600e0] transition-colors">
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-xs font-medium text-white mb-2">{detail}</p>
        {progress !== undefined ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400">{progress}% completed</span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Status</span>
            <span className="text-white">Ready for review...</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const CalendarCell = ({ day, note, isSelected }: any) => (
  <div className={cn(
    "aspect-square border-r border-b border-white/5 p-3 flex flex-col gap-2 relative group",
    isSelected ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
  )}>
    <span className="text-xs font-bold text-gray-500">{day}</span>
    {note && (
      <div className="bg-[#252525] border border-white/10 rounded-xl p-3 shadow-lg transform group-hover:scale-105 transition-transform">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-bold text-[#bd00ff] uppercase">{note.type || 'Note'}</span>
          <span className="text-[8px] text-gray-500">{note.time}</span>
        </div>
        <h4 className="text-[10px] font-bold text-white leading-tight mb-2">{note.title}</h4>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full border border-[#252525] bg-blue-500" />
            <div className="w-4 h-4 rounded-full border border-[#252525] bg-purple-500" />
          </div>
          {note.hasAction && (
            <button className="px-2 py-0.5 rounded-md bg-white/10 text-[8px] font-bold text-white">Add Task</button>
          )}
        </div>
      </div>
    )}
  </div>
);

const StatsItem = ({ icon: Icon, label, date, count }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="w-12 h-12 rounded-full bg-white text-[#121212] flex items-center justify-center group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-white">{label}</h4>
      <p className="text-[10px] text-gray-400">{date}</p>
    </div>
    <span className="text-xl font-bold text-white">{count}</span>
  </div>
);

// --- Main Page ---

export default function DashboardPage() {
  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <TopBar title="Dashboard" />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-10 py-6">
              
              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <FeatureCard 
                  title="Note Management"
                  description="Organize your thoughts efficiently"
                  detail="Get started with your notes now!"
                  progress={50}
                  image="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=300"
                />
                <FeatureCard 
                  title="Personal Notes"
                  description="How to categorize notes?"
                  detail="Tuesday 10/5, 3 PM"
                  progress={40}
                  actionLabel="Add Note"
                  image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
                />
                <FeatureCard 
                  title="Favorites"
                  description="Quick access to important notes"
                  detail="Friday 15/5, 10 AM"
                  actionLabel="View"
                  image="https://images.unsplash.com/photo-1499193558835-260384501f67?auto=format&fit=crop&q=80&w=300"
                />
                <FeatureCard 
                  title="Task List"
                  description="Manage your daily tasks"
                  detail="Monday 19/5, 1 PM"
                  image="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=300"
                />
              </div>

              {/* Your Notes Calendar Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Notes</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-full px-4 py-1.5">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-white">May 01 - May 21, 2023</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-white"><ChevronLeftIcon className="w-5 h-5" /></button>
                      <button className="p-1 text-gray-400 hover:text-white"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden grid grid-cols-7">
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
              </div>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-white/5 p-8 space-y-10 overflow-y-auto hidden 2xl:block custom-scrollbar">
            
            {/* Active Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Active Notes</h3>
              <div className="relative group rounded-[2rem] overflow-hidden aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircleIcon className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1} />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                   <p className="text-xs font-bold text-white mb-1">Daily Tasks</p>
                   <p className="text-[10px] text-gray-400">(Ends in: 30 min.)</p>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                 <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Users active:</p>
                    <p className="text-xs font-bold text-white">15/20</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Status:</p>
                    <p className="text-xs font-bold text-white">In Progress</p>
                 </div>
              </div>
            </div>

            {/* Notes Overview */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Notes Overview</h3>
              <div className="space-y-6">
                <StatsItem icon={LayoutGridIcon} label="Project Ideas" date="Weekly Review" count={150} />
                <StatsItem icon={FileTextIcon} label="Meeting Notes" date="Last week" count={85} />
                <StatsItem icon={Edit3Icon} label="To-Do List" date="Current tasks" count={5} />
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                <div className="relative z-10 pr-12">
                   <h4 className="text-sm font-bold text-white mb-2">Your note has been updated!</h4>
                   <p className="text-[10px] text-gray-400">For assistance, reach out to our support team.</p>
                </div>
                <button className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-[#bd00ff] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

