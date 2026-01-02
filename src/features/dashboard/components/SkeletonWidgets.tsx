import React from 'react';
import { Skeleton } from '@/shared/components/ui';
import { motion } from 'framer-motion';

/**
 * Generic skeleton widget for any dashboard widget
 */
export const GenericSkeletonWidget: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-neutral-200 rounded-lg p-4"
    >
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </motion.div>
  );
};

/**
 * Task widget skeleton
 */
export const TasksSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-neutral-200 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-9 w-full" />
    </motion.div>
  );
};

/**
 * Reading list widget skeleton
 */
export const ReadingListSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-neutral-200 rounded-lg p-4"
    >
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Spaced repetition widget skeleton
 */
export const SpacedRepetitionSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-neutral-200 rounded-lg p-4"
    >
      <Skeleton className="h-5 w-28 mb-3" />
      <Skeleton className="h-12 w-full mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </motion.div>
  );
};

/**
 * Project deadlines widget skeleton
 */
export const ProjectDeadlinesSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-neutral-200 rounded-lg p-4"
    >
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-2/3" />
      </div>
    </motion.div>
  );
};
