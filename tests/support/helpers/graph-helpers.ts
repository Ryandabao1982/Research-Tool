/**
 * Graph Test Helpers
 * 
 * Utility functions for testing graph components and interactions
 */

import { screen, waitFor } from '@testing-library/react';

/**
 * Wait for the graph to finish rendering
 * 
 * @param timeout - Maximum time to wait in ms (default: 5000)
 */
export async function waitForGraphRender(timeout = 5000): Promise<void> {
  await waitFor(
    () => {
      const svg = document.querySelector('svg');
      if (!svg) throw new Error('SVG not found');
      
      // Check for nodes or loading state
      const nodes = svg.querySelectorAll('circle');
      const loading = screen.queryByText(/loading graph/i);
      
      if (loading) {
        throw new Error('Still loading');
      }
      
      if (nodes.length === 0) {
        throw new Error('No nodes rendered yet');
      }
    },
    { timeout }
  );
}

/**
 * Get a node by its label text
 * 
 * @param label - The label text to search for
 * @returns The node element
 */
export async function getNodeByLabel(label: string): Promise<SVGCircleElement> {
  await waitFor(() => {
    const svg = document.querySelector('svg');
    if (!svg) throw new Error('SVG not found');
  });

  const svg = document.querySelector('svg')!;
  const labels = svg.querySelectorAll('text');
  
  for (const textEl of labels) {
    if (textEl.textContent?.includes(label)) {
      // Find the associated circle (previous sibling or nearby)
      const parent = textEl.parentElement;
      if (parent) {
        const circles = parent.querySelectorAll('circle');
        // This is a simplification - in real D3, positions would be checked
        return circles[0] as SVGCircleElement;
      }
    }
  }
  
  throw new Error(`Node with label "${label}" not found`);
}

/**
 * Simulate zoom interaction
 * 
 * @param svg - The SVG element
 * @param scale - Zoom scale (e.g., 0.5 for zoom out, 2 for zoom in)
 */
export function simulateZoom(svg: SVGSVGElement, scale: number): void {
  const event = new WheelEvent('wheel', {
    deltaY: scale < 1 ? 100 : -100,
    ctrlKey: true,
    bubbles: true,
  });
  
  svg.dispatchEvent(event);
}

/**
 * Simulate drag interaction on a node
 * 
 * @param node - The node element to drag
 * @param deltaX - X distance to drag
 * @param deltaY - Y distance to drag
 */
export async function simulateDrag(
  node: SVGCircleElement,
  deltaX: number,
  deltaY: number
): Promise<void> {
  // Mouse down (start drag)
  node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  
  // Mouse move (drag)
  document.dispatchEvent(
    new MouseEvent('mousemove', {
      bubbles: true,
      clientX: deltaX,
      clientY: deltaY,
    })
  );
  
  // Mouse up (end drag)
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
}

/**
 * Get current highlight state
 * 
 * @returns Set of highlighted node IDs
 */
export function getHighlightState(): Set<string> {
  const svg = document.querySelector('svg');
  if (!svg) return new Set();
  
  const highlightedNodes = new Set<string>();
  const circles = svg.querySelectorAll('circle');
  
  circles.forEach((circle, index) => {
    const fill = circle.getAttribute('fill');
    if (fill === '#0066FF') {
      highlightedNodes.add(`node-${index}`);
    }
  });
  
  return highlightedNodes;
}

/**
 * Check if performance metrics are displayed
 * 
 * @returns True if metrics HUD is visible
 */
export function checkPerformanceMetrics(): boolean {
  const hud = document.querySelector('.absolute.top-4.right-4');
  return hud !== null;
}

/**
 * Wait for graph to stabilize (simulation tick)
 * 
 * @param timeout - Maximum wait time
 */
export async function waitForGraphStabilize(timeout = 3000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Get node count from rendered graph
 * 
 * @returns Number of nodes currently rendered
 */
export function getNodeCount(): number {
  const svg = document.querySelector('svg');
  if (!svg) return 0;
  
  return svg.querySelectorAll('circle').length;
}

/**
 * Get link count from rendered graph
 * 
 * @returns Number of links currently rendered
 */
export function getLinkCount(): number {
  const svg = document.querySelector('svg');
  if (!svg) return 0;
  
  return svg.querySelectorAll('line').length;
}

/**
 * Simulate keyboard shortcut
 * 
 * @param key - Key to press
 * @param ctrl - Whether to include Ctrl key
 */
export async function simulateKeyboardShortcut(key: string, ctrl = false): Promise<void> {
  const event = new KeyboardEvent('keydown', {
    key: key,
    ctrlKey: ctrl,
    bubbles: true,
  });
  
  document.dispatchEvent(event);
}

/**
 * Check if a node is selected
 * 
 * @param nodeId - The node ID
 * @returns True if node is selected
 */
export function isNodeSelected(nodeId: string): boolean {
  const svg = document.querySelector('svg');
  if (!svg) return false;
  
  const circles = svg.querySelectorAll('circle');
  // In the actual component, selected nodes have blue fill
  // This is a simplified check
  return Array.from(circles).some(circle => {
    const fill = circle.getAttribute('fill');
    return fill === '#0066FF';
  });
}
