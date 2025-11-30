/**
 * useGraphPerformance Hook
 * 
 * React hook for managing graph performance optimizations including:
 * - Viewport culling
 * - Lazy loading
 * - Debounced/throttled event handlers
 * - Performance metrics tracking
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GraphNode, GraphEdge } from '../components/OptimizedGraphViewer';
import {
  ViewportBounds,
  PerformanceConfig,
  LazyLoadState,
  PerformanceMetrics,
  DEFAULT_PERFORMANCE_CONFIG,
  debounce,
  throttle,
  createLazyLoadState,
  expandLazyLoadState,
  getVisibleElements,
  cullNodesInViewport,
  cullEdgesInViewport,
  createPerformanceMonitor,
  QuadTree,
  estimateMemoryUsage,
} from '../utils/graphPerformance';

// ============================================================================
// Types
// ============================================================================

export interface UseGraphPerformanceOptions {
  nodes: GraphNode[];
  edges: GraphEdge[];
  config?: Partial<PerformanceConfig>;
  rootNodeIds?: string[];
}

export interface UseGraphPerformanceResult {
  // Visible data (after culling/lazy loading)
  visibleNodes: GraphNode[];
  visibleEdges: GraphEdge[];
  
  // Lazy loading controls
  expandNode: (nodeId: string) => void;
  expandNodes: (nodeIds: string[]) => void;
  resetExpansion: () => void;
  loadedNodeIds: Set<string>;
  isFullyLoaded: boolean;
  
  // Viewport culling
  updateViewport: (bounds: ViewportBounds) => void;
  
  // Performance metrics
  metrics: PerformanceMetrics;
  
  // Optimized event handlers
  debouncedSearch: (query: string, callback: (query: string) => void) => void;
  throttledDrag: (nodeId: string, x: number, y: number, callback: (nodeId: string, x: number, y: number) => void) => void;
  throttledZoom: (level: number, callback: (level: number) => void) => void;
  
  // Utility
  shouldOptimize: boolean;
  memoryUsageMB: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGraphPerformance(
  options: UseGraphPerformanceOptions
): UseGraphPerformanceResult {
  const { nodes, edges, config: userConfig, rootNodeIds } = options;
  
  // Merge config with defaults
  const config = useMemo(
    () => ({ ...DEFAULT_PERFORMANCE_CONFIG, ...userConfig }),
    [userConfig]
  );
  
  // State
  const [lazyLoadState, setLazyLoadState] = useState<LazyLoadState>(() =>
    createLazyLoadState(nodes, edges, rootNodeIds)
  );
  const [viewport, setViewport] = useState<ViewportBounds | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );
  
  // Refs for performance tracking
  const performanceMonitor = useRef(createPerformanceMonitor());
  const quadTreeRef = useRef<QuadTree<GraphNode> | null>(null);
  
  // Reset lazy load state when data changes
  useEffect(() => {
    setLazyLoadState(createLazyLoadState(nodes, edges, rootNodeIds));
  }, [nodes, edges, rootNodeIds]);
  
  // Build spatial index when nodes change
  useEffect(() => {
    if (!config.enableViewportCulling) return;
    
    // Create QuadTree with reasonable bounds
    const bounds: ViewportBounds = { x1: -10000, y1: -10000, x2: 10000, y2: 10000 };
    quadTreeRef.current = new QuadTree<GraphNode>(bounds);
    
    // Insert nodes (positions will be updated later)
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (pos) {
        quadTreeRef.current?.insert(node, pos.x, pos.y);
      }
    });
  }, [nodes, nodePositions, config.enableViewportCulling]);
  
  // Calculate visible elements
  const { visibleNodes, visibleEdges } = useMemo(() => {
    performanceMonitor.current.startMeasure('calculateVisible');
    
    let resultNodes: GraphNode[];
    let resultEdges: GraphEdge[];
    
    // Apply lazy loading
    if (config.enableLazyLoading) {
      const lazyResult = getVisibleElements(nodes, edges, lazyLoadState);
      resultNodes = lazyResult.nodes;
      resultEdges = lazyResult.edges;
    } else {
      resultNodes = nodes;
      resultEdges = edges;
    }
    
    // Apply viewport culling
    if (config.enableViewportCulling && viewport) {
      resultNodes = cullNodesInViewport(resultNodes, nodePositions, viewport);
      const visibleNodeIds = new Set(resultNodes.map(n => n.id));
      resultEdges = cullEdgesInViewport(resultEdges, visibleNodeIds);
    }
    
    // Limit max visible nodes
    if (resultNodes.length > config.maxVisibleNodes) {
      resultNodes = resultNodes.slice(0, config.maxVisibleNodes);
      const limitedNodeIds = new Set(resultNodes.map(n => n.id));
      resultEdges = resultEdges.filter(
        e => limitedNodeIds.has(e.source) && limitedNodeIds.has(e.target)
      );
    }
    
    const duration = performanceMonitor.current.endMeasure('calculateVisible');
    performanceMonitor.current.updateMetrics({
      renderTime: duration,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      visibleNodes: resultNodes.length,
    });
    
    return { visibleNodes: resultNodes, visibleEdges: resultEdges };
  }, [nodes, edges, lazyLoadState, viewport, nodePositions, config]);
  
  // Expand single node
  const expandNode = useCallback(
    (nodeId: string) => {
      setLazyLoadState(prev =>
        expandLazyLoadState(prev, nodes, edges, [nodeId])
      );
    },
    [nodes, edges]
  );
  
  // Expand multiple nodes
  const expandNodes = useCallback(
    (nodeIds: string[]) => {
      setLazyLoadState(prev =>
        expandLazyLoadState(prev, nodes, edges, nodeIds)
      );
    },
    [nodes, edges]
  );
  
  // Reset expansion to initial state
  const resetExpansion = useCallback(() => {
    setLazyLoadState(createLazyLoadState(nodes, edges, rootNodeIds));
  }, [nodes, edges, rootNodeIds]);
  
  // Update viewport bounds
  const updateViewport = useCallback((bounds: ViewportBounds) => {
    setViewport(bounds);
  }, []);
  
  // Update node positions (called by Cytoscape)
  const updateNodePositions = useCallback(
    (positions: Map<string, { x: number; y: number }>) => {
      setNodePositions(positions);
    },
    []
  );
  
  // Debounced search handler
  const debouncedSearchRef = useRef(
    debounce((query: string, callback: (query: string) => void) => {
      callback(query);
    }, config.debounceDelay)
  );
  
  const debouncedSearch = useCallback(
    (query: string, callback: (query: string) => void) => {
      debouncedSearchRef.current(query, callback);
    },
    []
  );
  
  // Throttled drag handler
  const throttledDragRef = useRef(
    throttle(
      (nodeId: string, x: number, y: number, callback: (nodeId: string, x: number, y: number) => void) => {
        callback(nodeId, x, y);
      },
      config.throttleInterval
    )
  );
  
  const throttledDrag = useCallback(
    (nodeId: string, x: number, y: number, callback: (nodeId: string, x: number, y: number) => void) => {
      throttledDragRef.current(nodeId, x, y, callback);
    },
    []
  );
  
  // Throttled zoom handler
  const throttledZoomRef = useRef(
    throttle((level: number, callback: (level: number) => void) => {
      callback(level);
    }, config.throttleInterval)
  );
  
  const throttledZoom = useCallback(
    (level: number, callback: (level: number) => void) => {
      throttledZoomRef.current(level, callback);
    },
    []
  );
  
  // Calculate memory usage
  const memoryUsageMB = useMemo(() => {
    const bytes = estimateMemoryUsage(nodes, edges);
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
  }, [nodes, edges]);
  
  // Determine if optimization is needed
  const shouldOptimize = useMemo(() => {
    return nodes.length > 100 || edges.length > 200 || memoryUsageMB > 10;
  }, [nodes.length, edges.length, memoryUsageMB]);
  
  // Check if fully loaded
  const isFullyLoaded = useMemo(() => {
    return lazyLoadState.loadedNodeIds.size >= nodes.length;
  }, [lazyLoadState.loadedNodeIds.size, nodes.length]);
  
  return {
    visibleNodes,
    visibleEdges,
    expandNode,
    expandNodes,
    resetExpansion,
    loadedNodeIds: lazyLoadState.loadedNodeIds,
    isFullyLoaded,
    updateViewport,
    metrics: performanceMonitor.current.getMetrics(),
    debouncedSearch,
    throttledDrag,
    throttledZoom,
    shouldOptimize,
    memoryUsageMB,
  };
}

// ============================================================================
// Additional Hooks
// ============================================================================

/**
 * Hook for tracking and displaying performance metrics.
 */
export function usePerformanceMetrics(
  enabled: boolean = true
): {
  metrics: PerformanceMetrics;
  isPerformant: boolean;
  warnings: string[];
} {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0,
    visibleNodes: 0,
    fps: 60,
    lastUpdate: Date.now(),
  });
  
  const warnings = useMemo(() => {
    const result: string[] = [];
    
    if (metrics.renderTime > 500) {
      result.push(`Slow render: ${Math.round(metrics.renderTime)}ms`);
    }
    if (metrics.fps < 30) {
      result.push(`Low FPS: ${metrics.fps}`);
    }
    if (metrics.nodeCount > 500) {
      result.push(`Large dataset: ${metrics.nodeCount} nodes`);
    }
    
    return result;
  }, [metrics]);
  
  const isPerformant = useMemo(() => {
    return metrics.renderTime < 500 && metrics.fps >= 30;
  }, [metrics]);
  
  return { metrics, isPerformant, warnings };
}

/**
 * Hook for managing node expansion state.
 */
export function useNodeExpansion(
  nodes: GraphNode[],
  edges: GraphEdge[]
): {
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  getNeighbors: (nodeId: string) => string[];
} {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);
  
  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(nodes.map(n => n.id)));
  }, [nodes]);
  
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  const getNeighbors = useCallback(
    (nodeId: string): string[] => {
      const neighbors: string[] = [];
      
      for (const edge of edges) {
        if (edge.source === nodeId) {
          neighbors.push(edge.target);
        } else if (edge.target === nodeId) {
          neighbors.push(edge.source);
        }
      }
      
      return neighbors;
    },
    [edges]
  );
  
  return {
    expandedNodes,
    toggleExpand,
    expandAll,
    collapseAll,
    getNeighbors,
  };
}

export default useGraphPerformance;
