import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useRoleStore } from '../../../shared/stores/role-store';
import { useDebounce } from '@/shared/hooks/useDebounce';

export interface SearchResult {
  id: string;
  type: 'note' | 'task' | 'project' | 'learning' | 'team' | 'template';
  title: string;
  description?: string;
  role: 'manager' | 'learner' | 'coach' | 'universal';
  metadata: Record<string, any>;
}

export function useRoleSearch() {
  const activeRole = useRoleStore((state) => state.activeRole);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    } else {
      setResults([]);
      setError(null);
    }
  }, [debouncedQuery, activeRole]);

  const search = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock response for development - replace with actual backend call
      const response = await invoke('search_with_role', {
        query: searchQuery,
        role: activeRole
      }).catch(() => {
        // Fallback mock data for development
        return getMockResults(searchQuery, activeRole);
      });

      // Validate and transform results
      const validatedResults = (response as any[]).map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        role: item.role,
        metadata: item.metadata || {}
      }));

      setResults(validatedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    activeRole,
    search
  };
}

// Mock data for development
function getMockResults(query: string, role: string): any[] {
  const mockData = {
    manager: [
      { id: '1', type: 'note', title: 'Q4 Budget Review', description: 'Financial planning for Q4', role: 'manager' },
      { id: '2', type: 'task', title: 'Team Standup', description: 'Daily sync meeting', role: 'manager' },
      { id: '3', type: 'project', title: 'Product Launch', description: 'New feature rollout', role: 'manager' },
    ],
    learner: [
      { id: '4', type: 'note', title: 'React Fundamentals', description: 'Core concepts of React', role: 'learner' },
      { id: '5', type: 'learning', title: 'TypeScript Course', description: 'Advanced TypeScript patterns', role: 'learner' },
      { id: '6', type: 'note', title: 'Study Notes', description: 'Week 3 material', role: 'learner' },
    ],
    coach: [
      { id: '7', type: 'note', title: 'Team Retrospective', description: 'Sprint 12 review', role: 'coach' },
      { id: '8', type: 'team', title: 'Engineering Team', description: 'Backend developers', role: 'coach' },
      { id: '9', type: 'template', title: '1:1 Meeting', description: 'Coaching framework', role: 'coach' },
    ],
  };

  const roleData = mockData[role as keyof typeof mockData] || [];
  return roleData.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase())
  );
}
