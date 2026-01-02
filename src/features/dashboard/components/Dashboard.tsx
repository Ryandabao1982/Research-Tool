import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoleStore } from '../../../shared/stores/role-store';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import {
    getWidgetComponent,
    validateLayoutForRole,
    getAvailableWidgetIdsForRole
} from './WidgetRegistry';
import DraggableWidgetContainer from './DraggableWidgetContainer';

/**
 * Dashboard Component
 * 
 * Features:
 * - Subscribes to role store for real-time updates
 * - Loads role-specific layouts from backend
 * - Supports drag-and-drop reordering
 * - Auto-saves layout changes
 * - Validates widgets against current role
 */
export const Dashboard: React.FC = () => {
    const activeRole = useRoleStore((state) => state.activeRole);
    const setRole = useRoleStore((state) => state.setRole);
    
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

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 font-sans">
                            Dashboard
                        </h1>
                        <p className="text-sm text-neutral-600 mt-1">
                            Role-based widget layout - {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
                        </p>
                    </div>
                    
                    {/* Role Switcher */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600 mr-2">Switch Role:</span>
                        {(['manager', 'coach', 'learner'] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleSwitch(role)}
                                className={`px-3 py-1.5 text-sm font-sans font-medium rounded transition-colors ${
                                    activeRole === role
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                                }`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="px-3 py-1.5 text-sm bg-white text-neutral-700 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 text-sm bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                        ↺ Reset to Default
                    </button>
                    {isSaving && (
                        <span className="text-sm text-blue-600 animate-pulse">
                            Saving...
                        </span>
                    )}
                </div>
            </div>

            {/* Role Indicator */}
            <AnimatePresence>
                {showRoleIndicator && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
                    >
                        Switched to {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} role
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    ⚠️ {error}
                </div>
            )}

            {/* Empty State */}
            {widgetOrder.length === 0 && (
                <div className="text-center py-12 bg-white border-2 border-dashed border-neutral-300 rounded-lg">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                        No Widgets Available
                    </h3>
                    <p className="text-sm text-neutral-600">
                        This role has no widgets configured yet.
                    </p>
                    <button
                        onClick={handleReset}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Load Default Layout
                    </button>
                </div>
            )}

            {/* Widget Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <AnimatePresence mode="popLayout">
                    {widgetOrder.map((widgetId, index) => {
                        const WidgetComponent = getWidgetComponent(widgetId);
                        if (!WidgetComponent) return null;

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
                                <WidgetComponent />
                            </DraggableWidgetContainer>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Available Widgets Info */}
            {widgetOrder.length > 0 && (
                <div className="mt-6 p-4 bg-white border border-neutral-200 rounded-lg">
                    <h4 className="font-sans font-semibold text-sm text-neutral-800 mb-2">
                        Available Widgets for {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {getAvailableWidgetIdsForRole(activeRole).map((id) => (
                            <span
                                key={id}
                                className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded font-mono"
                            >
                                {id}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        💡 Drag widgets to reorder. Changes auto-save to your role-specific layout.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
