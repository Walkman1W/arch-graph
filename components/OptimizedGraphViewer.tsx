/**
 * OptimizedGraphViewer Component
 * 
 * High-performance graph visualization component with:
 * - Viewport culling for large datasets
 * - Lazy loading with progressive expansion
 * - Debounced/throttled event handlers
 * - Performance metrics display
 * - Virtual rendering for 500+ nodes
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  memo,
} from 'react';
import { PaneState, HighlightStyle } from '../types';
import { useGraphPerformance } from '../hooks/useGraphPerformance';
import { debounce, throttle } from '../utils/graphPerformance';

// ============================================================================
// Types
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  type: 'Project' | 'Level' | 'Space' | 'Element' | 'System' | 'Pipe' | 'Duct' | 'MEPElement' | 'MEPSystem' | 'Storey';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PASSES_THROUGH' | 'CONNECTED_TO' | 'ADJACENT_TO' | 'CROSSES' | 'BELONGS_TO_SYSTEM' | 'ON_LEVEL';
}

export type LayoutMode = 'hierarchy' | 'force' | 'circular' | 'grid';

interface OptimizedGraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: PaneState;
  layoutMode?: LayoutMode;
  showPerformanceMetrics?: boolean;
  enableOptimizations?: boolean;
}

// ============================================================================
// Memoized Sub-components
// ============================================================================

const LayoutControls = memo(({
  currentLayout,
  onLayoutChange,
}: {
  currentLayout: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
}) => (
  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 z-10 p-2">
    <div className="text-xs text-slate-600 mb-2 font-semibold">Layout</div>
    <div className="flex flex-col gap-1">
      {(['hierarchy', 'force', 'circular', 'grid'] as LayoutMode[]).map(mode => (
        <button
          key={mode}
          onClick={() => onLayoutChange(mode)}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            currentLayout === mode
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  </div>
));

LayoutControls.displayName = 'LayoutControls';

const StatusBadge = memo(({
  selectedCount,
  totalNodes,
  visibleNodes,
  isOptimized,
}: {
  selectedCount: number;
  totalNodes: number;
  visibleNodes: number;
  isOptimized: boolean;
}) => (
  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${selectedCount > 0 ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`} />
    <span className="text-xs font-semibold text-slate-700">
      {selectedCount > 0 
        ? `${selectedCount} Selected` 
        : isOptimized 
          ? `${visibleNodes}/${totalNodes} Nodes`
          : `${totalNodes} Nodes`
      }
    </span>
    {isOptimized && (
      <span className="text-xs text-green-600 font-medium">⚡ Optimized</span>
    )}
  </div>
));

StatusBadge.displayName = 'StatusBadge';

const PerformancePanel = memo(({
  metrics,
  memoryMB,
  isVisible,
}: {
  metrics: { renderTime: number; fps: number; visibleNodes: number; nodeCount: number };
  memoryMB: number;
  isVisible: boolean;
}) => {
  if (!isVisible) return null;
  
  const isPerformant = metrics.renderTime < 500 && metrics.fps >= 30;
  
  return (
    <div className="absolute bottom-16 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 z-10 p-2 text-xs">
      <div className="font-semibold text-slate-700 mb-1">Performance</div>
      <div className="space-y-0.5 text-slate-600">
        <div className="flex justify-between gap-4">
          <span>Render:</span>
          <span className={metrics.renderTime > 500 ? 'text-red-500' : 'text-green-600'}>
            {Math.round(metrics.renderTime)}ms
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? 'text-red-500' : 'text-green-600'}>
            {metrics.fps}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Visible:</span>
          <span>{metrics.visibleNodes}/{metrics.nodeCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Memory:</span>
          <span>{memoryMB}MB</span>
        </div>
      </div>
      <div className={`mt-1 pt-1 border-t border-slate-200 ${isPerformant ? 'text-green-600' : 'text-amber-500'}`}>
        {isPerformant ? '✓ Good' : '⚠ Needs optimization'}
      </div>
    </div>
  );
});

PerformancePanel.displayName = 'PerformancePanel';

const NodeLegend = memo(({ getNodeTypeColor }: { getNodeTypeColor: (type: string) => string }) => (
  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 z-10 p-2">
    <div className="text-xs text-slate-600 mb-2 font-semibold">Node Types</div>
    <div className="flex flex-col gap-1">
      {['Project', 'Level', 'Space', 'Element', 'System'].map(type => (
        <div key={type} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getNodeTypeColor(type) }}
          />
          <span className="text-xs text-slate-600">{type}</span>
        </div>
      ))}
    </div>
  </div>
));

NodeLegend.displayName = 'NodeLegend';

// ============================================================================
// Main Component
// ============================================================================

const OptimizedGraphViewer: React.FC<OptimizedGraphViewerProps> = ({
  nodes,
  edges,
  selectedNodes,
  highlightedNodes,
  hoveredNode,
  onNodeClick,
  onNodeHover,
  paneState,
  layoutMode = 'hierarchy',
  showPerformanceMetrics = false,
  enableOptimizations = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>(layoutMode);
  
  // Use performance optimization hook
  const {
    visibleNodes,
    visibleEdges,
    expandNode,
    expandNodes,
    resetExpansion,
    loadedNodeIds,
    isFullyLoaded,
    updateViewport,
    metrics,
    debouncedSearch,
    throttledDrag,
    throttledZoom,
    shouldOptimize,
    memoryUsageMB,
  } = useGraphPerformance({
    nodes,
    edges,
    config: {
      enableViewportCulling: enableOptimizations && nodes.length > 100,
      enableLazyLoading: enableOptimizations && nodes.length > 50,
      maxVisibleNodes: 500,
    },
  });
  
  // Use optimized or original data based on settings
  const displayNodes = enableOptimizations ? visibleNodes : nodes;
  const displayEdges = enableOptimizations ? visibleEdges : edges;
  
  // Memoized node click handler
  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick(nodeId);
    if (enableOptimizations) {
      expandNode(nodeId);
    }
  }, [onNodeClick, expandNode, enableOptimizations]);
  
  // Throttled hover handler
  const handleNodeHoverThrottled = useMemo(
    () => throttle((nodeId: string | null) => onNodeHover(nodeId), 50),
    [onNodeHover]
  );
  
  // Memoized layout config
  const getLayoutConfig = useCallback((mode: LayoutMode) => {
    const baseConfig = {
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
    };
    
    switch (mode) {
      case 'hierarchy':
        return {
          ...baseConfig,
          name: 'breadthfirst',
          directed: true,
          spacingFactor: 1.5,
        };
      case 'force':
        return {
          ...baseConfig,
          name: 'cose',
          nodeRepulsion: (node: any) => 8000,
          idealEdgeLength: (edge: any) => 100,
          edgeElasticity: (edge: any) => 100,
          numIter: 100,
          randomize: false,
        };
      case 'circular':
        return {
          ...baseConfig,
          name: 'circle',
          spacingFactor: 1.5,
        };
      case 'grid':
        return {
          ...baseConfig,
          name: 'grid',
          rows: Math.ceil(Math.sqrt(displayNodes.length)),
          cols: Math.ceil(Math.sqrt(displayNodes.length)),
        };
      default:
        return { ...baseConfig, name: 'breadthfirst' };
    }
  }, [displayNodes.length]);
  
  // Memoized styles
  const getCytoscapeStyles = useMemo(() => [
    {
      selector: 'node',
      style: {
        'background-color': '#94A3B8',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '10px',
        'color': '#1E293B',
        'width': '36px',
        'height': '36px',
        'border-width': '2px',
        'border-color': '#CBD5E1',
        'text-max-width': '80px',
        'text-wrap': 'ellipsis',
      },
    },
    {
      selector: 'node[type="Project"]',
      style: { 'background-color': '#8B5CF6', 'shape': 'diamond' },
    },
    {
      selector: 'node[type="Level"], node[type="Storey"]',
      style: { 'background-color': '#3B82F6', 'shape': 'rectangle' },
    },
    {
      selector: 'node[type="Space"]',
      style: { 'background-color': '#10B981', 'shape': 'roundrectangle' },
    },
    {
      selector: 'node[type="Element"], node[type="MEPElement"]',
      style: { 'background-color': '#F59E0B', 'shape': 'ellipse' },
    },
    {
      selector: 'node[type="System"], node[type="MEPSystem"]',
      style: { 'background-color': '#EF4444', 'shape': 'hexagon' },
    },
    {
      selector: 'node[type="Pipe"]',
      style: { 'background-color': '#06B6D4', 'shape': 'ellipse' },
    },
    {
      selector: 'node[type="Duct"]',
      style: { 'background-color': '#EC4899', 'shape': 'ellipse' },
    },
    {
      selector: 'node.selected',
      style: { 'border-width': '4px', 'border-color': '#3B82F6', 'z-index': 999 },
    },
    {
      selector: 'node.highlighted',
      style: { 'border-width': '3px', 'border-color': '#F59E0B' },
    },
    {
      selector: 'node.preview',
      style: { 'border-width': '2px', 'border-color': '#60A5FA', 'opacity': 0.7 },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#CBD5E1',
        'target-arrow-color': '#CBD5E1',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
      },
    },
    {
      selector: 'edge[type="HAS_LEVEL"], edge[type="ON_LEVEL"]',
      style: { 'line-color': '#3B82F6', 'target-arrow-color': '#3B82F6' },
    },
    {
      selector: 'edge[type="CONTAINS"], edge[type="ADJACENT_TO"]',
      style: { 'line-color': '#10B981', 'target-arrow-color': '#10B981' },
    },
    {
      selector: 'edge[type="HAS_ELEMENT"], edge[type="BELONGS_TO_SYSTEM"]',
      style: { 'line-color': '#F59E0B', 'target-arrow-color': '#F59E0B' },
    },
    {
      selector: 'edge[type="CROSSES"]',
      style: { 'line-color': '#EF4444', 'line-style': 'dashed', 'target-arrow-color': '#EF4444' },
    },
    {
      selector: 'edge[type="PASSES_THROUGH"]',
      style: { 'line-color': '#8B5CF6', 'target-arrow-color': '#8B5CF6' },
    },
  ], []);
  
  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;
    
    const cytoscape = (window as any).cytoscape;
    if (!cytoscape) {
      console.warn('Cytoscape.js not loaded');
      return;
    }
    
    const cy = cytoscape({
      container: containerRef.current,
      style: getCytoscapeStyles,
      layout: getLayoutConfig(currentLayout),
      minZoom: 0.3,
      maxZoom: 4,
      wheelSensitivity: 0.15,
      boxSelectionEnabled: false,
      autounselectify: false,
    });
    
    cyRef.current = cy;
    
    // Event handlers with throttling
    cy.on('tap', 'node', (evt: any) => {
      handleNodeClick(evt.target.id());
    });
    
    cy.on('mouseover', 'node', (evt: any) => {
      handleNodeHoverThrottled(evt.target.id());
    });
    
    cy.on('mouseout', 'node', () => {
      handleNodeHoverThrottled(null);
    });
    
    // Update viewport on pan/zoom
    const updateViewportBounds = throttle(() => {
      const extent = cy.extent();
      updateViewport({
        x1: extent.x1,
        y1: extent.y1,
        x2: extent.x2,
        y2: extent.y2,
      });
    }, 100);
    
    cy.on('pan zoom', updateViewportBounds);
    
    return () => {
      cy.destroy();
    };
  }, []);
  
  // Update graph data efficiently
  useEffect(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    // Batch element updates
    cy.startBatch();
    
    // Get current element IDs
    const currentNodeIds = new Set(cy.nodes().map((n: any) => n.id()));
    const currentEdgeIds = new Set(cy.edges().map((e: any) => e.id()));
    
    // Calculate diff
    const newNodeIds = new Set(displayNodes.map(n => n.id));
    const newEdgeIds = new Set(displayEdges.map(e => e.id));
    
    // Remove old elements
    cy.nodes().forEach((node: any) => {
      if (!newNodeIds.has(node.id())) {
        node.remove();
      }
    });
    
    cy.edges().forEach((edge: any) => {
      if (!newEdgeIds.has(edge.id())) {
        edge.remove();
      }
    });
    
    // Add new nodes
    const nodesToAdd = displayNodes
      .filter(n => !currentNodeIds.has(n.id))
      .map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          ...node.properties,
        },
      }));
    
    // Add new edges
    const edgesToAdd = displayEdges
      .filter(e => !currentEdgeIds.has(e.id))
      .map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      }));
    
    if (nodesToAdd.length > 0 || edgesToAdd.length > 0) {
      cy.add([...nodesToAdd, ...edgesToAdd]);
    }
    
    cy.endBatch();
    
    // Run layout only if significant changes
    if (nodesToAdd.length > 5 || edgesToAdd.length > 10) {
      cy.layout(getLayoutConfig(currentLayout)).run();
    }
  }, [displayNodes, displayEdges, currentLayout, getLayoutConfig]);
  
  // Apply highlights efficiently
  useEffect(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    cy.startBatch();
    
    // Reset styles
    cy.nodes().removeClass('highlighted selected preview');
    
    // Apply highlighted styles
    highlightedNodes.forEach((style, nodeId) => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        const className = style.intensity === 'preview' ? 'preview' : 
                         style.intensity === 'selected' ? 'selected' : 'highlighted';
        node.addClass(className);
        node.style('background-color', style.color);
      }
    });
    
    // Apply selected styles
    selectedNodes.forEach(nodeId => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        node.addClass('selected');
      }
    });
    
    cy.endBatch();
  }, [highlightedNodes, selectedNodes]);
  
  // Focus on selected nodes
  useEffect(() => {
    if (!cyRef.current || selectedNodes.size === 0) return;
    
    const cy = cyRef.current;
    const selectedElements = cy.collection();
    
    selectedNodes.forEach(nodeId => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        selectedElements.merge(node);
      }
    });
    
    if (selectedElements.length > 0) {
      cy.animate({
        fit: { eles: selectedElements, padding: 50 },
        duration: 400,
        easing: 'ease-out',
      });
    }
  }, [selectedNodes]);
  
  // Change layout
  const changeLayout = useCallback((mode: LayoutMode) => {
    setCurrentLayout(mode);
    if (cyRef.current) {
      cyRef.current.layout(getLayoutConfig(mode)).run();
    }
  }, [getLayoutConfig]);
  
  // Get node type color
  const getNodeTypeColor = useCallback((type: string): string => {
    const colors: Record<string, string> = {
      Project: '#8B5CF6',
      Level: '#3B82F6',
      Storey: '#3B82F6',
      Space: '#10B981',
      Element: '#F59E0B',
      MEPElement: '#F59E0B',
      System: '#EF4444',
      MEPSystem: '#EF4444',
      Pipe: '#06B6D4',
      Duct: '#EC4899',
    };
    return colors[type] || '#94A3B8';
  }, []);
  
  // Load all nodes button handler
  const handleLoadAll = useCallback(() => {
    if (enableOptimizations && !isFullyLoaded) {
      expandNodes(nodes.map(n => n.id));
    }
  }, [enableOptimizations, isFullyLoaded, expandNodes, nodes]);

  return (
    <div className="w-full h-full relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Cytoscape container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Layout controls */}
      {paneState !== 'minimized' && (
        <LayoutControls
          currentLayout={currentLayout}
          onLayoutChange={changeLayout}
        />
      )}
      
      {/* Status badge */}
      <StatusBadge
        selectedCount={selectedNodes.size}
        totalNodes={nodes.length}
        visibleNodes={displayNodes.length}
        isOptimized={enableOptimizations && shouldOptimize}
      />
      
      {/* Performance metrics panel */}
      <PerformancePanel
        metrics={metrics}
        memoryMB={memoryUsageMB}
        isVisible={showPerformanceMetrics && paneState !== 'minimized'}
      />
      
      {/* Load all button (when lazy loading) */}
      {enableOptimizations && !isFullyLoaded && paneState !== 'minimized' && (
        <button
          onClick={handleLoadAll}
          className="absolute top-14 left-4 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors z-10"
        >
          Load All ({nodes.length - displayNodes.length} more)
        </button>
      )}
      
      {/* Node info */}
      {selectedNodes.size > 0 && paneState !== 'minimized' && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-slate-200 z-10 max-w-xs">
          <div className="text-xs text-slate-600">
            {Array.from(selectedNodes).slice(0, 3).map(id => {
              const node = nodes.find(n => n.id === id);
              return node ? (
                <div key={id} className="mb-1 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getNodeTypeColor(node.type) }}
                  />
                  <span className="font-semibold truncate">{node.label}</span>
                  <span className="text-slate-400 flex-shrink-0">{node.type}</span>
                </div>
              ) : null;
            })}
            {selectedNodes.size > 3 && (
              <div className="text-slate-400">+{selectedNodes.size - 3} more</div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      {paneState !== 'minimized' && (
        <NodeLegend getNodeTypeColor={getNodeTypeColor} />
      )}
      
      {/* Minimized state */}
      {paneState === 'minimized' && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-white text-sm">Graph Viewer Minimized</div>
        </div>
      )}
      
      {/* No Cytoscape warning */}
      {typeof window !== 'undefined' && !(window as any).cytoscape && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center p-6">
            <div className="text-slate-600 text-lg mb-2">Cytoscape.js Not Loaded</div>
            <div className="text-slate-400 text-sm">
              Please install: npm install cytoscape
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(OptimizedGraphViewer);
