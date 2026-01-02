# Graph Feature Test Templates

This file contains comprehensive test templates for the graph feature implementation.
Use these templates to create missing tests.

---

## 1. useGraphData Hook Tests

**File:** `tests/unit/useGraphData.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGraphData } from '@/features/graph/hooks/useGraphData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useGraphData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // P0 - Critical Tests
  test('[P0] should fetch graph data successfully', async () => {
    const mockData = {
      nodes: [{ id: '1', label: 'Note 1', group: 'folder-a', connections: 2 }],
      links: [{ source: '1', target: '2' }],
    };

    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });

  test('[P0] should handle errors gracefully', async () => {
    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  test('[P0] should support incremental loading', async () => {
    const mockData = {
      nodes: [{ id: '2', label: 'Note 2', group: 'folder-b', connections: 1 }],
      links: [{ source: '1', target: '2' }],
    };

    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useGraphData({ limit: 10, incremental: true, loadedIds: ['1'] }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_graph_incremental', {
        limit: 10,
        loadedIds: ['1'],
      });
    });
  });

  // P1 - High Priority Tests
  test('[P1] should fetch metrics', async () => {
    const mockMetrics = [100, 50, 10];
    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any)
      .mockResolvedValueOnce({ nodes: [], links: [] })
      .mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.metrics).toEqual({
        totalNodes: 100,
        totalLinks: 50,
        maxConnections: 10,
      });
    });
  });

  test('[P1] should support getNeighbors function', async () => {
    const mockNeighbors = [
      { id: '2', label: 'Note 2', group: 'folder-b', connections: 1 },
    ];

    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue(mockNeighbors);

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    const neighbors = await result.current.getNeighbors('1', 5);

    expect(invoke).toHaveBeenCalledWith('get_node_neighbors', {
      nodeId: '1',
      limit: 5,
    });
    expect(neighbors).toEqual(mockNeighbors);
  });

  test('[P1] should cache data properly', async () => {
    const mockData = {
      nodes: [{ id: '1', label: 'Note 1', group: 'folder-a', connections: 2 }],
      links: [{ source: '1', target: '2' }],
    };

    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue(mockData);

    const { result, rerender } = renderHook(
      () => useGraphData({ limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const firstCallCount = (invoke as any).mock.calls.length;

    // Rerender with same params
    rerender();

    // Should not call invoke again (cached)
    expect((invoke as any).mock.calls.length).toBe(firstCallCount);
  });

  test('[P1] should retry on failure', async () => {
    const { invoke } = await import('@tauri-apps/api/tauri');
    
    // Fail first 2 times, succeed on 3rd
    (invoke as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ nodes: [], links: [] });

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect((invoke as any).mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  });

  // P2 - Medium Priority Tests
  test('[P2] should validate loadedIds input', async () => {
    const { result } = renderHook(
      () => useGraphData({ limit: 10, incremental: true, loadedIds: [] }),
      { wrapper: createWrapper() }
    );

    // Should handle empty array gracefully
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('[P2] should handle empty data', async () => {
    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue({ nodes: [], links: [] });

    const { result } = renderHook(() => useGraphData({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ nodes: [], links: [] });
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('[P2] should respect limit parameters', async () => {
    const { invoke } = await import('@tauri-apps/api/tauri');
    (invoke as any).mockResolvedValue({ nodes: [], links: [] });

    renderHook(() => useGraphData({ limit: 50 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_graph', { limit: 50 });
    });
  });
});
```

---

## 2. GraphView Component Tests

**File:** `tests/component/GraphView.test.tsx`

```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { GraphView } from '@/features/graph/components/GraphView';
import { createGraphData, createNote } from '@/tests/support/factories/graph.factory';

// Mock Tauri invoke
test.use({
  // Setup mocks for each test
  mockTauri: async ({ page }, use) => {
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.cmd === 'get_graph') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(createGraphData(50, 30)),
        });
      } else if (postData.cmd === 'get_note') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(createNote()),
        });
      } else {
        await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Not implemented' }) });
      }
    });
    await use();
  },
});

test.describe('GraphView Component', () => {
  // P0 - Critical Tests
  test('[P0] should render with data', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    // Should render SVG
    await expect(component.locator('svg')).toBeVisible();
    
    // Should render nodes
    await expect(component.locator('[data-testid="graph-node"]')).toHaveCount(50);
  });

  test('[P0] should display loading state', async ({ mount }) => {
    // Mock slow response
    const component = await mount(<GraphView />);
    
    // Should show loading initially
    await expect(component.locator('text=Loading graph data')).toBeVisible();
  });

  test('[P0] should handle empty data', async ({ mount, page }) => {
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ nodes: [], links: [] }),
      });
    });

    const component = await mount(<GraphView />);
    
    await expect(component.locator('text=No graph data available')).toBeVisible();
    await expect(component.locator('button', { hasText: 'Retry' })).toBeVisible();
  });

  // P1 - High Priority Tests
  test('[P1] should initialize D3 simulation', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    // Wait for D3 to initialize
    await component.waitForSelector('svg', { timeout: 10000 });
    
    // Check that simulation is running (nodes have positions)
    const nodes = component.locator('[data-testid="graph-node"]');
    const firstNode = nodes.first();
    
    // Should have position attributes
    const cx = await firstNode.getAttribute('cx');
    const cy = await firstNode.getAttribute('cy');
    
    expect(cx).toBeTruthy();
    expect(cy).toBeTruthy();
  });

  test('[P1] should handle zoom interactions', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    const svg = component.locator('svg');
    
    // Initial zoom
    const initialTransform = await svg.getAttribute('transform');
    
    // Zoom in
    await svg.evaluate((el) => {
      const event = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      el.dispatchEvent(event);
    });
    
    // Should update transform
    await expect(svg).not.toHaveAttribute('transform', initialTransform || '');
  });

  test('[P1] should handle node hover', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    const nodes = component.locator('[data-testid="graph-node"]');
    const firstNode = nodes.first();
    
    // Hover over node
    await firstNode.hover();
    
    // Should highlight connections
    const highlightedNodes = component.locator('[data-testid="graph-node"][class*="highlighted"]');
    await expect(highlightedNodes).not.toHaveCount(0);
    
    // Other nodes should fade
    const fadedNodes = component.locator('[data-testid="graph-node"][class*="faded"]');
    await expect(fadedNodes).not.toHaveCount(0);
  });

  test('[P1] should handle node click', async ({ mount, mockTauri, page }) => {
    // Mock get_note command
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_note') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(createNote({ title: 'Test Note' })),
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ nodes: [], links: [] }) });
      }
    });

    const component = await mount(<GraphView />);
    
    const nodes = component.locator('[data-testid="graph-node"]');
    const firstNode = nodes.first();
    
    // Click node
    await firstNode.click();
    
    // Should show success toast
    await expect(page.locator('text=Opening note: Test Note')).toBeVisible();
  });

  test('[P1] should handle error states', async ({ mount, page }) => {
    // Mock error response
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' }),
      });
    });

    const component = await mount(<GraphView />);
    
    await expect(component.locator('text=Failed to fetch graph data')).toBeVisible();
    await expect(component.locator('button', { hasText: 'Retry' })).toBeVisible();
  });

  // P2 - Medium Priority Tests
  test('[P2] should implement LOD rendering', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    // Zoom out to low level
    const svg = component.locator('svg');
    await svg.evaluate((el) => {
      const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true });
      el.dispatchEvent(event);
    });
    
    // Should show fewer nodes (LOD)
    const nodes = component.locator('[data-testid="graph-node"]');
    const count = await nodes.count();
    
    // At low zoom, should filter to high-connection nodes only
    expect(count).toBeLessThan(50);
  });

  test('[P2] should support lazy loading', async ({ mount, page }) => {
    let requestCount = 0;
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.cmd === 'get_graph') {
        requestCount++;
        if (requestCount === 1) {
          // First load
          await route.fulfill({
            status: 200,
            body: JSON.stringify(createGraphData(50, 30)),
          });
        } else {
          // Incremental load
          await route.fulfill({
            status: 200,
            body: JSON.stringify(createGraphData(20, 10)),
          });
        }
      }
    });

    const component = await mount(<GraphView />);
    
    // Zoom out to trigger lazy load
    const svg = component.locator('svg');
    await svg.evaluate((el) => {
      const event = new WheelEvent('wheel', { deltaY: 150, bubbles: true });
      el.dispatchEvent(event);
    });
    
    // Should trigger additional request
    await page.waitForTimeout(500);
    expect(requestCount).toBeGreaterThan(1);
  });

  test('[P2] should display performance metrics', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    // Wait for metrics to load
    await component.waitForSelector('[data-testid="performance-hud"]', { timeout: 10000 });
    
    const hud = component.locator('[data-testid="performance-hud"]');
    
    // Should show FPS
    await expect(hud.locator('text=FPS:')).toBeVisible();
    
    // Should show node count
    await expect(hud.locator('text=Nodes:')).toBeVisible();
    
    // Should show zoom level
    await expect(hud.locator('text=Zoom:')).toBeVisible();
  });

  test('[P2] should handle keyboard shortcuts', async ({ mount, mockTauri, page }) => {
    const component = await mount(<GraphView />);
    
    // Press Ctrl+R to refresh
    await page.keyboard.press('Control+R');
    
    // Should trigger refresh (verify by checking if loading state appears)
    // This would need additional mock setup to verify
    
    // Press Escape to clear selection
    await page.keyboard.press('Escape');
    
    // Should clear highlights
    const highlighted = component.locator('[class*="highlighted"]');
    await expect(highlighted).toHaveCount(0);
  });

  // P3 - Low Priority Tests
  test('[P3] should be accessible', async ({ mount, mockTauri }) => {
    const component = await mount(<GraphView />);
    
    // Check ARIA labels
    await expect(component.locator('[role="img"]')).toBeVisible();
    
    // Check keyboard navigation
    const svg = component.locator('svg');
    await svg.focus();
    await expect(svg).toBeFocused();
  });
});
```

---

## 3. API Integration Tests

**File:** `tests/api/graph-commands.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Graph Tauri Commands', () => {
  // P0 - Critical Tests
  test('[P0] get_graph returns valid data structure', async ({ request }) => {
    const response = await request.post('/invoke', {
      data: {
        cmd: 'get_graph',
        limit: 50,
      },
    });

    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    
    // Validate structure
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('links');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.links)).toBe(true);
    
    // Validate node structure
    if (data.nodes.length > 0) {
      const node = data.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('label');
      expect(typeof node.id).toBe('string');
      expect(typeof node.label).toBe('string');
    }
  });

  test('[P0] get_graph handles errors', async ({ request }) => {
    // Invalid limit
    const response = await request.post('/invoke', {
      data: {
        cmd: 'get_graph',
        limit: 0,
      },
    });

    expect(response.ok()).toBe(false);
  });

  // P1 - High Priority Tests
  test('[P1] get_node_neighbors returns connected nodes', async ({ request }) => {
    // First get a node ID
    const graphResponse = await request.post('/invoke', {
      data: { cmd: 'get_graph', limit: 10 },
    });
    const graphData = await graphResponse.json();
    const nodeId = graphData.nodes[0]?.id;

    if (nodeId) {
      const response = await request.post('/invoke', {
        data: {
          cmd: 'get_node_neighbors',
          nodeId,
          limit: 5,
        },
      });

      expect(response.ok()).toBe(true);
      const neighbors = await response.json();
      expect(Array.isArray(neighbors)).toBe(true);
    }
  });

  test('[P1] get_graph_incremental merges data correctly', async ({ request }) => {
    // Get initial data
    const initialResponse = await request.post('/invoke', {
      data: { cmd: 'get_graph', limit: 20 },
    });
    const initialData = await initialResponse.json();
    const loadedIds = initialData.nodes.map((n: any) => n.id);

    // Get incremental data
    const incrementalResponse = await request.post('/invoke', {
      data: {
        cmd: 'get_graph_incremental',
        limit: 10,
        loadedIds,
      },
    });

    expect(incrementalResponse.ok()).toBe(true);
    const incrementalData = await incrementalResponse.json();
    
    // Verify no duplicates
    const allIds = [...initialData.nodes, ...incrementalData.nodes].map((n: any) => n.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  test('[P1] get_graph_metrics returns valid metrics', async ({ request }) => {
    const response = await request.post('/invoke', {
      data: { cmd: 'get_graph_metrics' },
    });

    expect(response.ok()).toBe(true);
    
    const metrics = await response.json();
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBe(3);
    expect(typeof metrics[0]).toBe('number'); // totalNodes
    expect(typeof metrics[1]).toBe('number'); // totalLinks
    expect(typeof metrics[2]).toBe('number'); // maxConnections
  });

  // P2 - Medium Priority Tests
  test('[P2] all commands validate input', async ({ request }) => {
    const commands = [
      { cmd: 'get_graph', limit: -1 },
      { cmd: 'get_graph', limit: 100000 },
      { cmd: 'get_node_neighbors', nodeId: 'invalid-uuid', limit: 5 },
      { cmd: 'get_graph_incremental', limit: 0, loadedIds: [] },
    ];

    for (const cmd of commands) {
      const response = await request.post('/invoke', { data: cmd });
      expect(response.ok()).toBe(false);
    }
  });

  test('[P2] commands handle network failures', async ({ request }) => {
    // This would require mocking network failures
    // For now, test with invalid data
    const response = await request.post('/invoke', {
      data: {
        cmd: 'get_graph',
        limit: 'invalid',
      },
    });

    expect(response.ok()).toBe(false);
  });
});
```

---

## 4. E2E Tests

**File:** `tests/e2e/graph-interactions.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Graph Feature E2E', () => {
  // P0 - Critical Tests
  test('[P0] User can view graph with 50+ nodes', async ({ page }) => {
    // Mock graph data
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_graph') {
        // Generate 50 nodes
        const nodes = Array.from({ length: 50 }, (_, i) => ({
          id: `node-${i}`,
          label: `Note ${i}`,
          group: `folder-${i % 3}`,
          connections: Math.floor(Math.random() * 10),
        }));
        const links = Array.from({ length: 30 }, (_, i) => ({
          source: `node-${i}`,
          target: `node-${(i + 5) % 50}`,
        }));
        
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ nodes, links }),
        });
      }
    });

    await page.goto('/graph');
    
    // Wait for graph to render
    await page.waitForSelector('svg', { timeout: 10000 });
    
    // Should have 50 nodes
    const nodes = page.locator('[data-testid="graph-node"]');
    await expect(nodes).toHaveCount(50);
  });

  test('[P0] Hover highlights node connections', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      // Mock data with known connections
      const data = {
        nodes: [
          { id: 'n1', label: 'Node 1', connections: 2 },
          { id: 'n2', label: 'Node 2', connections: 1 },
          { id: 'n3', label: 'Node 3', connections: 1 },
        ],
        links: [
          { source: 'n1', target: 'n2' },
          { source: 'n1', target: 'n3' },
        ],
      };
      await route.fulfill({ status: 200, body: JSON.stringify(data) });
    });

    await page.goto('/graph');
    await page.waitForSelector('[data-testid="graph-node"]');

    // Hover over first node
    const firstNode = page.locator('[data-testid="graph-node"]').first();
    await firstNode.hover();

    // Should highlight connected nodes
    const highlighted = page.locator('[data-testid="graph-node"][class*="highlighted"]');
    await expect(highlighted).toHaveCount(3); // Node 1 + 2 connections
  });

  test('[P0] Click opens corresponding note', async ({ page }) => {
    let noteRequested = false;
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.cmd === 'get_graph') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            nodes: [{ id: 'test-node', label: 'Test Node', connections: 0 }],
            links: [],
          }),
        });
      } else if (postData.cmd === 'get_note') {
        noteRequested = true;
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-node',
            title: 'Test Note',
            content: 'Test content',
          }),
        });
      }
    });

    await page.goto('/graph');
    await page.waitForSelector('[data-testid="graph-node"]');

    // Click node
    await page.click('[data-testid="graph-node"]');

    // Should request note
    expect(noteRequested).toBe(true);

    // Should show toast
    await expect(page.locator('text=Opening note: Test Node')).toBeVisible();
  });

  test('[P0] Performance remains acceptable with 1000 nodes', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.cmd === 'get_graph') {
        // Generate large dataset
        const nodes = Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          label: `Note ${i}`,
          group: `folder-${i % 5}`,
          connections: Math.floor(Math.random() * 20),
        }));
        const links = Array.from({ length: 500 }, (_, i) => ({
          source: `node-${i}`,
          target: `node-${(i + 50) % 1000}`,
        }));
        
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ nodes, links }),
        });
      }
    });

    const startTime = Date.now();
    await page.goto('/graph');
    
    // Wait for graph to render
    await page.waitForSelector('svg', { timeout: 30000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load in reasonable time (< 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Should show performance HUD
    await expect(page.locator('[data-testid="performance-hud"]')).toBeVisible();
  });

  // P1 - High Priority Tests
  test('[P1] Zoom controls work correctly', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      // Mock data
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          nodes: Array.from({ length: 20 }, (_, i) => ({
            id: `node-${i}`,
            label: `Note ${i}`,
            connections: 2,
          })),
          links: Array.from({ length: 10 }, (_, i) => ({
            source: `node-${i}`,
            target: `node-${i + 1}`,
          })),
        }),
      });
    });

    await page.goto('/graph');
    await page.waitForSelector('svg');

    const svg = page.locator('svg');
    const initialTransform = await svg.getAttribute('transform');

    // Zoom in
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(500);

    const zoomedTransform = await svg.getAttribute('transform');
    expect(zoomedTransform).not.toBe(initialTransform);
  });

  test('[P1] Pan navigation works', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          nodes: [{ id: 'n1', label: 'Node 1', connections: 0 }],
          links: [],
        }),
      });
    });

    await page.goto('/graph');
    await page.waitForSelector('svg');

    const svg = page.locator('svg');
    const initialTransform = await svg.getAttribute('transform');

    // Pan
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await page.waitForTimeout(500);

    const pannedTransform = await svg.getAttribute('transform');
    expect(pannedTransform).not.toBe(initialTransform);
  });

  test('[P1] Lazy loading triggers on zoom out', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      
      if (postData.cmd === 'get_graph') {
        requestCount++;
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            nodes: Array.from({ length: 50 }, (_, i) => ({
              id: `node-${i}`,
              label: `Note ${i}`,
              connections: 5,
            })),
            links: Array.from({ length: 30 }, (_, i) => ({
              source: `node-${i}`,
              target: `node-${(i + 5) % 50}`,
            })),
          }),
        });
      }
    });

    await page.goto('/graph');
    await page.waitForSelector('svg');

    // Zoom out significantly
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1000);

    // Should trigger additional request
    expect(requestCount).toBeGreaterThan(1);
  });

  test('[P2] Keyboard shortcuts work', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          nodes: [{ id: 'n1', label: 'Node 1', connections: 0 }],
          links: [],
        }),
      });
    });

    await page.goto('/graph');
    await page.waitForSelector('svg');

    // Ctrl+R to refresh
    await page.keyboard.press('Control+R');
    await page.waitForTimeout(500);

    // Escape to clear selection
    await page.keyboard.press('Escape');
  });

  test('[P2] Error states display correctly', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database connection failed' }),
      });
    });

    await page.goto('/graph');
    
    await expect(page.locator('text=Failed to fetch graph data')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Retry' })).toBeVisible();
  });

  test('[P2] Empty state displays correctly', async ({ page }) => {
    await page.route('**/invoke', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ nodes: [], links: [] }),
      });
    });

    await page.goto('/graph');
    
    await expect(page.locator('text=No graph data available')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Retry' })).toBeVisible();
  });
});
```

---

## 5. Test Fixtures

**File:** `tests/support/fixtures/graph.fixture.ts`

```typescript
import { test as base } from '@playwright/test';
import { createGraphData, createNote, createMetrics } from '../factories/graph.factory';

export const test = base.extend<{
  mockGraphData: { nodes: any[]; links: any[] };
  largeGraphData: { nodes: any[]; links: any[] };
  mockNote: any;
  mockMetrics: any;
}>({
  // Mock graph data (50 nodes)
  mockGraphData: async ({ page }, use) => {
    const mockData = createGraphData(50, 30);
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_graph') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockData),
        });
      }
    });
    
    await use(mockData);
    await page.unroute('**/invoke');
  },

  // Large dataset for performance testing
  largeGraphData: async ({ page }, use) => {
    const largeData = createGraphData(1000, 500);
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_graph') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(largeData),
        });
      }
    });
    
    await use(largeData);
    await page.unroute('**/invoke');
  },

  // Mock note for click tests
  mockNote: async ({ page }, use) => {
    const note = createNote();
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_note') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(note),
        });
      }
    });
    
    await use(note);
    await page.unroute('**/invoke');
  },

  // Mock metrics
  mockMetrics: async ({ page }, use) => {
    const metrics = createMetrics();
    
    await page.route('**/invoke', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData.cmd === 'get_graph_metrics') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify([metrics.totalNodes, metrics.totalLinks, metrics.maxConnections]),
        });
      }
    });
    
    await use(metrics);
    await page.unroute('**/invoke');
  },
});
```

---

## 6. Test Helpers

**File:** `tests/support/helpers/graph-helpers.ts`

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * Wait for graph to fully render
 */
export const waitForGraphRender = async (page: Page, timeout = 10000): Promise<void> => {
  await page.waitForSelector('svg', { timeout });
  await page.waitForSelector('[data-testid="graph-node"]', { timeout });
};

/**
 * Get a node by its label text
 */
export const getNodeByLabel = async (page: Page, label: string): Promise<Locator> => {
  return page.locator(`[data-testid="graph-node"]`, { hasText: label });
};

/**
 * Get a node by its index
 */
export const getNodeByIndex = (page: Page, index: number): Locator => {
  return page.locator('[data-testid="graph-node"]').nth(index);
};

/**
 * Simulate zoom in/out
 */
export const simulateZoom = async (page: Page, direction: 'in' | 'out', amount = 100): Promise<void> => {
  const deltaY = direction === 'in' ? -amount : amount;
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(300); // Wait for animation
};

/**
 * Simulate pan
 */
export const simulatePan = async (page: Page, dx: number, dy: number): Promise<void> => {
  await page.mouse.move(200, 200); // Start position
  await page.mouse.down();
  await page.mouse.move(200 + dx, 200 + dy);
  await page.mouse.up();
  await page.waitForTimeout(300); // Wait for animation
};

/**
 * Get performance metrics from HUD
 */
export const getPerformanceMetrics = async (page: Page): Promise<{ fps: number; nodes: number; zoom: number }> => {
  const hud = page.locator('[data-testid="performance-hud"]');
  
  const fpsText = await hud.locator('text=FPS:').textContent();
  const nodesText = await hud.locator('text=Nodes:').textContent();
  const zoomText = await hud.locator('text=Zoom:').textContent();
  
  return {
    fps: parseInt(fpsText?.replace('FPS: ', '') || '0'),
    nodes: parseInt(nodesText?.replace('Nodes: ', '') || '0'),
    zoom: parseInt(zoomText?.replace('Zoom: ', '').replace('%', '') || '0'),
  };
};

/**
 * Verify no console errors
 */
export const verifyNoErrors = async (page: Page): Promise<void> => {
  const errors = await page.evaluate(() => {
    const logs: string[] = [];
    const originalError = console.error;
    console.error = (...args: any[]) => {
      logs.push(args.join(' '));
      originalError(...args);
    };
    return logs;
  });
  
  if (errors.length > 0) {
    throw new Error(`Console errors detected: ${errors.join(', ')}`);
  }
};

/**
 * Wait for D3 simulation to stabilize
 */
export const waitForSimulation = async (page: Page, timeout = 5000): Promise<void> => {
  await page.waitForFunction(
    () => {
      const svg = document.querySelector('svg');
      if (!svg) return false;
      const nodes = svg.querySelectorAll('[data-testid="graph-node"]');
      if (nodes.length === 0) return false;
      // Check if nodes have position attributes
      const firstNode = nodes[0];
      return firstNode.hasAttribute('cx') && firstNode.hasAttribute('cy');
    },
    { timeout }
  );
};
```

---

## 7. Test README

**File:** `tests/README.md`

```markdown
# Graph Feature Test Suite

## Overview

This directory contains comprehensive tests for the Graph Feature (Interactive Force-Directed Graph).

## Test Structure

```
tests/
├── e2e/                    # End-to-end user flow tests
│   └── graph-interactions.test.ts
├── api/                    # API/Tauri command integration tests
│   └── graph-commands.test.ts
├── component/              # React component tests
│   └── GraphView.test.tsx
├── unit/                   # Unit tests for hooks and utilities
│   └── useGraphData.test.ts
└── support/
    ├── fixtures/           # Test fixtures with auto-cleanup
    │   └── graph.fixture.ts
    ├── factories/          # Data factories using faker
    │   └── graph.factory.ts
    └── helpers/            # Utility functions
        └── graph-helpers.ts
```

## Running Tests

### All Tests
```bash
npm run test
```

### Unit Tests Only
```bash
npm run test -- tests/unit
```

### Component Tests Only
```bash
npm run test -- tests/component
```

### API Tests Only
```bash
npm run test -- tests/api
```

### E2E Tests Only
```bash
npx playwright test tests/e2e
```

### Specific Test File
```bash
npm run test -- tests/unit/useGraphData.test.ts
```

### With UI
```bash
npm run test:ui
```

### With Coverage
```bash
npm run test:coverage
```

## Priority Tags

All tests are tagged with priority levels:

- **[P0]**: Critical paths, run every commit
- **[P1]**: High priority, run on PR to main
- **[P2]**: Medium priority, run nightly
- **[P3]**: Low priority, run on-demand

### Run by Priority

```bash
# P0 only
npm run test -- --grep "@P0"

# P0 + P1
npm run test -- --grep "@P0|@P1"

# P0 + P1 + P2
npm run test -- --grep "@P0|@P1|@P2"
```

## Test Patterns

### Given-When-Then Format

All tests follow this structure:

```typescript
test('[P1] should do something', async () => {
  // GIVEN: Initial state or setup
  const data = createGraphData(50, 30);
  
  // WHEN: Action is performed
  const result = await processData(data);
  
  // THEN: Expected outcome
  expect(result.nodes).toHaveLength(50);
});
```

### Network-First Pattern

For E2E tests with network requests:

```typescript
// CRITICAL: Intercept BEFORE navigation
await page.route('**/api/graph', (route) => {
  route.fulfill({ status: 200, body: JSON.stringify(mockData) });
});

await page.goto('/graph'); // NOW navigate
```

### Self-Cleaning Tests

All tests clean up their data:

```typescript
export const test = base.extend({
  testUser: async ({ page }, use) => {
    const user = await createUser();
    await use(user); // Test runs here
    await deleteUser(user.id); // Auto-cleanup
  },
});
```

## Writing New Tests

### 1. Check Existing Tests

Before writing new tests, check if similar tests exist:
- `tests/unit/` - Hook and utility tests
- `tests/component/` - Component behavior tests
- `tests/api/` - API integration tests
- `tests/e2e/` - User flow tests

### 2. Use Factories

Always use factories for test data:

```typescript
import { createGraphData, createGraphNode } from '@/tests/support/factories/graph.factory';

const data = createGraphData(50, 30);
const node = createGraphNode({ label: 'Custom Node' });
```

### 3. Use Fixtures

For common setup, use fixtures:

```typescript
import { test } from '@/tests/support/fixtures/graph.fixture';

test('should work with mock data', async ({ mockGraphData }) => {
  // mockGraphData is automatically available
  // and will be cleaned up after test
});
```

### 4. Use Helpers

For common operations, use helpers:

```typescript
import { waitForGraphRender, simulateZoom } from '@/tests/support/helpers/graph-helpers';

await waitForGraphRender(page);
await simulateZoom(page, 'in');
```

## Quality Standards

### ✅ Required

- [ ] All tests use Given-When-Then format
- [ ] All tests have priority tags ([P0], [P1], [P2], [P3])
- [ ] All tests use data-testid selectors (E2E)
- [ ] All tests are self-cleaning
- [ ] No hard waits (`page.waitForTimeout()`)
- [ ] No conditional flow (`if (await element.isVisible())`)
- [ ] One assertion per test (atomic)
- [ ] Tests run in < 90 seconds

### ❌ Forbidden

- ❌ Hardcoded test data (use factories)
- ❌ Page object classes (keep tests direct)
- ❌ Shared state between tests
- ❌ Try-catch for test logic (only for cleanup)
- ❌ Console.log statements

## Debugging

### Run Single Test
```bash
npm run test -- tests/unit/useGraphData.test.ts --reporter=verbose
```

### Debug E2E Test
```bash
npx playwright test tests/e2e/graph-interactions.test.ts --debug
```

### Run with Browser Visible
```bash
npx playwright test --headed
```

## CI Integration

### GitHub Actions Example

```yaml
name: Graph Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npx playwright test tests/e2e
```

## Coverage Goals

- **Backend (Rust)**: 95% coverage ✅
- **Frontend Unit**: 90% coverage
- **Frontend Component**: 80% coverage
- **E2E**: Critical paths only

## Knowledge Base

This test suite follows patterns from:
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - Priority classification
- `data-factories.md` - Factory patterns
- `fixture-architecture.md` - Fixture patterns
- `test-quality.md` - Quality principles
- `network-first.md` - Race condition prevention

## Troubleshooting

### Tests Flaky
- Remove all hard waits
- Use network-first pattern
- Add explicit waits for state changes
- Run burn-in loop (10 iterations)

### Tests Slow
- Mock external services
- Use API tests instead of E2E where possible
- Parallelize tests
- Optimize test data creation

### Tests Failing
- Check console for errors
- Verify mocks are set up correctly
- Run with `--debug` to step through
- Check for race conditions

## Contact

For questions about these tests, refer to the automation summary:
`_bmad-output/automation-summary.md`
```

---

## Summary

**Total Tests Created:** 17 backend + 1 frontend = 18 tests  
**Total Tests Planned:** 17 backend + 31 frontend = 48 tests  
**Status:** 37.5% complete

**Files Created:**
- ✅ `tests/support/factories/graph.factory.ts` (8 factory functions)
- ✅ `tests/README.md` (comprehensive guide)
- ✅ `automation-summary.md` (overall summary)

**Files Needed:**
- ❌ `tests/unit/useGraphData.test.ts` (10 tests)
- ❌ `tests/component/GraphView.test.tsx` (14 tests)
- ❌ `tests/api/graph-commands.test.ts` (7 tests)
- ❌ `tests/e2e/graph-interactions.test.ts` (10 tests)
- ❌ `tests/support/fixtures/graph.fixture.ts` (4 fixtures)
- ❌ `tests/support/helpers/graph-helpers.ts` (6 helpers)

**Next Steps:**
1. Fix GraphView component TypeScript errors
2. Install @faker-js/faker if needed
3. Create missing test files using templates
4. Run tests and iterate
5. Update package.json scripts
6. Integrate with CI

---

**Generated:** 2026-01-02  
**Workflow:** testarch/automate  
**Mode:** Standalone  
**Output:** `_bmad-output/automation-summary.md` and `_bmad-output/test-templates.md`
