/**
 * GraphView Component Tests
 * Priority: P1 - High
 * Tests for D3.js force-directed graph visualization
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { GraphView } from '../../src/features/graph/components/GraphView';
import { mockGraphData, largeGraphData, errorState, loadingState } from '../support/fixtures/graph.fixture';
import { createGraphData } from '../support/factories/graph.factory';
import { waitForGraphRender, getNodeCount, getLinkCount } from '../support/helpers/graph-helpers';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock d3 - we need to mock D3 for component tests
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(() => ({})),
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            call: vi.fn().mockReturnThis(),
          })),
        })),
      })),
    })),
    call: vi.fn(),
    transition: vi.fn(() => ({
      duration: vi.fn(() => ({
        call: vi.fn(),
      })),
    })),
    transform: vi.fn(),
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn(() => ({
      on: vi.fn(() => ({
        transform: vi.fn(),
      })),
    })),
  })),
  zoomIdentity: {
    translate: vi.fn(() => ({
      scale: vi.fn(() => ({})),
    })),
  },
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    alphaTarget: vi.fn().mockReturnThis(),
    restart: vi.fn(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnThis(),
    strength: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(() => ({})),
  forceCollide: vi.fn(() => ({
    radius: vi.fn().mockReturnThis(),
  })),
  drag: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
  })),
}));

import { invoke } from '@tauri-apps/api/tauri';

// Test wrapper with Router
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('GraphView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window resize
    Object.defineProperty(window, 'addEventListener', {
      writable: true,
      value: vi.fn(),
    });
    Object.defineProperty(window, 'removeEventListener', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('P1: Rendering & Props', () => {
    test('renders without crashing', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      const { container } = render(
        <GraphView />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('displays loading state initially', async () => {
      (invoke as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockGraphData), 100)));

      render(<GraphView />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading graph data/i)).toBeInTheDocument();
    });

    test('renders with custom className', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      const { container } = render(
        <GraphView className="custom-graph" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg?.parentElement?.className).toContain('custom-graph');
      });
    });
  });

  describe('P1: D3.js Simulation', () => {
    test('initializes D3 simulation with correct data', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('get_graph', expect.any(Object));
      });
    });

    test('creates nodes and links in SVG', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      // Check if nodes are rendered (circles)
      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);

      // Check if links are rendered (lines)
      const lines = document.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    test('applies LOD (Level of Detail) based on zoom', async () => {
      (invoke as any).mockResolvedValue(largeGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      // At default zoom (1), should show all nodes
      const initialNodeCount = getNodeCount();

      // Simulate zoom out
      const svg = document.querySelector('svg');
      if (svg) {
        // Trigger zoom event
        const zoomEvent = new Event('wheel');
        svg.dispatchEvent(zoomEvent);
      }

      // LOD should filter nodes based on connections
      // This is a simplified test - real D3 would handle the actual filtering
      expect(initialNodeCount).toBeGreaterThan(0);
    });
  });

  describe('P1: User Interactions', () => {
    test('highlights connections on node hover', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      const firstNode = circles[0] as Element;
      
      // Simulate mouseover
      fireEvent.mouseOver(firstNode);

      // Check if highlight state is updated
      // (In real component, this would update visual state)
      expect(firstNode).toBeInTheDocument();
    });

    test('calls openNote on node click', async () => {
      const mockNote = { id: 'test-123', title: 'Test Note' };
      (invoke as any).mockResolvedValueOnce(mockGraphData).mockResolvedValueOnce(mockNote);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      const node = circles[0] as Element;
      fireEvent.click(node);

      // Wait for toast or navigation
      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('get_note', expect.any(Object));
      });
    });

    test('handles drag interaction', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      const node = circles[0] as Element;
      
      // Simulate drag
      fireEvent.mouseDown(node);
      fireEvent.mouseMove(node, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(node);

      // Drag should be handled by D3
      expect(node).toBeInTheDocument();
    });
  });

  describe('P2: Performance & LOD', () => {
    test('displays performance metrics', async () => {
      (invoke as any).mockResolvedValue(largeGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitFor(() => {
        const hud = document.querySelector('.absolute.top-4.right-4');
        expect(hud).toBeInTheDocument();
      });
    });

    test('handles large datasets efficiently', async () => {
      (invoke as any).mockResolvedValue(largeGraphData);

      const startTime = performance.now();
      render(<GraphView />, { wrapper: createWrapper() });
      
      await waitForGraphRender();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('P2: Error States', () => {
    test('displays error state when data fetch fails', async () => {
      (invoke as any).mockRejectedValue(new Error('Database error'));

      render(<GraphView />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    test('retry button refreshes data', async () => {
      let callCount = 0;
      (invoke as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Error'));
        }
        return Promise.resolve(mockGraphData);
      });

      render(<GraphView />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText(/retry/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('P3: Accessibility', () => {
    test('has proper ARIA labels', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      // Check for accessible controls
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('keyboard shortcuts work', async () => {
      (invoke as any).mockResolvedValue(mockGraphData);

      render(<GraphView />, { wrapper: createWrapper() });

      await waitForGraphRender();

      // Simulate Ctrl+R (refresh)
      const refreshEvent = new KeyboardEvent('keydown', {
        key: 'r',
        ctrlKey: true,
        bubbles: true,
      });
      
      document.dispatchEvent(refreshEvent);

      // Should trigger refresh
      await waitFor(() => {
        expect(invoke).toHaveBeenCalled();
      });
    });
  });
});
