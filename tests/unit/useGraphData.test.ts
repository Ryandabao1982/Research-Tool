/**
 * useGraphData Hook Tests - P1 Priority
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { ReactNode } from 'react';
import { useGraphData } from '../../src/features/graph/hooks/useGraphData';
import { createGraphData } from '../support/factories/graph.factory';

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/tauri';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGraphData Hook', () => {
  beforeEach(() => vi.clearAllMocks());

  test('P1: Basic structure - exports required properties', () => {
    const { result } = renderHook(() => useGraphData(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');
    expect(result.current).toHaveProperty('loadMore');
    expect(result.current).toHaveProperty('loadMoreLoading');
    expect(result.current).toHaveProperty('metrics');
  });

  test('P1: Initial loading - loads data successfully', async () => {
    const mockData = createGraphData(10, 15);
    (invoke as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGraphData({ limit: 10 }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });

  test('P1: Error handling - handles errors gracefully', async () => {
    (invoke as any).mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useGraphData({ limit: 10 }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  test('P1: Refresh - refreshes data when called', async () => {
    const mockData = createGraphData(5, 5);
    (invoke as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGraphData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    result.current.refresh();

    await waitFor(() => {
      expect((invoke as any).mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('P1: Load More - loads more nodes', async () => {
    const initialData = createGraphData(10, 15);
    const moreData = createGraphData(5, 7);
    
    (invoke as any)
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(moreData);

    const { result } = renderHook(() => useGraphData({ limit: 10 }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data?.nodes.length).toBe(10);
    });

    const loadedIds = result.current.data!.nodes.map(n => n.id);
    result.current.loadMore({ loadedIds });

    await waitFor(() => {
      expect(result.current.loadMoreLoading).toBe(false);
    });

    expect((invoke as any).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test('P1: Load More - validates loadedIds parameter', async () => {
    const mockData = createGraphData(5, 5);
    (invoke as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGraphData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    result.current.loadMore({ loadedIds: 'not-an-array' as any });

    await waitFor(() => {
      expect(result.current.loadMoreError).toBeDefined();
    });
  });

  test('P2: Query caching - caches data correctly', async () => {
    const mockData = createGraphData(5, 5);
    (invoke as any).mockResolvedValue(mockData);

    const queryClient = new QueryClient();
    const Wrapper = ({ children }: { children: ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result: result1, unmount: unmount1 } = renderHook(
      () => useGraphData({ limit: 10 }), 
      { wrapper: Wrapper }
    );
    
    await waitFor(() => {
      expect(result1.current.data).toBeDefined();
    });
    unmount1();

    (invoke as any).mockClear();
    const { result: result2 } = renderHook(
      () => useGraphData({ limit: 10 }), 
      { wrapper: Wrapper }
    );

    expect(invoke).not.toHaveBeenCalled();
    expect(result2.current.data).toEqual(mockData);
  });

  test('P2: Retry logic - retries failed requests', async () => {
    let attempts = 0;
    (invoke as any).mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Transient'));
      }
      return Promise.resolve(createGraphData(5, 5));
    });

    const { result } = renderHook(() => useGraphData({ limit: 10 }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    }, { timeout: 10000 });

    // Hook has retry: 3, so 1 initial + 3 retries = 4 total attempts
    expect(attempts).toBe(4);
  });

  test('P3: Edge cases - handles empty data', async () => {
    const emptyData = { nodes: [], links: [] };
    (invoke as any).mockResolvedValue(emptyData);

    const { result } = renderHook(() => useGraphData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toEqual(emptyData);
    });
  });

  test('P3: Edge cases - handles null response', async () => {
    (invoke as any).mockResolvedValue(null);

    const { result } = renderHook(() => useGraphData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
  });

  test('P3: Edge cases - handles large datasets', async () => {
    const largeData = createGraphData(1000, 2000);
    (invoke as any).mockResolvedValue(largeData);

    const { result } = renderHook(() => useGraphData({ limit: 1000 }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data?.nodes.length).toBe(1000);
    });
  });
});
