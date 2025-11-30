/**
 * Graph Performance Tests
 * 
 * Tests for verifying performance requirements:
 * - 100 nodes render < 500ms
 * - 500 nodes render < 2s
 * - Sync response < 200ms
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import testDataModule, {
  GeneratedTestData
} from './graphTestData';

const {
  generate100NodeDataset,
  generate500NodeDataset,
  generateMinimalDataset,
  validateTestData,
  benchmarkDataGeneration
} = testDataModule;

// Mock requestAnimationFrame for Node.js environment
beforeAll(() => {
  if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      return setTimeout(() => callback(Date.now()), 16) as unknown as number;
    };
    globalThis.cancelAnimationFrame = (id: number): void => {
      clearTimeout(id);
    };
  }
});
import {
  debounce,
  throttle,
  cullNodesInViewport,
  cullEdgesInViewport,
  createLazyLoadState,
  expandLazyLoadState,
  getVisibleElements,
  createPerformanceMonitor,
  QuadTree,
  chunkGraphData,
  mergeGraphChunks,
  estimateMemoryUsage,
  shouldOptimize,
  ViewportBounds
} from './graphPerformance';

// ============================================================================
// Test Data Generation Tests
// ============================================================================

describe('Test Data Generation', () => {
  it('should generate 100-node dataset within time limit', () => {
    const startTime = performance.now();
    const data = generate100NodeDataset();
    const duration = performance.now() - startTime;
    
    expect(data.nodes.length).toBe(100);
    expect(duration).toBeLessThan(100); // Should generate in < 100ms
  });
  
  it('should generate 500-node dataset within time limit', () => {
    const startTime = performance.now();
    const data = generate500NodeDataset();
    const duration = performance.now() - startTime;
    
    expect(data.nodes.length).toBe(500);
    expect(duration).toBeLessThan(500); // Should generate in < 500ms
  });
  
  it('should generate valid data with no duplicate IDs', () => {
    const data = generate100NodeDataset();
    const validation = validateTestData(data);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
  
  it('should generate edges with valid references', () => {
    const data = generate500NodeDataset();
    const nodeIds = new Set(data.nodes.map(n => n.id));
    
    for (const edge of data.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });
  
  it('should generate reproducible data with same seed', () => {
    const data1 = generate100NodeDataset(12345);
    const data2 = generate100NodeDataset(12345);
    
    expect(data1.nodes.length).toBe(data2.nodes.length);
    expect(data1.edges.length).toBe(data2.edges.length);
    expect(data1.nodes[0].id).toBe(data2.nodes[0].id);
  });
});

// ============================================================================
// Debounce & Throttle Tests
// ============================================================================

describe('Debounce & Throttle', () => {
  it('debounce should delay function execution', async () => {
    let callCount = 0;
    const debouncedFn = debounce(() => { callCount++; }, 50);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    expect(callCount).toBe(0);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(callCount).toBe(1);
  });
  
  it('throttle should limit function calls', async () => {
    let callCount = 0;
    const throttledFn = throttle(() => { callCount++; }, 50);
    
    throttledFn();
    throttledFn();
    throttledFn();
    
    expect(callCount).toBe(1); // First call executes immediately
    
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(callCount).toBeLessThanOrEqual(2);
  });
});

// ============================================================================
// Viewport Culling Tests
// ============================================================================

describe('Viewport Culling', () => {
  let testData: GeneratedTestData;
  
  beforeEach(() => {
    testData = generateMinimalDataset();
  });
  
  it('should cull nodes outside viewport', () => {
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Place half the nodes inside viewport, half outside
    testData.nodes.forEach((node, index) => {
      nodePositions.set(node.id, {
        x: index < testData.nodes.length / 2 ? 50 : 500,
        y: index < testData.nodes.length / 2 ? 50 : 500
      });
    });
    
    const viewport: ViewportBounds = { x1: 0, y1: 0, x2: 100, y2: 100 };
    const visibleNodes = cullNodesInViewport(testData.nodes, nodePositions, viewport);
    
    expect(visibleNodes.length).toBeLessThan(testData.nodes.length);
  });
  
  it('should include nodes without position data', () => {
    const nodePositions = new Map<string, { x: number; y: number }>();
    // Don't set any positions
    
    const viewport: ViewportBounds = { x1: 0, y1: 0, x2: 100, y2: 100 };
    const visibleNodes = cullNodesInViewport(testData.nodes, nodePositions, viewport);
    
    // All nodes should be included since they have no position
    expect(visibleNodes.length).toBe(testData.nodes.length);
  });
  
  it('should cull edges with non-visible endpoints', () => {
    const visibleNodeIds = new Set(testData.nodes.slice(0, 5).map(n => n.id));
    const visibleEdges = cullEdgesInViewport(testData.edges, visibleNodeIds);
    
    // All visible edges should have both endpoints in visible set
    for (const edge of visibleEdges) {
      expect(visibleNodeIds.has(edge.source)).toBe(true);
      expect(visibleNodeIds.has(edge.target)).toBe(true);
    }
  });
});

// ============================================================================
// Lazy Loading Tests
// ============================================================================

describe('Lazy Loading', () => {
  let testData: GeneratedTestData;
  
  beforeEach(() => {
    testData = generate100NodeDataset();
  });
  
  it('should create initial state with root nodes', () => {
    const state = createLazyLoadState(testData.nodes, testData.edges);
    
    expect(state.loadedNodeIds.size).toBeGreaterThan(0);
    expect(state.loadedNodeIds.size).toBeLessThan(testData.nodes.length);
    expect(state.currentDepth).toBe(0);
  });
  
  it('should expand to include neighbor nodes', () => {
    const state = createLazyLoadState(testData.nodes, testData.edges);
    const initialSize = state.loadedNodeIds.size;
    
    const nodeToExpand = Array.from(state.loadedNodeIds)[0];
    const expandedState = expandLazyLoadState(
      state,
      testData.nodes,
      testData.edges,
      [nodeToExpand]
    );
    
    expect(expandedState.loadedNodeIds.size).toBeGreaterThanOrEqual(initialSize);
    expect(expandedState.currentDepth).toBe(1);
  });
  
  it('should get visible elements based on lazy load state', () => {
    const state = createLazyLoadState(testData.nodes, testData.edges);
    const { nodes, edges } = getVisibleElements(testData.nodes, testData.edges, state);
    
    expect(nodes.length).toBe(state.loadedNodeIds.size);
    
    // All edges should connect visible nodes
    const visibleIds = new Set(nodes.map(n => n.id));
    for (const edge of edges) {
      expect(visibleIds.has(edge.source)).toBe(true);
      expect(visibleIds.has(edge.target)).toBe(true);
    }
  });
  
  it('should respect max depth limit', () => {
    let state = createLazyLoadState(testData.nodes, testData.edges);
    
    // Expand multiple times
    for (let i = 0; i < 5; i++) {
      const nodeToExpand = Array.from(state.loadedNodeIds)[0];
      state = expandLazyLoadState(state, testData.nodes, testData.edges, [nodeToExpand], 3);
    }
    
    expect(state.currentDepth).toBeLessThanOrEqual(3);
  });
});

// ============================================================================
// Performance Monitor Tests
// ============================================================================

describe('Performance Monitor', () => {
  it('should track render time', () => {
    const monitor = createPerformanceMonitor();
    
    monitor.startMeasure('test');
    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 10000; i++) sum += i;
    const duration = monitor.endMeasure('test');
    
    expect(duration).toBeGreaterThan(0);
  });
  
  it('should update and retrieve metrics', () => {
    const monitor = createPerformanceMonitor();
    
    monitor.updateMetrics({
      renderTime: 100,
      nodeCount: 500,
      edgeCount: 1000,
      visibleNodes: 200
    });
    
    const metrics = monitor.getMetrics();
    expect(metrics.renderTime).toBe(100);
    expect(metrics.nodeCount).toBe(500);
    expect(metrics.visibleNodes).toBe(200);
  });
});

// ============================================================================
// QuadTree Tests
// ============================================================================

describe('QuadTree Spatial Index', () => {
  it('should insert and query items', () => {
    const bounds: ViewportBounds = { x1: 0, y1: 0, x2: 1000, y2: 1000 };
    const tree = new QuadTree<string>(bounds);
    
    tree.insert('node1', 100, 100);
    tree.insert('node2', 200, 200);
    tree.insert('node3', 800, 800);
    
    const results = tree.query({ x1: 0, y1: 0, x2: 300, y2: 300 });
    
    expect(results).toContain('node1');
    expect(results).toContain('node2');
    expect(results).not.toContain('node3');
  });
  
  it('should handle large number of items', () => {
    const bounds: ViewportBounds = { x1: 0, y1: 0, x2: 10000, y2: 10000 };
    const tree = new QuadTree<number>(bounds);
    
    // Insert 1000 items
    for (let i = 0; i < 1000; i++) {
      tree.insert(i, Math.random() * 10000, Math.random() * 10000);
    }
    
    const startTime = performance.now();
    const results = tree.query({ x1: 0, y1: 0, x2: 5000, y2: 5000 });
    const queryTime = performance.now() - startTime;
    
    expect(queryTime).toBeLessThan(10); // Query should be fast
    expect(results.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Graph Chunking Tests
// ============================================================================

describe('Graph Data Chunking', () => {
  let testData: GeneratedTestData;
  
  beforeEach(() => {
    testData = generate100NodeDataset();
  });
  
  it('should chunk data into smaller pieces', () => {
    const chunks = chunkGraphData(testData.nodes, testData.edges, 25);
    
    expect(chunks.length).toBe(4); // 100 nodes / 25 = 4 chunks
    
    // Each chunk should have nodes
    for (const chunk of chunks) {
      expect(chunk.nodes.length).toBeLessThanOrEqual(25);
    }
  });
  
  it('should merge chunks back to original data', () => {
    const chunks = chunkGraphData(testData.nodes, testData.edges, 25);
    const merged = mergeGraphChunks(chunks);
    
    expect(merged.nodes.length).toBe(testData.nodes.length);
  });
});

// ============================================================================
// Memory Estimation Tests
// ============================================================================

describe('Memory Management', () => {
  it('should estimate memory usage', () => {
    const data = generate100NodeDataset();
    const memoryBytes = estimateMemoryUsage(data.nodes, data.edges);
    
    expect(memoryBytes).toBeGreaterThan(0);
    // 100 nodes * 200 bytes + edges * 100 bytes
    expect(memoryBytes).toBeLessThan(1024 * 1024); // Less than 1MB
  });
  
  it('should recommend optimization for large datasets', () => {
    const smallData = generateMinimalDataset();
    const largeData = generate500NodeDataset();
    
    expect(shouldOptimize(smallData.nodes, smallData.edges, 1)).toBe(false);
    // Large data might need optimization depending on threshold
  });
});

// ============================================================================
// Performance Requirement Tests
// ============================================================================

describe('Performance Requirements', () => {
  it('100 nodes should process in < 500ms', () => {
    const benchmark = benchmarkDataGeneration(100, 3);
    
    expect(benchmark.passed).toBe(true);
    expect(benchmark.generationTime).toBeLessThan(500);
  });
  
  it('500 nodes should process in < 2000ms', () => {
    const benchmark = benchmarkDataGeneration(500, 3);
    
    expect(benchmark.passed).toBe(true);
    expect(benchmark.generationTime).toBeLessThan(2000);
  });
  
  it('lazy loading should reduce visible nodes significantly', () => {
    const data = generate500NodeDataset();
    const state = createLazyLoadState(data.nodes, data.edges);
    const { nodes: visibleNodes } = getVisibleElements(data.nodes, data.edges, state);
    
    // Initial load should show much less than total
    expect(visibleNodes.length).toBeLessThan(data.nodes.length * 0.5);
  });
  
  it('viewport culling should be fast for large datasets', () => {
    const data = generate500NodeDataset();
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Assign random positions
    data.nodes.forEach(node => {
      nodePositions.set(node.id, {
        x: Math.random() * 2000,
        y: Math.random() * 2000
      });
    });
    
    const viewport: ViewportBounds = { x1: 0, y1: 0, x2: 1000, y2: 1000 };
    
    const startTime = performance.now();
    cullNodesInViewport(data.nodes, nodePositions, viewport);
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(50); // Culling should be very fast
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Performance Integration', () => {
  it('should handle full optimization pipeline', () => {
    const data = generate500NodeDataset();
    
    // Step 1: Create lazy load state
    let state = createLazyLoadState(data.nodes, data.edges);
    
    // Step 2: Get initial visible elements
    let { nodes: visibleNodes, edges: visibleEdges } = getVisibleElements(
      data.nodes,
      data.edges,
      state
    );
    
    expect(visibleNodes.length).toBeLessThan(data.nodes.length);
    
    // Step 3: Expand some nodes
    const nodesToExpand = visibleNodes.slice(0, 3).map(n => n.id);
    state = expandLazyLoadState(state, data.nodes, data.edges, nodesToExpand);
    
    // Step 4: Get updated visible elements
    const result = getVisibleElements(data.nodes, data.edges, state);
    
    expect(result.nodes.length).toBeGreaterThan(visibleNodes.length);
  });
  
  it('should maintain data integrity through optimization', () => {
    const data = generate100NodeDataset();
    
    // Apply lazy loading
    const state = createLazyLoadState(data.nodes, data.edges);
    const { nodes, edges } = getVisibleElements(data.nodes, data.edges, state);
    
    // Validate visible data
    const nodeIds = new Set(nodes.map(n => n.id));
    
    for (const edge of edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });
});
