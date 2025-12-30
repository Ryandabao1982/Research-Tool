import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface OverviewItemProps {
  icon: LucideIcon;
  label: string;
  date: string;
  count: number;
  className?: string;
}

export const OverviewItem = ({ icon: Icon, label, date, count, className }: OverviewItemProps) => (
  <div className={cn(
    "flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all",
    className
  )}>
    <div className="w-12 h-12 rounded-full bg-white text-[#121212] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-white truncate">{label}</h4>
      <p className="text-[10px] text-gray-500 font-medium">{date}</p>
    </div>
    <span className="text-xl font-black text-white">{count}</span>
  </div>
);
