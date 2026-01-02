import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/tauri';
import { GraphData, GraphNode, GraphMetrics, GraphQueryParams } from '../types';

/**
 * Hook for managing graph data with TanStack Query caching
 */
export function useGraphData(params: GraphQueryParams = {}) {
  const queryClient = useQueryClient();

  // Main graph data query
  const graphQuery = useQuery({
    queryKey: ['graph', params],
    queryFn: async (): Promise<GraphData> => {
      try {
        if (params.incremental && params.loadedIds) {
          // Validate loadedIds
          if (!Array.isArray(params.loadedIds)) {
            throw new Error('loadedIds must be an array');
          }
          
          return await invoke<GraphData>('get_graph_incremental', {
            limit: params.limit || 500,
            loadedIds: params.loadedIds,
          });
        } else {
          return await invoke<GraphData>('get_graph', {
            limit: params.limit || 500,
          });
        }
      } catch (error) {
        // Provide detailed error information
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Graph data fetch failed:', error);
        throw new Error(`Failed to fetch graph data: ${errorMessage}`);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Get node neighbors query
  const getNeighbors = async (nodeId: string, limit: number = 50): Promise<GraphNode[]> => {
    return await invoke<GraphNode[]>('get_node_neighbors', {
      nodeId,
      limit,
    });
  };

  // Get performance metrics
  const metricsQuery = useQuery({
    queryKey: ['graph-metrics'],
    queryFn: async (): Promise<GraphMetrics> => {
      try {
        const result = await invoke<[number, number, number]>('get_graph_metrics');
        
        // Validate response structure
        if (!Array.isArray(result) || result.length !== 3) {
          throw new Error('Invalid metrics response format');
        }
        
        const [totalNodes, totalLinks, maxConnections] = result;
        
        // Validate values are numbers
        if (typeof totalNodes !== 'number' || typeof totalLinks !== 'number' || typeof maxConnections !== 'number') {
          throw new Error('Metrics values must be numbers');
        }
        
        return { totalNodes, totalLinks, maxConnections };
      } catch (error) {
        console.error('Metrics fetch failed:', error);
        throw new Error(`Failed to fetch metrics: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation to load more nodes incrementally
  const loadMoreMutation = useMutation({
    mutationFn: async ({ loadedIds }: { loadedIds: string[] }) => {
      // Validate loadedIds
      if (!Array.isArray(loadedIds) || loadedIds.length === 0) {
        throw new Error('loadedIds must be a non-empty array');
      }
      
      // Validate each ID is a string
      if (!loadedIds.every(id => typeof id === 'string')) {
        throw new Error('All loadedIds must be strings');
      }
      
      try {
        return await invoke<GraphData>('get_graph_incremental', {
          limit: 200,
          loadedIds,
        });
      } catch (error) {
        console.error('Incremental load failed:', error);
        throw new Error(`Failed to load more nodes: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    onSuccess: (newData) => {
      // Update the cache with merged data
      queryClient.setQueryData<GraphData>(['graph', params], (oldData) => {
        if (!oldData) return newData;
        
        // Merge nodes (avoid duplicates)
        const existingNodeIds = new Set(oldData.nodes.map(n => n.id));
        const newNodes = newData.nodes.filter(n => !existingNodeIds.has(n.id));
        
        // Merge links (avoid duplicates)
        const existingLinks = new Set(oldData.links.map(l => `${l.source}-${l.target}`));
        const newLinks = newData.links.filter(l => !existingLinks.has(`${l.source}-${l.target}`));
        
        return {
          nodes: [...oldData.nodes, ...newNodes],
          links: [...oldData.links, ...newLinks],
        };
      });
    },
    onError: (error) => {
      console.error('Load more failed:', error);
    },
  });

  // Mutation to refresh graph data
  const refreshMutation = useMutation({
    mutationFn: async () => {
      try {
        return await invoke<GraphData>('get_graph', {
          limit: params.limit || 500,
        });
      } catch (error) {
        console.error('Refresh failed:', error);
        throw new Error(`Failed to refresh: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['graph', params], data);
    },
    onError: (error) => {
      console.error('Refresh error:', error);
    },
  });

  return {
    // Data
    data: graphQuery.data,
    isLoading: graphQuery.isLoading,
    isError: graphQuery.isError,
    error: graphQuery.error,
    
    // Metrics
    metrics: metricsQuery.data,
    metricsLoading: metricsQuery.isLoading,
    metricsError: metricsQuery.error,
    
    // Actions
    getNeighbors,
    loadMore: loadMoreMutation.mutate,
    loadMoreLoading: loadMoreMutation.isPending,
    loadMoreError: loadMoreMutation.error,
    refresh: refreshMutation.mutate,
    refreshLoading: refreshMutation.isPending,
    refreshError: refreshMutation.error,
    
    // Refetch
    refetch: graphQuery.refetch,
    refetchMetrics: metricsQuery.refetch,
  };
}

/**
 * Hook for managing individual node data
 */
export function useNodeData(nodeId: string | null) {
  const query = useQuery({
    queryKey: ['node', nodeId],
    queryFn: async (): Promise<GraphNode | null> => {
      if (!nodeId) return null;
      // This would fetch additional node details if needed
      // For now, we rely on the main graph query
      return null;
    },
    enabled: !!nodeId,
    staleTime: 1000 * 60 * 5,
  });

  return query;
}
