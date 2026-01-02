import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useGraphData } from '../hooks/useGraphData';
import { SimulationNode, SimulationLink, GraphViewState } from '../types';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from 'sonner';

interface GraphViewProps {
  className?: string;
  initialLimit?: number;
}

/**
 * GraphView Component - D3.js Force-Directed Graph Visualization
 * 
 * Features:
 * - Force-directed layout with collision detection
 * - Zoom and pan controls
 * - Hover to highlight connections
 * - Click to open note
 * - Lazy loading for large datasets
 * - Performance optimizations (LOD, RAF)
 */
export const GraphView: React.FC<GraphViewProps> = ({ 
  className = '', 
  initialLimit = 500 
}) => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
  
  // Graph state
  const [viewState, setViewState] = useState<GraphViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNode: null,
    highlightedNodes: new Set(),
    hoveredNode: null,
  });

  // Performance display state (updated once per second)
  const [performance, setPerformance] = useState({ fps: 0, renderTime: 0 });
  
  // Performance tracking refs (no re-renders)
  const performanceRef = useRef({ fps: 0, renderTime: 0, lastUpdate: 0 });
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Get graph data from hook
  const { 
    data, 
    isLoading, 
    error, 
    refresh, 
    loadMore, 
    loadMoreLoading,
    metrics 
  } = useGraphData({ limit: initialLimit });

  // Update performance display every second (not every frame)
  useEffect(() => {
    const interval = setInterval(() => {
      if (performanceRef.current.lastUpdate !== lastFrameTime.current) {
        // Update state only once per second
        setPerformance({
          fps: performanceRef.current.fps,
          renderTime: performanceRef.current.renderTime,
        });
        performanceRef.current.lastUpdate = lastFrameTime.current;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate LOD (Level of Detail) based on zoom level
  const getVisibleNodes = useCallback((nodes: SimulationNode[], zoom: number) => {
    if (!nodes) return [];
    
    // At low zoom, show only highly connected nodes
    if (zoom < 0.5) {
      return nodes.filter(n => 
        (n.connections ?? 0) > 10 || 
        viewState.highlightedNodes.has(n.id) ||
        n.id === viewState.selectedNode
      );
    }
    
    return nodes;
  }, [viewState.highlightedNodes, viewState.selectedNode]);

  // Highlight connections on hover
  const highlightConnections = useCallback((nodeId: string, nodes: SimulationNode[], links: SimulationLink[]) => {
    const connectedNodes = new Set<string>([nodeId]);
    
    // Find all direct connections
    links.forEach(link => {
      if (link.source.id === nodeId) {
        connectedNodes.add(link.target.id);
      } else if (link.target.id === nodeId) {
        connectedNodes.add(link.source.id);
      }
    });

    // Find indirect connections (2 hops)
    links.forEach(link => {
      if (connectedNodes.has(link.source.id) && link.target.id !== nodeId) {
        connectedNodes.add(link.target.id);
      }
      if (connectedNodes.has(link.target.id) && link.source.id !== nodeId) {
        connectedNodes.add(link.source.id);
      }
    });

    setViewState(prev => ({
      ...prev,
      highlightedNodes: connectedNodes,
      hoveredNode: nodeId,
    }));
  }, []);

  // Clear highlights
  const clearHighlights = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      highlightedNodes: new Set(),
      hoveredNode: null,
    }));
  }, []);

  // Open note when node is clicked
  const openNote = useCallback(async (nodeId: string) => {
    try {
      // Get note details
      const note = await invoke<{ id: string; title: string }>('get_note', { id: nodeId });
      
      // Validate note structure
      if (!note || !note.id) {
        throw new Error('Note not found or invalid response');
      }
      
      // Navigate to note view (assuming route exists)
      // For now, we'll use a toast to show it works
      toast.success(`Opening note: ${note.title || nodeId}`);
      
      // Update selected node
      setViewState(prev => ({
        ...prev,
        selectedNode: nodeId,
      }));
      
      // You would typically navigate to a note detail route:
      // navigate(`/notes/${nodeId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to open note:', error);
      toast.error(`Failed to open note: ${errorMessage}`);
    }
  }, [navigate]);

  // Handle lazy loading when zooming out
  const handleZoom = useCallback((event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const newZoom = event.transform.k;
    
    setViewState(prev => ({
      ...prev,
      zoom: newZoom,
      pan: { x: event.transform.x, y: event.transform.y },
    }));

    // Lazy load more nodes when zooming out
    if (newZoom < 0.3 && data?.nodes && !loadMoreLoading) {
      const loadedIds = data.nodes.map(n => n.id);
      loadMore({ loadedIds });
    }
  }, [data, loadMore, loadMoreLoading]);

  // Initialize D3 simulation
  useEffect(() => {
    if (!svgRef.current || !data?.nodes || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear existing
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', handleZoom);

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Create container group for transformations
    const g = svg.append('g');

    // Filter nodes based on LOD
    const visibleNodes = getVisibleNodes(data.nodes as SimulationNode[], viewState.zoom);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    
    // Filter links to only include visible nodes and convert to simulation format
    const visibleLinks: SimulationLink[] = data.links
      .filter(link => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target))
      .map(link => ({
        source: visibleNodes.find(n => n.id === link.source)!,
        target: visibleNodes.find(n => n.id === link.target)!,
        value: link.value,
      }));

    // Create force simulation
    const simulation = d3.forceSimulation<SimulationNode>(visibleNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(visibleLinks)
        .id(d => d.id)
        .distance(() => 100) // Fixed distance for all links
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));

    simulationRef.current = simulation;

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(visibleLinks)
      .enter()
      .append('line')
      .attr('stroke', '#A3A3A3')
      .attr('stroke-width', 1)
      .attr('opacity', (d) => {
        const isHighlighted = viewState.highlightedNodes.has(d.source.id) || 
                             viewState.highlightedNodes.has(d.target.id);
        return isHighlighted ? 0.8 : 0.1;
      });

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(visibleNodes)
      .enter()
      .append('circle')
      .attr('r', (d) => {
        const baseRadius = 8;
        const connectionBonus = Math.min(d.connections ?? 0, 20) * 0.5;
        return baseRadius + connectionBonus;
      })
      .attr('fill', (d) => {
        if (d.id === viewState.selectedNode) return '#0066FF';
        if (viewState.highlightedNodes.has(d.id)) return '#0066FF';
        return '#E5E7EB';
      })
      .attr('stroke', '#1A1A1A')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        highlightConnections(d.id, visibleNodes, visibleLinks);
      })
      .on('mouseout', () => {
        clearHighlights();
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        openNote(d.id);
      })
      .call(d3.drag<SVGCircleElement, SimulationNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x ?? 0;
          d.fy = d.y ?? 0;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        })
      );

    // Add labels for highly connected nodes
    if (viewState.zoom > 0.5) {
      const labels = g.append('g')
        .selectAll('text')
        .data(visibleNodes.filter(n => (n.connections ?? 0) > 15))
        .enter()
        .append('text')
        .text(d => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none');
    }

    // Update positions on tick
    const ticked = () => {
      // Performance tracking
      const now = Date.now();
      if (lastFrameTime.current > 0) {
        const delta = now - lastFrameTime.current;
        frameCount.current++;
        
        if (frameCount.current % 30 === 0) {
          const fps = Math.round(1000 / delta);
          setPerformance(prev => ({ ...prev, fps }));
        }
      }
      lastFrameTime.current = now;

       link
         .attr('x1', (d: SimulationLink) => d.source.x ?? 0)
         .attr('y1', (d: SimulationLink) => d.source.y ?? 0)
         .attr('x2', (d: SimulationLink) => d.target.x ?? 0)
         .attr('y2', (d: SimulationLink) => d.target.y ?? 0);

       node
         .attr('cx', (d: SimulationNode) => d.x ?? 0)
         .attr('cy', (d: SimulationNode) => d.y ?? 0);

       // Update labels if they exist
       if (viewState.zoom > 0.5) {
         g.selectAll<SVGTextElement, SimulationNode>('text')
           .attr('x', (d) => d.x ?? 0)
           .attr('y', (d) => (d.y ?? 0) - 15);
       }
    };

    simulation.on('tick', ticked);

    // Apply existing zoom/pan
    if (viewState.zoom !== 1 || viewState.pan.x !== 0 || viewState.pan.y !== 0) {
      const transform = d3.zoomIdentity
        .translate(viewState.pan.x, viewState.pan.y)
        .scale(viewState.zoom);
      svg.call(zoom.transform, transform);
    }

    // Cleanup
    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [data, viewState.zoom, viewState.highlightedNodes, viewState.selectedNode, handleZoom, highlightConnections, clearHighlights, openNote, getVisibleNodes]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (simulationRef.current && svgRef.current) {
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        
        simulationRef.current
          .force('center', d3.forceCenter(width / 2, height / 2))
          .alpha(0.3)
          .restart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        refresh();
        toast.success('Refreshing graph data...');
      }
      if (e.key === 'Escape') {
        setViewState(prev => ({
          ...prev,
          selectedNode: null,
          highlightedNodes: new Set(),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refresh]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading graph data...</p>
          <p className="text-xs text-gray-500 mt-2">Preparing {initialLimit} nodes</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-gray-400 mb-4">No graph data available</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* SVG Container */}
      <svg
        ref={svgRef}
        className="w-full h-full bg-neutral-50/5"
        style={{ touchAction: 'none' }}
      />

      {/* Performance HUD */}
      <div className="absolute top-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono">
        <div>FPS: {performance.fps || '—'}</div>
        <div>Nodes: {data.nodes.length}</div>
        <div>Zoom: {(viewState.zoom * 100).toFixed(0)}%</div>
        {loadMoreLoading && <div className="text-blue-400">Loading more...</div>}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => refresh()}
          disabled={loadMoreLoading}
          className="px-3 py-2 bg-black/80 text-white rounded hover:bg-black/90 disabled:opacity-50 text-xs"
          title="Refresh (Ctrl+R)"
        >
          Refresh
        </button>
        
        <button
          onClick={() => {
            if (svgRef.current && zoomBehaviorRef.current) {
              d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
            }
          }}
          className="px-3 py-2 bg-black/80 text-white rounded hover:bg-black/90 text-xs"
          title="Reset View"
        >
          Reset
        </button>

        {metrics && (
          <div className="px-3 py-2 bg-black/80 text-white rounded text-xs font-mono">
            Total: {metrics.totalNodes}n / {metrics.totalLinks}l
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded">
        <div className="font-bold mb-1">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
          <span>Node</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#0066FF]"></div>
          <span>Selected/Highlighted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-[#A3A3A3]"></div>
          <span>Connection</span>
        </div>
        <div className="mt-2 text-gray-400">
          Hover: Highlight connections<br/>
          Click: Open note<br/>
          Drag: Move node<br/>
          Scroll: Zoom
        </div>
      </div>
    </div>
  );
};

export default GraphView;
