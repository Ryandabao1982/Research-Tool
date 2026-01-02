import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from './Dashboard';
import { useRoleStore } from '../../../shared/stores/role-store';
import { invoke } from '@tauri-apps/api/tauri';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
    invoke: vi.fn(),
}));

// Mock role store
vi.mock('../../../shared/stores/role-store', () => ({
    useRoleStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Dashboard', () => {
    const mockSetRole = vi.fn();
    const mockInvoke = invoke as any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default mock for role store
        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'manager',
                setRole: mockSetRole,
                getThemeColor: () => 'blue',
            });
        });

        // Default mock for invoke
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'manager',
                widget_order: ['tasks-padding', 'project-deadlines'],
                updated_at: '2026-01-02T10:00:00',
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render loading state initially', () => {
        // Mock slow response
        mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
            success: true,
            layout: { role: 'manager', widget_order: [], updated_at: '' },
        }), 100)));

        render(<Dashboard />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render manager widgets for manager role', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Tasks Padding')).toBeInTheDocument();
            expect(screen.getByText('Project Deadlines')).toBeInTheDocument();
        });
    });

    it('should render learner widgets for learner role', async () => {
        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'learner',
                setRole: mockSetRole,
                getThemeColor: () => 'emerald',
            });
        });

        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'learner',
                widget_order: ['spaced-repetition', 'reading-list'],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('Spaced Repetition')).toBeInTheDocument();
            expect(screen.getByText('Reading List')).toBeInTheDocument();
        });
    });

    it('should call setRole when role switcher button is clicked', async () => {
        render(<Dashboard />);

        await waitFor(() => screen.getByText('Tasks Padding'));

        const learnerButton = screen.getByText('Learner');
        fireEvent.click(learnerButton);

        expect(mockSetRole).toHaveBeenCalledWith('learner');
    });

    it('should show role indicator on role change', async () => {
        const { rerender } = render(<Dashboard />);

        await waitFor(() => screen.getByText('Tasks Padding'));

        // Change role
        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'learner',
                setRole: mockSetRole,
                getThemeColor: () => 'emerald',
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

        rerender(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Switched to Learner role/i)).toBeInTheDocument();
        });
    });

    it('should handle error state gracefully', async () => {
        mockInvoke.mockResolvedValue({
            success: false,
            message: 'Database connection failed',
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/⚠️/i)).toBeInTheDocument();
        });
    });

    it('should validate layout against role', async () => {
        // Mock response with invalid widgets for role
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'manager',
                widget_order: ['tasks-padding', 'spaced-repetition'], // learner widget in manager layout
                updated_at: '2026-01-02T10:00:00',
            },
        });

        render(<Dashboard />);

        await waitFor(() => {
            // Should only show valid widget
            expect(screen.getByText('Tasks Padding')).toBeInTheDocument();
            // Should NOT show learner widget
            expect(screen.queryByText('Spaced Repetition')).not.toBeInTheDocument();
        });
    });

    it('should show empty state when no widgets available', async () => {
        mockInvoke.mockResolvedValue({
            success: true,
            layout: {
                role: 'coach',
                widget_order: [],
                updated_at: '2026-01-02T10:00:00',
            },
        });

        (useRoleStore as any).mockImplementation((selector: any) => {
            return selector({
                activeRole: 'coach',
                setRole: mockSetRole,
                getThemeColor: () => 'orange',
            });
        });

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/No Widgets Available/i)).toBeInTheDocument();
        });
    });

    it('should handle refresh button click', async () => {
        render(<Dashboard />);

        await waitFor(() => screen.getByText('Tasks Padding'));

        const refreshButton = screen.getByText('🔄 Refresh');
        fireEvent.click(refreshButton);

        // Should call invoke again
        expect(mockInvoke).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
    });

    it('should handle reset layout button', async () => {
        window.confirm = vi.fn(() => true);

        render(<Dashboard />);

        await waitFor(() => screen.getByText('Tasks Padding'));

        const resetButton = screen.getByText('↺ Reset to Default');
        fireEvent.click(resetButton);

        expect(window.confirm).toHaveBeenCalledWith('Reset dashboard layout to default?');
        expect(mockInvoke).toHaveBeenCalledWith('reset_dashboard_layout', { role: 'manager' });
    });
});
