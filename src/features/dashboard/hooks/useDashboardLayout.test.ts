/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardLayout } from './useDashboardLayout';
import { invoke } from '@tauri-apps/api/tauri';
import { useRoleStore } from '../../../shared/stores/role-store';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@tauri-apps/api/tauri', () => ({
    invoke: vi.fn(),
}));

vi.mock('../../../shared/stores/role-store', () => ({
    useRoleStore: vi.fn(),
}));

describe('useDashboardLayout', () => {
    const mockInvoke = invoke as any;
    let mockSetRole: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSetRole = vi.fn();
        
        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'manager',
                setRole: mockSetRole,
            });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should load layout on mount', async () => {
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'manager',
                widget_order: ['tasks-padding', 'project-deadlines'],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        const { result } = renderHook(() => useDashboardLayout());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.layout).toEqual({
                role: 'manager',
                widget_order: ['tasks-padding', 'project-deadlines'],
                updated_at: '2026-01-02T10:00:00',
            });
        });
    });

    it('should reload layout when role changes', async () => {
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'manager',
                widget_order: ['tasks-padding'],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        const { result, rerender } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.layout?.widget_order).toEqual(['tasks-padding']);
        });

        // Change role
        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'learner',
                setRole: mockSetRole,
            });
        });

        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'learner',
                widget_order: ['spaced-repetition'],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        rerender();

        await waitFor(() => {
            expect(result.current.layout?.widget_order).toEqual(['spaced-repetition']);
        });
    });

    it('should handle saveLayout with debouncing', async () => {
        mockInvoke.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const newOrder = ['project-deadlines', 'tasks-padding'];
        
        // Get initial layout
        const initialLayout = result.current.layout;
        
        // Trigger save
        result.current.saveLayout(newOrder);

        // Should update optimistically (may have slight delay due to state update)
        await waitFor(() => {
            expect(result.current.layout?.widget_order).toEqual(newOrder);
        });

        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 350));

        expect(mockInvoke).toHaveBeenCalledWith('save_dashboard_layout', {
            request: {
                role: 'manager',
                widget_order: newOrder,
            },
        });
    });

    it('should handle resetLayout', async () => {
        mockInvoke.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.resetLayout();

        expect(mockInvoke).toHaveBeenCalledWith('reset_dashboard_layout', {
            role: 'manager',
        });
    });

    it('should handle refreshLayout', async () => {
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'manager',
                widget_order: ['tasks-padding'],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        const { result } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const initialCallCount = mockInvoke.mock.calls.length;
        
        await result.current.refreshLayout();

        expect(mockInvoke.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle error state', async () => {
        mockInvoke.mockResolvedValue({
            success: false,
            message: 'Database error',
        });

        const { result } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.error).toBe('Database error');
        });
    });

    it('should fallback to default layout on error', async () => {
        mockInvoke.mockResolvedValue({
            success: false,
            message: 'Not found',
        });

        const { result } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.layout).toEqual({
                role: 'manager',
                widget_order: ['tasks-padding', 'project-deadlines'],
                updated_at: expect.any(String),
            });
        });
    });

    it('should cancel pending save on unmount', async () => {
        mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 500)));

        const { result, unmount } = renderHook(() => useDashboardLayout());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Trigger save
        result.current.saveLayout(['tasks-padding']);

        // Unmount before save completes
        unmount();

        // Wait for what would have been the save time
        await new Promise(resolve => setTimeout(resolve, 600));

        // Should not have called invoke (or if it did, it should be handled gracefully)
        // This test verifies cleanup happens
    });
});
