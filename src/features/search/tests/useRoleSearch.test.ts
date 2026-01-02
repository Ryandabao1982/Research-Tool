import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoleSearch } from '../hooks/useRoleSearch';
import { useRoleStore } from '../../../shared/stores/role-store';
import { invoke } from '@tauri-apps/api/tauri';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

// Mock role store
vi.mock('../../../shared/stores/role-store', () => ({
  useRoleStore: vi.fn(),
}));

describe('useRoleSearch', () => {
  const mockInvoke = invoke as any;
  const mockUseRoleStore = useRoleStore as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockReset();
    
    // Default to manager role
    mockUseRoleStore.mockImplementation((selector: any) => {
      return selector({
        activeRole: 'manager',
      });
    });
  });

  it('should initialize with empty query and results', () => {
    const { result } = renderHook(() => useRoleSearch());
    
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update query when setQuery is called', () => {
    const { result } = renderHook(() => useRoleSearch());
    
    act(() => {
      result.current.setQuery('test');
    });
    
    expect(result.current.query).toBe('test');
  });

  it('should debounce search queries', async () => {
    mockInvoke.mockResolvedValue([]);
    const { result } = renderHook(() => useRoleSearch());
    
    act(() => {
      result.current.setQuery('test');
    });

    // Should not search immediately
    expect(result.current.isLoading).toBe(false);

    // Wait for debounce (300ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(result.current.isLoading).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith('search_with_role', {
      query: 'test',
      role: 'manager'
    });
  });

  it('should handle search results', async () => {
    const mockResults = [
      { id: '1', type: 'note', title: 'Test Note', description: 'Test', role: 'manager' }
    ];
    mockInvoke.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useRoleSearch());
    
    await act(async () => {
      result.current.setQuery('test');
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors', async () => {
    mockInvoke.mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useRoleSearch());
    
    await act(async () => {
      result.current.setQuery('test');
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(result.current.error).toBe('Search failed');
    expect(result.current.results).toEqual([]);
  });

  it('should clear results when query is empty', async () => {
    const { result } = renderHook(() => useRoleSearch());
    
    // First set a query and get results
    mockInvoke.mockResolvedValue([{ id: '1', type: 'note', title: 'Test' }]);
    
    await act(async () => {
      result.current.setQuery('test');
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(result.current.results.length).toBeGreaterThan(0);

    // Now clear the query
    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should use current role from store', async () => {
    mockUseRoleStore.mockImplementation((selector: any) => {
      return selector({
        activeRole: 'learner',
      });
    });

    const { result } = renderHook(() => useRoleSearch());
    
    await act(async () => {
      result.current.setQuery('test');
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(mockInvoke).toHaveBeenCalledWith('search_with_role', {
      query: 'test',
      role: 'learner'
    });
  });
});
