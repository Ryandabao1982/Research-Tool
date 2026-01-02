/**
 * Graph Data Types for D3.js Force-Directed Visualization
 */

/**
 * Graph node structure for D3.js visualization
 */
export interface GraphNode {
  id: string;
  label: string;
  group?: string;
  connections?: number;
}

/**
 * Graph link structure for D3.js visualization
 */
export interface GraphLink {
  source: string;
  target: string;
  value?: number;
}

/**
 * Complete graph data structure
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * D3 simulation node with position data
 */
export interface SimulationNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

/**
 * D3 simulation link with source/target objects
 */
export interface SimulationLink {
  source: SimulationNode;
  target: SimulationNode;
  value?: number;
}

/**
 * Graph view state
 */
export interface GraphViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNode: string | null;
  highlightedNodes: Set<string>;
  hoveredNode: string | null;
}

/**
 * Performance metrics
 */
export interface GraphMetrics {
  totalNodes: number;
  totalLinks: number;
  maxConnections: number;
  fps?: number;
  renderTime?: number;
}

/**
 * Graph query parameters
 */
export interface GraphQueryParams {
  limit?: number;
  loadedIds?: string[];
  incremental?: boolean;
}
