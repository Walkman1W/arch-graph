/**
 * Graph Performance Utilities
 * 
 * Provides performance optimization utilities for large graph datasets:
 * - Viewport culling (only render visible nodes)
 * - Lazy loading (progressive node expansion)
 * - Debounce/throttle for event handlers
 * - Batch updates for state management
 * - Virtual scrolling support
 */

import { GraphNode, GraphEdge } from '../components/OptimizedGraphViewer';

// ============================================================================
// Types
// ============================================================================

export interface ViewportBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PerformanceConfig {
  /** Maximum nodes to render at once */
  maxVisibleNodes: number;
  /** Debounce delay for search/filter (ms) */
  debounceDelay: number;
  /** Throttle interval for drag/zoom (ms) */
  throttleInterval: number;
  /** Enable viewport culling */
  enableViewportCulling: boolean;
  /** Enable lazy loading */
  enableLazyLoading: boolean;
  /** Initial expansion depth */
  initialDepth: number;
  /** Batch size for progressive loading */
  batchSize: number;
}

export interface LazyLoadState {
  loadedNodeIds: Set<string>;
  pendingNodeIds: string[];
  isLoading: boolean;
  currentDepth: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  nodeCount: number;
  edgeCount: number;
  visibleNodes: number;
  fps: number;
  lastUpdate: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  maxVisibleNodes: 500,
  debounceDelay: 300,
  throttleInterval: 16, // ~60fps
  enableViewportCulling: true,
  enableLazyLoading: true,
  initialDepth: 1,
  batchSize: 50,
};

// ============================================================================
// Debounce & Throttle Utilities
// ============================================================================

/**
 * Creates a debounced function that delays invoking func until after wait ms
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per
 * every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastTime = now;
      func(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };
}

// ============================================================================
// Viewport Culling
// ============================================================================

/**
 * Filters nodes to only include those within the viewport bounds.
 * Uses spatial indexing for efficient culling.
 */
export function cullNodesInViewport(
  nodes: GraphNode[],
  nodePositions: Map<string, { x: number; y: number }>,
  viewport: ViewportBounds,
  padding: number = 50
): GraphNode[] {
  const expandedViewport = {
    x1: viewport.x1 - padding,
    y1: viewport.y1 - padding,
    x2: viewport.x2 + padding,
    y2: viewport.y2 + padding,
  };

  return nodes.filter(node => {
    const pos = nodePositions.get(node.id);
    if (!pos) return true; // Include nodes without position data
    
    return (
      pos.x >= expandedViewport.x1 &&
      pos.x <= expandedViewport.x2 &&
      pos.y >= expandedViewport.y1 &&
      pos.y <= expandedViewport.y2
    );
  });
}

/**
 * Filters edges to only include those with both endpoints visible.
 */
export function cullEdgesInViewport(
  edges: GraphEdge[],
  visibleNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter(
    edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );
}

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * Creates initial lazy load state with root nodes.
 */
export function createLazyLoadState(
  nodes: GraphNode[],
  edges: GraphEdge[],
  rootNodeIds?: string[]
): LazyLoadState {
  // Find root nodes (nodes with no incoming edges or specified roots)
  const targetIds = new Set(edges.map(e => e.target));
  const roots = rootNodeIds 
    ? nodes.filter(n => rootNodeIds.includes(n.id))
    : nodes.filter(n => !targetIds.has(n.id));

  const loadedNodeIds = new Set(roots.map(n => n.id));

  return {
    loadedNodeIds,
    pendingNodeIds: [],
    isLoading: false,
    currentDepth: 0,
  };
}

/**
 * Expands lazy load state to include neighbors of specified nodes.
 */
export function expandLazyLoadState(
  state: LazyLoadState,
  nodes: GraphNode[],
  edges: GraphEdge[],
  expandNodeIds: string[],
  maxDepth: number = 3
): LazyLoadState {
  if (state.currentDepth >= maxDepth) {
    return state;
  }

  const newLoadedIds = new Set(state.loadedNodeIds);
  const newPendingIds: string[] = [];

  // Find neighbors of expanded nodes
  for (const nodeId of expandNodeIds) {
    // Find outgoing edges
    const outgoing = edges.filter(e => e.source === nodeId);
    for (const edge of outgoing) {
      if (!newLoadedIds.has(edge.target)) {
        newLoadedIds.add(edge.target);
        newPendingIds.push(edge.target);
      }
    }

    // Find incoming edges
    const incoming = edges.filter(e => e.target === nodeId);
    for (const edge of incoming) {
      if (!newLoadedIds.has(edge.source)) {
        newLoadedIds.add(edge.source);
        newPendingIds.push(edge.source);
      }
    }
  }

  return {
    loadedNodeIds: newLoadedIds,
    pendingNodeIds: newPendingIds,
    isLoading: false,
    currentDepth: state.currentDepth + 1,
  };
}

/**
 * Gets visible nodes and edges based on lazy load state.
 */
export function getVisibleElements(
  nodes: GraphNode[],
  edges: GraphEdge[],
  state: LazyLoadState
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const visibleNodes = nodes.filter(n => state.loadedNodeIds.has(n.id));
  const visibleEdges = edges.filter(
    e => state.loadedNodeIds.has(e.source) && state.loadedNodeIds.has(e.target)
  );

  return { nodes: visibleNodes, edges: visibleEdges };
}

// ============================================================================
// Batch Updates
// ============================================================================

/**
 * Batches multiple updates into a single render cycle using requestAnimationFrame.
 */
export function batchUpdates<T>(
  updates: (() => T)[],
  callback: (results: T[]) => void
): void {
  requestAnimationFrame(() => {
    const results = updates.map(update => update());
    callback(results);
  });
}

/**
 * Creates a batch processor for progressive loading.
 */
export function createBatchProcessor<T>(
  items: T[],
  batchSize: number,
  processItem: (item: T) => void,
  onComplete?: () => void
): { start: () => void; cancel: () => void } {
  let currentIndex = 0;
  let animationFrameId: number | null = null;
  let isCancelled = false;

  const processBatch = () => {
    if (isCancelled) return;

    const endIndex = Math.min(currentIndex + batchSize, items.length);
    
    for (let i = currentIndex; i < endIndex; i++) {
      processItem(items[i]);
    }

    currentIndex = endIndex;

    if (currentIndex < items.length) {
      animationFrameId = requestAnimationFrame(processBatch);
    } else {
      onComplete?.();
    }
  };

  return {
    start: () => {
      isCancelled = false;
      currentIndex = 0;
      animationFrameId = requestAnimationFrame(processBatch);
    },
    cancel: () => {
      isCancelled = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    },
  };
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Creates a performance monitor for tracking render metrics.
 */
export function createPerformanceMonitor(): {
  startMeasure: (label: string) => void;
  endMeasure: (label: string) => number;
  getMetrics: () => PerformanceMetrics;
  updateMetrics: (partial: Partial<PerformanceMetrics>) => void;
} {
  const measurements = new Map<string, number>();
  let metrics: PerformanceMetrics = {
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0,
    visibleNodes: 0,
    fps: 60,
    lastUpdate: Date.now(),
  };

  // FPS tracking
  let frameCount = 0;
  let lastFpsUpdate = Date.now();

  const updateFps = () => {
    const now = Date.now();
    const elapsed = now - lastFpsUpdate;
    
    if (elapsed >= 1000) {
      metrics.fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastFpsUpdate = now;
    }
    
    frameCount++;
    requestAnimationFrame(updateFps);
  };

  // Start FPS tracking
  requestAnimationFrame(updateFps);

  return {
    startMeasure: (label: string) => {
      measurements.set(label, performance.now());
    },
    endMeasure: (label: string) => {
      const start = measurements.get(label);
      if (start === undefined) return 0;
      
      const duration = performance.now() - start;
      measurements.delete(label);
      return duration;
    },
    getMetrics: () => ({ ...metrics }),
    updateMetrics: (partial: Partial<PerformanceMetrics>) => {
      metrics = { ...metrics, ...partial, lastUpdate: Date.now() };
    },
  };
}

// ============================================================================
// Spatial Index (QuadTree)
// ============================================================================

interface QuadTreeNode<T> {
  bounds: ViewportBounds;
  items: { item: T; x: number; y: number }[];
  children: QuadTreeNode<T>[] | null;
}

/**
 * Simple QuadTree implementation for spatial indexing.
 */
export class QuadTree<T> {
  private root: QuadTreeNode<T>;
  private maxItems: number;
  private maxDepth: number;

  constructor(
    bounds: ViewportBounds,
    maxItems: number = 10,
    maxDepth: number = 8
  ) {
    this.root = {
      bounds,
      items: [],
      children: null,
    };
    this.maxItems = maxItems;
    this.maxDepth = maxDepth;
  }

  insert(item: T, x: number, y: number): void {
    this.insertIntoNode(this.root, item, x, y, 0);
  }

  private insertIntoNode(
    node: QuadTreeNode<T>,
    item: T,
    x: number,
    y: number,
    depth: number
  ): void {
    // Check if point is within bounds
    if (!this.containsPoint(node.bounds, x, y)) return;

    // If leaf node and not full, add item
    if (node.children === null) {
      node.items.push({ item, x, y });

      // Subdivide if needed
      if (node.items.length > this.maxItems && depth < this.maxDepth) {
        this.subdivide(node, depth);
      }
      return;
    }

    // Insert into appropriate child
    for (const child of node.children) {
      if (this.containsPoint(child.bounds, x, y)) {
        this.insertIntoNode(child, item, x, y, depth + 1);
        return;
      }
    }
  }

  private subdivide(node: QuadTreeNode<T>, depth: number): void {
    const { x1, y1, x2, y2 } = node.bounds;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    node.children = [
      { bounds: { x1, y1, x2: midX, y2: midY }, items: [], children: null },
      { bounds: { x1: midX, y1, x2, y2: midY }, items: [], children: null },
      { bounds: { x1, y1: midY, x2: midX, y2 }, items: [], children: null },
      { bounds: { x1: midX, y1: midY, x2, y2 }, items: [], children: null },
    ];

    // Redistribute items
    for (const { item, x, y } of node.items) {
      for (const child of node.children) {
        if (this.containsPoint(child.bounds, x, y)) {
          this.insertIntoNode(child, item, x, y, depth + 1);
          break;
        }
      }
    }

    node.items = [];
  }

  query(bounds: ViewportBounds): T[] {
    const results: T[] = [];
    this.queryNode(this.root, bounds, results);
    return results;
  }

  private queryNode(
    node: QuadTreeNode<T>,
    bounds: ViewportBounds,
    results: T[]
  ): void {
    // Check if bounds intersect
    if (!this.intersects(node.bounds, bounds)) return;

    // Add items from this node
    for (const { item, x, y } of node.items) {
      if (this.containsPoint(bounds, x, y)) {
        results.push(item);
      }
    }

    // Query children
    if (node.children !== null) {
      for (const child of node.children) {
        this.queryNode(child, bounds, results);
      }
    }
  }

  private containsPoint(bounds: ViewportBounds, x: number, y: number): boolean {
    return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2;
  }

  private intersects(a: ViewportBounds, b: ViewportBounds): boolean {
    return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
  }

  clear(): void {
    this.root.items = [];
    this.root.children = null;
  }
}

// ============================================================================
// Graph Data Chunking
// ============================================================================

/**
 * Chunks large graph data for progressive loading.
 */
export function chunkGraphData(
  nodes: GraphNode[],
  edges: GraphEdge[],
  chunkSize: number
): { nodes: GraphNode[]; edges: GraphEdge[] }[] {
  const chunks: { nodes: GraphNode[]; edges: GraphEdge[] }[] = [];
  
  for (let i = 0; i < nodes.length; i += chunkSize) {
    const chunkNodes = nodes.slice(i, i + chunkSize);
    const chunkNodeIds = new Set(chunkNodes.map(n => n.id));
    
    // Include edges where both endpoints are in this chunk
    const chunkEdges = edges.filter(
      e => chunkNodeIds.has(e.source) && chunkNodeIds.has(e.target)
    );
    
    chunks.push({ nodes: chunkNodes, edges: chunkEdges });
  }
  
  return chunks;
}

/**
 * Merges multiple graph data chunks.
 */
export function mergeGraphChunks(
  chunks: { nodes: GraphNode[]; edges: GraphEdge[] }[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();
  
  for (const chunk of chunks) {
    for (const node of chunk.nodes) {
      nodeMap.set(node.id, node);
    }
    for (const edge of chunk.edges) {
      edgeMap.set(edge.id, edge);
    }
  }
  
  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Estimates memory usage of graph data in bytes.
 */
export function estimateMemoryUsage(
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  // Rough estimation: ~200 bytes per node, ~100 bytes per edge
  const nodeMemory = nodes.length * 200;
  const edgeMemory = edges.length * 100;
  return nodeMemory + edgeMemory;
}

/**
 * Checks if graph data exceeds memory threshold.
 */
export function shouldOptimize(
  nodes: GraphNode[],
  edges: GraphEdge[],
  thresholdMB: number = 50
): boolean {
  const memoryUsage = estimateMemoryUsage(nodes, edges);
  const thresholdBytes = thresholdMB * 1024 * 1024;
  return memoryUsage > thresholdBytes;
}
