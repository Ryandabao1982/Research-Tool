import { useState, useEffect } from 'react';
import { useRoleStore } from '../../shared/stores/role-store';
import { DashboardStats, HeatmapDataPoint, Note } from '../../shared/types/dashboard';

// Separate mock data generation logic
const generateMockHeatmap = (): HeatmapDataPoint[] => {
    return Array.from({ length: 21 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (20 - i));
        
        // Ensure consistent formatting (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0] || '';

        let note: Note | null = null;
        if (i === 20) {
             note = { 
                id: 'mock-1', 
                title: 'Today\'s Journal', 
                content: '', 
                createdAt: date, 
                updatedAt: date, 
                tags: [], 
                time: '10 AM', 
                type: 'Daily', 
                hasAction: true 
            };
        }
        if (i === 15) {
            note = { 
                id: 'mock-2', 
                title: 'Project Plan', 
                content: '', 
                createdAt: date, 
                updatedAt: date, 
                tags: [], 
                time: '2 PM', 
                type: 'Work' 
            };
        }

        return {
            date: dateString,
            value: Math.floor(Math.random() * 5),
            note: note,
            hasAction: !!note?.hasAction
        };
    });
};

export function useDashboardStats() {
    const { activeRole } = useRoleStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            
            try {
                // Simulating data structure based on role
                const mockHeatmap = generateMockHeatmap();
                
                const newStats: DashboardStats = {
                    notesCount: 142,
                    tasksPending: activeRole === 'manager' ? 5 : 2,
                    studyStreak: 12,
                    activityHeatmap: mockHeatmap,
                    recentNotes: [] 
                };

                setStats(newStats);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [activeRole]);

    return { stats, isLoading };
}
