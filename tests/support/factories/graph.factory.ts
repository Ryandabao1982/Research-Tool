/**
 * Graph Data Factories
 * 
 * Factory patterns for generating test data for graph feature
 */

/**
 * Simple UUID generator
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Simple random word generator
 */
const generateWords = (count: number): string => {
  const words = ['graph', 'node', 'link', 'data', 'visual', 'network', 'connection', 'interactive'];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const word = words[Math.floor(Math.random() * words.length)];
    if (word) result.push(word);
  }
  return result.join(' ');
};

/**
 * Simple random element selector
 */
const randomElement = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

/**
 * Simple random number generator
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Graph node interface
 */
export interface GraphNode {
  id: string;
  label: string;
  group?: string;
  connections?: number;
}

/**
 * Graph link interface
 */
export interface GraphLink {
  source: string;
  target: string;
}

/**
 * Graph data interface
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Note interface
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Metrics interface
 */
export interface Metrics {
  totalNodes: number;
  totalLinks: number;
  maxConnections: number;
}

/**
 * Create a mock graph node
 */
export const createGraphNode = (overrides: Partial<GraphNode> = {}): GraphNode => {
  const groups = ['folder-a', 'folder-b', 'folder-c'];
  return {
    id: generateUUID(),
    label: generateWords(3),
    group: groups[Math.floor(Math.random() * groups.length)],
    connections: randomInt(0, 20),
    ...overrides,
  };
};

/**
 * Create multiple graph nodes
 */
export const createGraphNodes = (count: number): GraphNode[] => 
  Array.from({ length: count }, () => createGraphNode());

/**
 * Create a mock graph link
 */
export const createGraphLink = (sourceId?: string, targetId?: string): GraphLink => ({
  source: sourceId || generateUUID(),
  target: targetId || generateUUID(),
});

/**
 * Create multiple graph links
 */
export const createGraphLinks = (count: number, nodeIds?: string[]): GraphLink[] => {
  const links: GraphLink[] = [];
  for (let i = 0; i < count; i++) {
    if (nodeIds && nodeIds.length >= 2) {
      const source = randomElement(nodeIds);
      let target = randomElement(nodeIds);
      while (target === source) {
        target = randomElement(nodeIds);
      }
      links.push(createGraphLink(source, target));
    } else {
      links.push(createGraphLink());
    }
  }
  return links;
};

/**
 * Create a complete graph data structure
 */
export const createGraphData = (nodeCount: number, linkCount: number): GraphData => {
  const nodes = createGraphNodes(nodeCount);
  const nodeIds = nodes.map(n => n.id);
  const links = createGraphLinks(linkCount, nodeIds);
  
  return { nodes, links };
};

/**
 * Create mock note data for testing openNote functionality
 */
export const createNote = (overrides: Partial<Note> = {}): Note => ({
  id: generateUUID(),
  title: generateWords(5),
  content: generateWords(20),
  folder_id: randomElement(['folder-a', 'folder-b', 'folder-c']),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Create mock performance metrics
 */
export const createMetrics = (): Metrics => ({
  totalNodes: randomInt(10, 1000),
  totalLinks: randomInt(10, 500),
  maxConnections: randomInt(1, 50),
});

/**
 * Cleanup helpers (would interact with database in real app)
 */
export const deleteGraphNode = async (nodeId: string): Promise<void> => {
  // In real implementation: await fetch(`/api/graph/nodes/${nodeId}`, { method: 'DELETE' });
  return Promise.resolve();
};

export const deleteGraphLink = async (sourceId: string, targetId: string): Promise<void> => {
  // In real implementation: await fetch(`/api/graph/links`, { method: 'DELETE', body: JSON.stringify({ sourceId, targetId }) });
  return Promise.resolve();
};
