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
      "bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group cursor-pointer shadow-xl hover:border-white/10 transition-all",
      className
    )}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-[60px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-brand-blue/10" />
    <div className="relative z-10 pr-12">
      <h4 className="text-sm font-bold text-white mb-2 leading-tight">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
    <div className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 group-hover:scale-110 group-hover:bg-brand-light transition-all">
      <ChevronRightIcon className="w-5 h-5" />
    </div>
  </motion.div>
);
