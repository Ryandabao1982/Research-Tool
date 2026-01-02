import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  apiCallTimes: number[];
  totalApiTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const metrics = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    apiCallTimes: [],
    totalApiTime: 0,
  });

  const startTime = useRef<number>(0);

  // Track render performance
  useEffect(() => {
    const now = performance.now();
    metrics.current.renderCount++;
    
    if (startTime.current > 0) {
      const renderTime = now - startTime.current;
      metrics.current.lastRenderTime = renderTime;
      
      // Update average
      const totalTime = metrics.current.avgRenderTime * (metrics.current.renderCount - 1) + renderTime;
      metrics.current.avgRenderTime = totalTime / metrics.current.renderCount;
      
      // Log if slow
      if (renderTime > 50) {
        console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    startTime.current = now;
  });

  // Track API calls
  const trackApiCall = (duration: number) => {
    metrics.current.apiCallTimes.push(duration);
    metrics.current.totalApiTime += duration;
    
    if (duration > 100) {
      console.warn(`[Performance] Slow API call in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  };

  // Get current metrics
  const getMetrics = () => ({ ...metrics.current });

  // Reset metrics
  const resetMetrics = () => {
    metrics.current = {
      renderCount: 0,
      lastRenderTime: 0,
      avgRenderTime: 0,
      apiCallTimes: [],
      totalApiTime: 0,
    };
  };

  // Log summary
  const logSummary = () => {
    console.log(`[Performance Summary] ${componentName}:`, {
      renderCount: metrics.current.renderCount,
      avgRenderTime: metrics.current.avgRenderTime.toFixed(2) + 'ms',
      lastRenderTime: metrics.current.lastRenderTime.toFixed(2) + 'ms',
      totalApiTime: metrics.current.totalApiTime.toFixed(2) + 'ms',
      avgApiTime: metrics.current.apiCallTimes.length > 0 
        ? (metrics.current.totalApiTime / metrics.current.apiCallTimes.length).toFixed(2) + 'ms'
        : 'N/A',
    });
  };

  return {
    trackApiCall,
    getMetrics,
    resetMetrics,
    logSummary,
  };
}

// Global performance tracker
export const globalPerformance = {
  coldStartTime: 0,
  dashboardLoadTime: 0,
  noteSwitchTimes: [] as number[],
  
  startColdTimer() {
    this.coldStartTime = performance.now();
  },
  
  endColdTimer() {
    const duration = performance.now() - this.coldStartTime;
    console.log(`[Performance] Cold start: ${duration.toFixed(2)}ms`);
    return duration;
  },
  
  trackNoteSwitch(start: number) {
    const duration = performance.now() - start;
    this.noteSwitchTimes.push(duration);
    console.log(`[Performance] Note switch: ${duration.toFixed(2)}ms`);
    
    if (duration > 100) {
      console.warn(`[Performance] Note switch exceeded 100ms target!`);
    }
    
    return duration;
  },
  
  trackDashboardLoad(start: number) {
    const duration = performance.now() - start;
    this.dashboardLoadTime = duration;
    console.log(`[Performance] Dashboard load: ${duration.toFixed(2)}ms`);
    
    if (duration > 500) {
      console.warn(`[Performance] Dashboard load exceeded 500ms target!`);
    }
    
    return duration;
  },
  
  getSummary() {
    const avgNoteSwitch = this.noteSwitchTimes.length > 0
      ? this.noteSwitchTimes.reduce((a, b) => a + b, 0) / this.noteSwitchTimes.length
      : 0;
    
    return {
      coldStart: this.coldStartTime ? performance.now() - this.coldStartTime : 0,
      dashboardLoad: this.dashboardLoadTime,
      avgNoteSwitch,
      noteSwitchCount: this.noteSwitchTimes.length,
    };
  },
  
  logSummary() {
    console.log('[Performance Summary]', this.getSummary());
  }
};
