import React from 'react';
import { PlayCircleIcon, LayoutGridIcon, FileTextIcon, Edit3Icon } from 'lucide-react';
import { OverviewItem } from './OverviewItem';
import { NotificationCard } from './NotificationCard';
import { motion } from 'framer-motion';

import { useRoleStore } from '../../stores/role-store';

export const DashboardSidebar = () => {
  const { activeRole } = useRoleStore();

  return (
    <aside className="w-80 border-l border-white/5 p-8 space-y-10 overflow-y-auto hidden 2xl:block custom-scrollbar bg-[#0f0f0f]/50 backdrop-blur-3xl">
      {/* Active Notes */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-white tracking-tight">Active Notes</h3>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative group rounded-[2.5rem] overflow-hidden aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 border border-white/10 shadow-2xl cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"
            className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
            alt="Active note background"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 group-hover:scale-[2] transition-transform duration-500" />
              <PlayCircleIcon className="w-16 h-16 text-white relative z-10 drop-shadow-2xl" strokeWidth={1} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-sm font-bold text-white mb-1 drop-shadow-md">Daily Tasks</p>
            <p className="text-[10px] text-gray-300 font-medium drop-shadow-md">(Ends in: 30 min.)</p>
          </div>
        </motion.div>
        <div className="flex justify-between items-center px-4">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Users active</p>
            <p className="text-xs font-black text-white">15/20</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Status</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              <p className="text-xs font-black text-white">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Overview */}
      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Notes Overview</h3>
        <div className="space-y-4">
          <OverviewItem icon={LayoutGridIcon} label="Project Ideas" date="Weekly Review" count={150} />
          <OverviewItem icon={FileTextIcon} label="Meeting Notes" date="Last week" count={85} />
          <OverviewItem icon={Edit3Icon} label="To-Do List" date="Current tasks" count={5} />
        </div>
      </div>

      {/* Notifications - Manager Only */}
      {activeRole === 'manager' && (
        <div className="space-y-5 pt-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Notifications</h3>
          <NotificationCard
            title="Team Update: Q4 Goals"
            description="3 new reports submitted for review."
          />
        </div>
      )}
    </aside>
  );
};
