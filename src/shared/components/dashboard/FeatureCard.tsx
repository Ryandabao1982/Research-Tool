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
      "bg-white border border-neutral-200 p-8 flex gap-6 group cursor-pointer transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50",
      className
    )}
  >
    <div className="w-32 h-32 border border-neutral-200 bg-neutral-50 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <LayoutGridIcon className="w-10 h-10 text-neutral-400" />
      )}
    </div>
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 pr-4">
          <h3 className="text-xl font-sans font-bold text-neutral-900 mb-1 truncate">{title}</h3>
          <p className="text-sm text-neutral-600 line-clamp-1">{description}</p>
        </div>
        {actionLabel && (
          <button className="rg-btn rg-btn-primary text-xs font-bold px-4 py-1.5">
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-xs font-sans font-medium text-neutral-900 mb-2">{detail}</p>
        {progress !== undefined ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-neutral-200 border border-neutral-300 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary" 
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-neutral-600 whitespace-nowrap">{progress}% completed</span>
          </div>
        ) : (
          <div className="flex justify-between items-center font-mono text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
            <span>Status</span>
            <span className="text-neutral-900">Ready for review...</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);