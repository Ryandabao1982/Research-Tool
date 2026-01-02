import React from 'react';
import { PlayCircleIcon, LayoutGridIcon, FileTextIcon, Edit3Icon } from 'lucide-react';
import { OverviewItem } from './OverviewItem';
import { NotificationCard } from './NotificationCard';
import { motion } from 'framer-motion';
import { DataManagement } from '../../../features/notes/components/DataManagement';

import { useRoleStore } from '../../stores/role-store';

interface DashboardSidebarProps {
  className?: string;
}

export const DashboardSidebar = ({ className }: DashboardSidebarProps) => {
  const { activeRole } = useRoleStore();

  // Rational Grid compliant sidebar
  const sidebarClasses = `
    w-80 border-l border-neutral-200 p-8 space-y-10 overflow-y-auto 
    bg-white transition-all duration-300
    ${className || ''}
  `.trim();

  return (
    <aside className={sidebarClasses}>
      {/* Active Notes */}
      <div className="space-y-5">
        <h3 className="text-lg font-sans font-bold text-neutral-900">Active Notes</h3>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative group border border-neutral-200 overflow-hidden aspect-[4/3] bg-neutral-50 cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"
            className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
            alt="Daily Tasks Active Note"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl scale-150 group-hover:scale-[2] transition-transform duration-500" />
              <PlayCircleIcon className="w-16 h-16 text-primary relative z-10" strokeWidth={1} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="font-sans text-sm font-bold text-neutral-900 mb-1">Daily Tasks</p>
            <p className="font-mono text-[10px] text-neutral-600 font-medium">(Ends in: 30 min.)</p>
          </div>
        </motion.div>
        <div className="flex justify-between items-center px-4">
          <div>
            <p className="font-mono text-[10px] text-neutral-600 font-bold uppercase tracking-wider mb-1">Users active</p>
            <p className="font-sans text-xs font-bold text-neutral-900">15/20</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-neutral-600 font-bold uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
              <p className="font-sans text-xs font-bold text-neutral-900">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Overview */}
      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-sans font-bold text-neutral-900">Notes Overview</h3>
        <div className="space-y-4">
          <OverviewItem icon={LayoutGridIcon} label="Project Ideas" date="Weekly Review" count={150} />
          <OverviewItem icon={FileTextIcon} label="Meeting Notes" date="Last week" count={85} />
          <OverviewItem icon={Edit3Icon} label="To-Do List" date="Current tasks" count={5} />
        </div>
      </div>

      {/* Notifications - Manager Only */}
      {activeRole === 'manager' && (
        <div className="space-y-5 pt-4">
          <h3 className="text-lg font-sans font-bold text-neutral-900">Notifications</h3>
          <NotificationCard
            title="Team Update: Q4 Goals"
            description="3 new reports submitted for review."
          />
        </div>
      )}

      {/* Data Management */}
      <DataManagement />
    </aside>
  );
};