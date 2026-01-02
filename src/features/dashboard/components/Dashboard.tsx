import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoleStore } from '../../../shared/stores/role-store';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import {
    getWidgetComponent,
    validateLayoutForRole,
    getAvailableWidgetIdsForRole,
    getWidgetImport
} from './WidgetRegistry';
import DraggableWidgetContainer from './DraggableWidgetContainer';
import { LazyWidgetWrapper } from './LazyWidgetWrapper';
import { usePerformanceMonitor, globalPerformance } from '@/shared/hooks/usePerformanceMonitor';

/**
 * Dashboard Component
 * 
 * Features:
 * - Subscribes to role store for real-time updates
 * - Loads role-specific layouts from backend
 * - Supports drag-and-drop reordering
 * - Auto-saves layout changes
 * - Validates widgets against current role
 * - Framer Motion animations
 */
export const Dashboard: React.FC = () => {
    const activeRole = useRoleStore((state) => state.activeRole);
    const setRole = useRoleStore((state) => state.setRole);
    
    // Performance monitoring
    const { trackApiCall, logSummary } = usePerformanceMonitor('Dashboard');
    const loadStartTime = useRef(performance.now());

    const {
        layout,
        loading,
        error,
        saveLayout,
        resetLayout,
        refreshLayout
    } = useDashboardLayout();

    const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
    const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showRoleIndicator, setShowRoleIndicator] = useState(false);

    // Update local widget order when layout changes
    useEffect(() => {
        if (layout?.widget_order) {
            // Validate layout against current role
            const validated = validateLayoutForRole(layout.widget_order, activeRole);
            setWidgetOrder(validated);
        }
    }, [layout, activeRole]);

    // Show role indicator on role change
    useEffect(() => {
        setShowRoleIndicator(true);
        const timer = setTimeout(() => setShowRoleIndicator(false), 2000);
        return () => clearTimeout(timer);
    }, [activeRole]);

    // Handle drag start
    const handleDragStart = (widgetId: string) => {
        setDraggedWidgetId(widgetId);
    };

    // Handle drag end (reorder)
    const handleDragEnd = async (draggedId: string, targetIndex: number) => {
        setDraggedWidgetId(null);

        const currentIndex = widgetOrder.indexOf(draggedId);
        if (currentIndex === -1 || currentIndex === targetIndex) {
            return;
        }

        // Create new order
        const newOrder = [...widgetOrder];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, draggedId);

        setWidgetOrder(newOrder);

        // Auto-save with debouncing
        try {
            setIsSaving(true);
            await saveLayout(newOrder);
        } catch (err) {
            console.error('Failed to save layout:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle role switch
    const handleRoleSwitch = (newRole: 'manager' | 'coach' | 'learner') => {
        setRole(newRole);
    };

    // Handle reset layout
    const handleReset = async () => {
        if (confirm('Reset dashboard layout to default?')) {
            await resetLayout();
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        await refreshLayout();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // Track dashboard load time
    useEffect(() => {
        if (!loading && widgetOrder.length > 0) {
            const loadTime = globalPerformance.trackDashboardLoad(loadStartTime.current);
            trackApiCall(loadTime);
            logSummary();
        }
    }, [loading, widgetOrder.length]);

    // Memoized widget renderer with lazy loading
    const renderWidget = useCallback((widgetId: string, index: number) => {
        const importFn = getWidgetImport(widgetId);
        if (!importFn) return null;

        return (
            <LazyWidgetWrapper
                key={widgetId}
                widgetName={widgetId}
                importFn={importFn}
            />
        );
    }, []);

    // Memoized widget order to prevent unnecessary re-renders
    const memoizedWidgetOrder = useMemo(() => widgetOrder, [widgetOrder]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-neutral-50 p-6"
        >
            {/* Header */}
            <motion.div 
                className="mb-6 bg-white rounded-lg border border-neutral-200 shadow-sm p-6"
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="text-2xl"
                        >
                            📊
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 font-sans">
                                Dashboard
                            </h2>
                            <p className="text-sm text-neutral-600 mt-1">
                                Role-based widget layout -{' '}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                                    {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Role Switcher */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600 mr-2">Switch Role:</span>
                        {(['manager', 'coach', 'learner'] as const).map((role) => (
                            <motion.div
                                key={role}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <button
                                    onClick={() => handleRoleSwitch(role)}
                                    className={`px-3 py-1.5 text-sm font-sans font-medium rounded transition-all ${
                                        activeRole === role
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-blue-300'
                                    }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button
                            onClick={handleRefresh}
                            className="px-3 py-1.5 text-sm bg-white text-neutral-700 border border-neutral-300 rounded hover:bg-neutral-50 transition-all flex items-center gap-2"
                        >
                            <span>🔄</span> Refresh
                        </button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button
                            onClick={handleReset}
                            className="px-3 py-1.5 text-sm bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-all flex items-center gap-2"
                        >
                            <span>↺</span> Reset to Default
                        </button>
                    </motion.div>
                    <AnimatePresence>
                        {isSaving && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-sm text-blue-600 flex items-center gap-1"
                            >
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    ●
                                </motion.span>
                                Saving...
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Role Indicator */}
            <AnimatePresence>
                {showRoleIndicator && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed top-24 right-6 z-50"
                    >
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                            ✓ Switched to {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} role
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                            ⚠️ {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            <AnimatePresence>
                {widgetOrder.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="border-2 border-dashed border-neutral-300 bg-white rounded-lg p-8 text-center">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-5xl mb-3"
                            >
                                📊
                            </motion.div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                                No Widgets Available
                            </h3>
                            <p className="text-sm text-neutral-600 mb-4">
                                This role has no widgets configured yet.
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Load Default Layout
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Widget Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <AnimatePresence mode="popLayout">
                    {memoizedWidgetOrder.map((widgetId, index) => {
                        const importFn = getWidgetImport(widgetId);
                        if (!importFn) return null;

                        return (
                            <DraggableWidgetContainer
                                key={widgetId}
                                widgetId={widgetId}
                                index={index}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                isDragging={draggedWidgetId === widgetId}
                                className="w-full"
                            >
                                <LazyWidgetWrapper
                                    widgetName={widgetId}
                                    importFn={importFn}
                                />
                            </DraggableWidgetContainer>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Available Widgets Info */}
            <AnimatePresence>
                {widgetOrder.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-6"
                    >
                        <div className="bg-white border border-neutral-200 rounded-lg p-4">
                            <h4 className="font-sans font-semibold text-sm text-neutral-800 mb-2">
                                Available Widgets for {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}:
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {getAvailableWidgetIdsForRole(activeRole).map((id) => (
                                    <motion.div
                                        key={id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded font-mono">
                                            {id}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-xs text-neutral-500">
                                💡 Drag widgets to reorder. Changes auto-save to your role-specific layout.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
