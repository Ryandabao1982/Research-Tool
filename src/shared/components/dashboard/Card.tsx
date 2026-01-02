/**
 * @fileoverview Dashboard Card Components Library - Rational Grid
 * 
 * Provides reusable card components following Rational Grid design system.
 * All components use 8px spacing, zero border-radius, and neutral borders.
 * 
 * @module shared/components/dashboard/Card
 * @requires react
 * @requires framer-motion
 * @requires clsx
 */

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { clsx } from 'clsx';
import { cn } from '../../utils';

// ============================================================================
// Types
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  dark?: boolean;
  delay?: number;
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  delay?: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'orange';
  delay?: number;
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

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
}

// ============================================================================
// Animation Variants
// ============================================================================

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// ============================================================================
// Base Card Component
// ============================================================================

export function Card({
  children,
  className,
  onClick,
  hover = false,
  dark = false,
  delay = 0,
}: CardProps) {
  const baseClasses = dark
    ? 'bg-neutral-950 border-neutral-800 text-white'
    : 'bg-white border-neutral-200 text-neutral-900';

  const hoverClasses = hover
    ? 'hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer transition-colors'
    : 'cursor-default';

  const motionProps = {
    initial: 'hidden',
    animate: 'visible',
    variants: cardVariants,
    transition: { duration: 0.3, delay },
  };

  const baseCardClasses = 'p-8 border rounded-none';

  if (onClick) {
    const buttonProps = {
      ...motionProps,
      onClick,
      className: cn(
        baseCardClasses,
        baseClasses,
        hoverClasses,
        className ?? ''
      ),
    };

    if (hover) {
      return (
        <motion.button
          {...buttonProps}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
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
        baseCardClasses,
        baseClasses,
        hoverClasses,
        className ?? ''
      )}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// GlassCard (Deprecated)
// ============================================================================

export function GlassCard({
  children,
  className,
  onClick,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  console.warn('GlassCard is deprecated. Use Card component with Rational Grid classes.');
  
  const cardProps: Partial<CardProps> = { hover, dark: false, delay };
  if (className !== undefined) cardProps.className = className;
  if (onClick !== undefined) cardProps.onClick = onClick;

  return (
    <Card {...cardProps as CardProps}>
      {children}
    </Card>
  );
}

// ============================================================================
// StatCard
// ============================================================================

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  const iconBgClasses = {
    blue: 'bg-primary/10 border-primary/20',
    green: 'bg-emerald-500/10 border-emerald-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  };

  const iconColorClasses = {
    blue: 'text-primary',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card hover className="group relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div
            className={clsx(
              'p-3 border rounded-none flex items-center justify-center',
              iconBgClasses[color]
            )}
          >
            <div className={clsx('w-5 h-5', iconColorClasses[color])}>{icon}</div>
          </div>
          {trend && (
            <div
              className={clsx(
                'text-xs font-mono px-2 py-1 border rounded-none',
                trend.value >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-sans text-neutral-600">{title}</p>
          <p className="text-3xl font-sans font-bold">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// QuickActionCard
// ============================================================================

export function QuickActionCard({ action, onClick, delay = 0 }: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card onClick={onClick} hover className="flex items-center gap-4 p-4 group">
        <div className="flex-shrink-0 w-12 h-12 border rounded-none bg-primary/10 border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
          {action.icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-sans font-semibold">{action.title}</h3>
          <p className="text-sm text-neutral-600">{action.description}</p>
        </div>
        {action.shortcut && (
          <kbd className="hidden md:inline-flex items-center px-2 py-1 border rounded-none bg-neutral-50 border-neutral-200 text-xs text-neutral-600 font-mono">
            {action.shortcut}
          </kbd>
        )}
      </Card>
    </motion.div>
  );
}

// ============================================================================
// RecentNoteCard
// ============================================================================

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
            <h3 className="font-sans font-semibold truncate group-hover:text-primary transition-colors">
              {note.title || 'Untitled Note'}
            </h3>
            <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
              {note.content || 'No content'}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-xs text-neutral-500">
                {formatDate(note.updatedAt)}
              </span>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2 py-0.5 border rounded-none bg-primary/10 border-primary/20 text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="font-mono text-xs text-neutral-500">
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
              'flex-shrink-0 p-2 border rounded-none transition-all',
              note.isFavorite
                ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-600'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 border-neutral-200'
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

// ============================================================================
// ActivityItem
// ============================================================================

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
    note_created: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    note_updated: 'bg-primary/10 text-primary border-primary/20',
    note_deleted: 'bg-red-500/10 text-red-600 border-red-500/20',
    link_created: 'bg-primary/10 text-primary border-primary/20',
    ai_interaction: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
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
      className="flex items-start gap-3 p-3 border rounded-none hover:bg-neutral-50 transition-colors"
    >
      <div
        className={clsx(
          'flex-shrink-0 w-8 h-8 border rounded-none flex items-center justify-center',
          activityColors[activity.type]
        )}
      >
        {activityIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans">
          <span className="font-medium">{activityLabels[activity.type]}</span>
          {activity.noteTitle && (
            <span className="text-neutral-600">: "{activity.noteTitle}"</span>
          )}
        </p>
        {activity.details && (
          <p className="font-mono text-xs text-neutral-500 mt-0.5">{activity.details}</p>
        )}
      </div>
      <span className="font-mono text-xs text-neutral-500 flex-shrink-0">
        {formatTime(activity.timestamp)}
      </span>
    </motion.div>
  );
}

// ============================================================================
// EmptyState
// ============================================================================

export function EmptyState({ icon, title, description, action, delay = 0 }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 border rounded-none bg-neutral-50 border-neutral-200 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-sans font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rg-btn rg-btn-primary"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ============================================================================
// SectionHeader
// ============================================================================

export function SectionHeader({ title, action, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between mb-4"
    >
      <h2 className="text-lg font-sans font-semibold">{title}</h2>
      {action && (
        <button
          onClick={action.onClick}
          className="rg-btn rg-btn-ghost text-sm"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}