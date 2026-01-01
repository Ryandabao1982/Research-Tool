import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGridIcon } from 'lucide-react';
import { cn } from '../../utils';

interface FeatureCardProps {
  title: string;
  description: string;
  detail: string;
  image?: string;
  progress?: number;
  actionLabel?: string;
  onClick?: () => void;
  className?: string;
}

export const FeatureCard = ({ 
  title, 
  description, 
  detail, 
  image, 
  progress, 
  actionLabel, 
  onClick,
  className
}: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={cn(
      "bg-surface-100/40 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/5 flex gap-6 group cursor-pointer transition-all duration-300 hover:border-white/20 shadow-glass hover:shadow-[0_0_40px_rgba(0,112,243,0.15)]",
      className
    )}
  >
    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 flex-shrink-0 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <LayoutGridIcon className="w-10 h-10 text-white/20" />
      )}
    </div>
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 pr-4">
          <h3 className="text-xl font-bold text-white mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-400 line-clamp-1">{description}</p>
        </div>
        {actionLabel && (
          <button className="px-4 py-1.5 rounded-full bg-brand-blue text-white text-xs font-bold hover:bg-brand-light transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/20">
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-xs font-medium text-white mb-2">{detail}</p>
        {progress !== undefined ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-brand" 
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{progress}% completed</span>
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
