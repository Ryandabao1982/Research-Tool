import { useState, useEffect } from 'react';
import { useRoleStore } from '../../shared/stores/role-store';

export interface DashboardStats {
    notesCount: number;
    tasksPending: number;
    studyStreak: number;
    activityHeatmap: { date: string; value: number; hasAction?: boolean; note?: any }[];
    recentNotes: any[];
}

export function useDashboardStats() {
    const { activeRole } = useRoleStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        const fetchStats = async () => {
            setIsLoading(true);

            // Mock Data - In real app, fetch from Tauri command or React Query
            // We can vary this based on role if we want different "views"

            await new Promise(resolve => setTimeout(resolve, 800)); // Fake network lag

            const mockHeatmap = Array.from({ length: 21 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (20 - i));

                let note = null;
                if (i === 20) note = { title: 'Today\'s Journal', time: '10 AM', type: 'Daily', hasAction: true };
                if (i === 15) note = { title: 'Project Plan', time: '2 PM', type: 'Work' };

                return {
                    date: date.toISOString().split('T')[0] || '',
                    value: Math.floor(Math.random() * 5),
                    note
                };
            });

            setStats({
                notesCount: 142,
                tasksPending: activeRole === 'manager' ? 5 : 2,
                studyStreak: 12,
                activityHeatmap: mockHeatmap,
                recentNotes: []
            });

            setIsLoading(false);
        };

        fetchStats();
    }, [activeRole]);

    return { stats, isLoading };
}
