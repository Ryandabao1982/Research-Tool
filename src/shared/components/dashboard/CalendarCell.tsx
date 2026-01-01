import React from 'react';
import { cn } from '../../utils';
import { motion } from 'framer-motion';

interface CalendarCellProps {
  day: number;
  note?: {
    title: string;
    time?: string;
    type?: string;
    hasAction?: boolean;
  } | null;
  isSelected?: boolean;
}

export const CalendarCell = ({ day, note, isSelected }: CalendarCellProps) => (
  <div className={cn(
    "aspect-square border-r border-b border-white/5 p-4 flex flex-col gap-3 relative group transition-all duration-500",
    isSelected ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"
  )}>
    <span className={cn(
      "text-[10px] font-black tracking-tighter transition-colors",
      isSelected ? "text-blue-400" : "text-gray-600 group-hover:text-gray-400"
    )}>{day}</span>
    
    {note && (
      <motion.div 
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -2, scale: 1.02 }}
        className="bg-surface-200/80 backdrop-blur-md border border-white/10 rounded-[1.25rem] p-3.5 shadow-xl relative z-10 cursor-pointer hover:border-white/20 transition-all hover:bg-surface-300/80 group/note"
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[7px] font-black text-brand-blue uppercase tracking-[0.15em]">{note.type || 'Note'}</span>
          <span className="text-[7px] font-bold text-gray-500">{note.time || ''}</span>
        </div>
        <h4 className="text-[10px] font-bold text-white leading-[1.3] mb-3 line-clamp-2 tracking-tight group-hover/note:text-brand-blue transition-colors">
          {note.title}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-[#252525] bg-brand-blue shadow-lg group-hover/note:border-[#2a2a2a] transition-colors" />
            <div className="w-4 h-4 rounded-full border-2 border-[#252525] bg-brand-light shadow-lg group-hover/note:border-[#2a2a2a] transition-colors" />
          </div>
          {note.hasAction && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-white hover:bg-white/10 hover:border-white/10 transition-all"
            >
              Add Task
            </motion.button>
          )}
        </div>
        
        {/* Subtle glow effect on note hover */}
        <div className="absolute inset-0 bg-brand-blue/5 blur-xl opacity-0 group-hover/note:opacity-100 transition-opacity -z-10 rounded-full" />
      </motion.div>
    )}
  </div>
);

