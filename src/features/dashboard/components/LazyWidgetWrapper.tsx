import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/shared/components/ui';
import { motion } from 'framer-motion';

interface LazyWidgetWrapperProps {
  widgetName: string;
  importFn: () => Promise<any>;
}

/**
 * Lazy loads a widget component with skeleton fallback
 * 
 * @example
 * <LazyWidgetWrapper
 *   widgetName="TasksPaddingWidget"
 *   importFn={() => import('./manager-widgets/TasksPaddingWidget')}
 * />
 */
export const LazyWidgetWrapper: React.FC<LazyWidgetWrapperProps> = ({
  widgetName,
  importFn,
}) => {
  const LazyComponent = lazy(importFn);

  return (
    <Suspense
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <Skeleton className="h-4 w-1/3 mb-3" />
            <Skeleton className="h-8 w-1/2 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-8 w-full mt-3" />
          </div>
        </motion.div>
      }
    >
      <LazyComponent />
    </Suspense>
  );
};

export default LazyWidgetWrapper;
