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
    "aspect-square border-r border-b border-neutral-200 p-4 flex flex-col gap-3 relative group transition-all duration-500",
    isSelected ? "bg-neutral-50" : "hover:bg-neutral-50/50"
  )}>
    <span className={cn(
      "font-mono text-xs font-bold transition-colors",
      isSelected ? "text-primary" : "text-neutral-500 group-hover:text-neutral-700"
    )}>{day}</span>
    
    {note && (
      <motion.div 
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -2, scale: 1.02 }}
        className="bg-white border border-neutral-200 rounded-none p-4 relative z-10 cursor-pointer hover:border-neutral-300 transition-all hover:bg-neutral-50 group/note"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">{note.type || 'Note'}</span>
          <span className="font-mono text-[10px] font-bold text-neutral-500">{note.time || ''}</span>
        </div>
        <h4 className="font-sans text-xs font-bold text-neutral-900 leading-[1.3] mb-3 line-clamp-2 group-hover/note:text-primary transition-colors">
          {note.title}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 border-2 border-white bg-primary" />
            <div className="w-5 h-5 border-2 border-white bg-neutral-300" />
          </div>
          {note.hasAction && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="rg-btn rg-btn-ghost text-[10px] font-bold px-2 py-1"
            >
              Add Task
            </motion.button>
          )}
        </div>
      </motion.div>
    )}
  </div>
);