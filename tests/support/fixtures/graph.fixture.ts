/**
 * Graph Test Fixtures
 * 
 * Pre-defined test data for consistent testing
 */

import { createGraphData, createMetrics, createNote } from '../factories/graph.factory';

/**
 * Small dataset for basic tests
 */
export const mockGraphData = createGraphData(5, 7);

/**
 * Large dataset for performance tests
 */
export const largeGraphData = createGraphData(1000, 2000);

/**
 * Mock note for openNote functionality
 */
export const mockNote = createNote({
  id: 'test-note-123',
  title: 'Test Note for Graph',
  content: 'This is a test note to verify graph node clicking works correctly',
});

/**
 * Mock performance metrics
 */
export const mockMetrics = createMetrics();

/**
 * Empty graph state
 */
export const emptyGraphData = {
  nodes: [],
  links: [],
};

/**
 * Graph data with single isolated node
 */
export const isolatedNodeData = {
  nodes: [{ id: 'isolated', label: 'Isolated Node', group: 'folder-a', connections: 0 }],
  links: [],
};

/**
 * Graph data with highly connected cluster
 */
export const clusterData = createGraphData(10, 45); // 10 nodes, 45 links (highly connected)

/**
 * Graph data with multiple disconnected groups
 */
export const disconnectedGroupsData = {
  nodes: [
    { id: 'g1-n1', label: 'Group 1 Node 1', group: 'group-1', connections: 1 },
    { id: 'g1-n2', label: 'Group 1 Node 2', group: 'group-1', connections: 1 },
    { id: 'g2-n1', label: 'Group 2 Node 1', group: 'group-2', connections: 1 },
    { id: 'g2-n2', label: 'Group 2 Node 2', group: 'group-2', connections: 1 },
  ],
  links: [
    { source: 'g1-n1', target: 'g1-n2' },
    { source: 'g2-n1', target: 'g2-n2' },
  ],
};

/**
 * Graph data with nodes having varying connection counts
 */
export const variedConnectionsData = {
  nodes: [
    { id: 'high', label: 'High Connections', connections: 50 },
    { id: 'medium', label: 'Medium Connections', connections: 10 },
    { id: 'low', label: 'Low Connections', connections: 2 },
    { id: 'none', label: 'No Connections', connections: 0 },
  ],
  links: [
    { source: 'high', target: 'medium' },
    { source: 'high', target: 'low' },
    { source: 'medium', target: 'low' },
  ],
};

/**
 * Error state fixture
 */
export const errorState = {
  error: new Error('Database connection failed'),
  isError: true,
  isLoading: false,
  data: undefined,
};

/**
 * Loading state fixture
 */
export const loadingState = {
  isLoading: true,
  isError: false,
  error: null,
  data: undefined,
};
