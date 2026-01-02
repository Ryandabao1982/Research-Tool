import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

interface NotificationCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export const NotificationCard = ({ title, description, onClick, className }: NotificationCardProps) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "bg-white border border-neutral-200 p-6 relative overflow-hidden group cursor-pointer transition-all hover:border-neutral-300 hover:bg-neutral-50",
      className
    )}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -mr-16 -mt-16 transition-all group-hover:bg-primary/20" />
    <div className="relative z-10 pr-12">
      <h4 className="font-sans text-sm font-bold text-neutral-900 mb-2 leading-tight">{title}</h4>
      <p className="font-mono text-[10px] text-neutral-600 font-medium leading-relaxed">{description}</p>
    </div>
    <div className="absolute right-4 bottom-4 w-10 h-10 border border-neutral-200 bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-all">
      <ChevronRightIcon className="w-5 h-5" />
    </div>
  </motion.div>
);