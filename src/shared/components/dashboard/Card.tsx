import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { clsx } from 'clsx';
import { cn } from '@/shared/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glass?: boolean;
  delay?: number;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const hoverVariants: Variants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function Card({
  children,
  className,
  onClick,
  hover = false,
  glass = true,
  delay = 0,
}: CardProps) {
  const baseClasses = glass
    ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl'
    : 'bg-slate-800/50 border border-white/5 shadow-lg';

  const hoverClasses = hover
    ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-2xl cursor-pointer transition-all duration-300'
    : 'cursor-default transition-all duration-300';

  const motionProps = {
    initial: 'hidden',
    animate: 'visible',
    variants: cardVariants,
    transition: { duration: 0.4, delay },
  };
  
  if (onClick) {
    const buttonProps = {
      ...motionProps,
      onClick,
      className: cn(
        'rounded-2xl p-6 text-left',
        baseClasses,
        hoverClasses,
        'transform-gpu',
        className ?? ''
      ),
    };
    
    if (hover) {
      return (
        <motion.button
          {...buttonProps}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {children}
        </motion.button>
      );
    }
    
    return (
      <motion.button {...buttonProps}>
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      {...motionProps}
      className={cn(
        'rounded-2xl p-6',
        baseClasses,
        hoverClasses,
        'transform-gpu',
        className ?? ''
      )}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  onClick,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  const cardProps: Partial<CardProps> = { hover, glass: true, delay };
  if (className !== undefined) cardProps.className = className;
  if (onClick !== undefined) cardProps.onClick = onClick;
  
  return (
    <Card {...cardProps}>
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    pink: 'text-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card glass hover className="group relative overflow-hidden">
        <div
          className={clsx(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            'bg-gradient-to-br',
            colorClasses[color]
          )}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={clsx(
                'p-3 rounded-xl bg-white/5 border border-white/10',
                'group-hover:scale-110 transition-transform duration-300'
              )}
            >
              <div className={iconColorClasses[color]}>{icon}</div>
            </div>
            {trend && (
              <div
                className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  trend.value >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface QuickActionCardProps {
  action: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    shortcut?: string;
  };
  onClick: () => void;
  delay?: number;
}

export function QuickActionCard({ action, onClick, delay = 0 }: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card onClick={onClick} hover className="flex items-center gap-4 p-4 group">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {action.icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-white font-semibold">{action.title}</h3>
          <p className="text-sm text-gray-400">{action.description}</p>
        </div>
        {action.shortcut && (
          <kbd className="hidden md:inline-flex items-center px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
            {action.shortcut}
          </kbd>
        )}
      </Card>
    </motion.div>
  );
}

interface RecentNoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isFavorite?: boolean;
    tags?: string[];
  };
  onClick: () => void;
  onFavorite?: () => void;
  delay?: number;
}

export function RecentNoteCard({
  note,
  onClick,
  onFavorite,
  delay = 0,
}: RecentNoteCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card onClick={onClick} hover className="group cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
              {note.title || 'Untitled Note'}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
              {note.content || 'No content'}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-gray-500">
                {formatDate(note.updatedAt)}
              </span>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className={clsx(
              'flex-shrink-0 p-2 rounded-lg transition-all',
              note.isFavorite
                ? 'text-yellow-400 bg-yellow-400/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            )}
          >
            <svg
              className="w-5 h-5"
              fill={note.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976 2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518 4.674a1 1 0 00-.363 1.118l-3.976 2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519 4.674z"
              />
            </svg>
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

interface ActivityItemProps {
  activity: {
    id: string;
    type: 'note_created' | 'note_updated' | 'note_deleted' | 'link_created' | 'ai_interaction';
    noteTitle?: string;
    timestamp: Date;
    details?: string;
  };
  delay?: number;
}

export function ActivityItem({ activity, delay = 0 }: ActivityItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(date).toLocaleTimeString();
  };

  const activityIcons = {
    note_created: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    note_updated: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    note_deleted: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    link_created: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00-5.656 0l4 4a4 4 0 00-5.656 5.656l-1.1 1.1" />
      </svg>
    ),
    ai_interaction: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  };

  const activityColors = {
    note_created: 'bg-emerald-500/20 text-emerald-400',
    note_updated: 'bg-blue-500/20 text-blue-400',
    note_deleted: 'bg-red-500/20 text-red-400',
    link_created: 'bg-purple-500/20 text-purple-400',
    ai_interaction: 'bg-orange-500/20 text-orange-400',
  };

  const activityLabels = {
    note_created: 'Created note',
    note_updated: 'Updated note',
    note_deleted: 'Deleted note',
    link_created: 'Created link',
    ai_interaction: 'AI interaction',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div
        className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          activityColors[activity.type]
        )}
      >
        {activityIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          <span className="font-medium">{activityLabels[activity.type]}</span>
          {activity.noteTitle && (
            <span className="text-gray-400">: "{activity.noteTitle}"</span>
          )}
        </p>
        {activity.details && (
          <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
        )}
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">
        {formatTime(activity.timestamp)}
      </span>
    </motion.div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
}

export function EmptyState({ icon, title, description, action, delay = 0 }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
}

export function SectionHeader({ title, action, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between mb-4"
    >
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
