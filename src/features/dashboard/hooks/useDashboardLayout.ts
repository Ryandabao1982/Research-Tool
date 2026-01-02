import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useRoleStore, UserRole } from '../../../shared/stores/role-store';

export interface DashboardLayout {
    role: string;
    widget_order: string[];
    updated_at: string;
}

export interface UseDashboardLayoutReturn {
    layout: DashboardLayout | null;
    loading: boolean;
    error: string | null;
    saveLayout: (widgetOrder: string[]) => Promise<void>;
    resetLayout: () => Promise<void>;
    refreshLayout: () => Promise<void>;
}

/**
 * Hook for managing role-based dashboard layouts
 * 
 * Features:
 * - Loads layout from backend on mount and role changes
 * - Auto-saves layout changes with debouncing
 * - Provides methods to save, reset, and refresh layouts
 * - Subscribes to role store for real-time updates
 */
export const useDashboardLayout = (): UseDashboardLayoutReturn => {
    const [layout, setLayout] = useState<DashboardLayout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const activeRole = useRoleStore((state) => state.activeRole);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load layout for current role
    const loadLayout = useCallback(async (role: UserRole) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await invoke<{ success: boolean; layout?: DashboardLayout; message?: string }>(
                'load_dashboard_layout',
                { role }
            );
            
            if (result.success && result.layout) {
                setLayout(result.layout);
            } else {
                setError(result.message || 'Failed to load layout');
                // Set a default layout based on role
                const defaultLayout: DashboardLayout = {
                    role,
                    widget_order: getDefaultWidgetsForRole(role),
                    updated_at: new Date().toISOString()
                };
                setLayout(defaultLayout);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error loading layout';
            setError(errorMessage);
            // Fallback to default layout
            const defaultLayout: DashboardLayout = {
                role,
                widget_order: getDefaultWidgetsForRole(role),
                updated_at: new Date().toISOString()
            };
            setLayout(defaultLayout);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect: Load layout when role changes
    useEffect(() => {
        loadLayout(activeRole);
        
        // Cleanup any pending save timeouts
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [activeRole, loadLayout]);

    // Save layout with debouncing
    const saveLayout = useCallback(async (widgetOrder: string[]) => {
        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Optimistically update local state
        if (layout) {
            setLayout({
                ...layout,
                widget_order: widgetOrder,
                updated_at: new Date().toISOString()
            });
        }

        // Debounced save to backend
        return new Promise<void>((resolve, reject) => {
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    const result = await invoke<{ success: boolean; message?: string }>(
                        'save_dashboard_layout',
                        {
                            request: {
                                role: activeRole,
                                widget_order: widgetOrder
                            }
                        }
                    );

                    if (!result.success) {
                        throw new Error(result.message || 'Failed to save layout');
                    }

                    // Update state with confirmed save
                    if (layout) {
                        setLayout({
                            ...layout,
                            widget_order: widgetOrder,
                            updated_at: new Date().toISOString()
                        });
                    }
                    
                    resolve();
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error saving layout';
                    reject(errorMessage);
                    setError(errorMessage);
                }
            }, 300); // 300ms debounce
        });
    }, [layout, activeRole]);

    // Reset layout to default
    const resetLayout = useCallback(async () => {
        setLoading(true);
        try {
            const result = await invoke<{ success: boolean; message?: string }>(
                'reset_dashboard_layout',
                { role: activeRole }
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to reset layout');
            }

            // Reload to get the reset layout
            await loadLayout(activeRole);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error resetting layout';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [activeRole, loadLayout]);

    // Manually refresh layout
    const refreshLayout = useCallback(async () => {
        await loadLayout(activeRole);
    }, [activeRole, loadLayout]);

    return {
        layout,
        loading,
        error,
        saveLayout,
        resetLayout,
        refreshLayout
    };
};

// Helper function to get default widgets for a role
function getDefaultWidgetsForRole(role: UserRole): string[] {
    switch (role) {
        case 'manager':
            return ['tasks-padding', 'project-deadlines'];
        case 'learner':
            return ['spaced-repetition', 'reading-list'];
        case 'coach':
            return [];
        default:
            return [];
    }
}
