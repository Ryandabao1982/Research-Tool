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
    "flex items-center gap-4 group cursor-pointer p-2 border rounded-none hover:bg-neutral-50 transition-colors",
    "border-neutral-200",
    className
  )}>
    <div className="w-12 h-12 border border-neutral-200 bg-white text-neutral-900 flex items-center justify-center group-hover:scale-105 transition-transform">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-sans text-sm font-bold text-neutral-900 truncate">{label}</h4>
      <p className="font-mono text-[10px] text-neutral-600 font-medium">{date}</p>
    </div>
    <span className="font-sans text-xl font-bold text-neutral-900">{count}</span>
  </div>
);