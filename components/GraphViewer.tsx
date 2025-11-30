import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { PaneState, HighlightStyle } from '../types';
import { 
  GraphData, 
  GraphNode, 
  GraphEdge, 
  NodeType, 
  EdgeType 
} from '../services/mockGraphData';

// Re-export types for backward compatibility
export type { GraphNode, GraphEdge, GraphData };

// Layout types
export type LayoutMode = 'hierarchy' | 'force' | 'concentric' | 'grid';

// Style configuration
export interface NodeStyle {
  backgroundColor: string;
  shape: string;
  width: number;
  height: number;
}

export interface EdgeStyle {
  lineColor: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  width: number;
  targetArrowShape: string;
}

export interface StyleConfig {
  nodeStyles: Record<NodeType, NodeStyle>;
  edgeStyles: Record<EdgeType, EdgeStyle>;
}

// Default style configuration based on design document
const DEFAULT_STYLE_CONFIG: StyleConfig = {
  nodeStyles: {
    Space: { backgroundColor: '#3B82F6', shape: 'ellipse', width: 60, height: 60 },
    MEPElement: { backgroundColor: '#10B981', shape: 'rectangle', width: 50, height: 40 },
    MEPSystem: { backgroundColor: '#F59E0B', shape: 'hexagon', width: 70, height: 70 },
    Storey: { backgroundColor: '#6B7280', shape: 'diamond', width: 80, height: 80 },
    RouteNode: { backgroundColor: '#8B5CF6', shape: 'ellipse', width: 30, height: 30 },
  },
  edgeStyles: {
    ON_LEVEL: { lineColor: '#94A3B8', lineStyle: 'solid', width: 2, targetArrowShape: 'none' },
    ADJACENT_TO: { lineColor: '#94A3B8', lineStyle: 'solid', width: 2, targetArrowShape: 'none' },
    CONNECTS_TO: { lineColor: '#60A5FA', lineStyle: 'solid', width: 2, targetArrowShape: 'none' },
    CROSSES: { lineColor: '#EF4444', lineStyle: 'dashed', width: 2, targetArrowShape: 'none' },
    BELONGS_TO_SYSTEM: { lineColor: '#F59E0B', lineStyle: 'solid', width: 2, targetArrowShape: 'triangle' },
    SERVES: { lineColor: '#10B981', lineStyle: 'solid', width: 2, targetArrowShape: 'triangle' },
    IN_BUILDING: { lineColor: '#6B7280', lineStyle: 'solid', width: 1, targetArrowShape: 'none' },
    IN_ZONE: { lineColor: '#8B5CF6', lineStyle: 'solid', width: 1, targetArrowShape: 'none' },
  },
};


interface GraphViewerProps {
  // New GraphData interface
  data?: GraphData;
  // Legacy props for backward compatibility
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  // Selection and highlighting
  selectedNodes?: Set<string>;
  highlightedNodes?: Map<string, HighlightStyle>;
  hoveredNode?: string | null;
  // Event handlers
  onNodeClick?: (nodeId: string, node: GraphNode) => void;
  onEdgeClick?: (edgeId: string, edge: GraphEdge) => void;
  onNodeHover?: (nodeId: string | null) => void;
  // Layout and style
  paneState?: PaneState;
  layoutMode?: LayoutMode;
  styleConfig?: StyleConfig;
  // Zoom controls
  showZoomControls?: boolean;
  showLegend?: boolean;
  showLayoutControls?: boolean;
  // Custom scenario selector slot
  scenarioSelector?: React.ReactNode;
}

const GraphViewer: React.FC<GraphViewerProps> = ({
  data,
  nodes: legacyNodes,
  edges: legacyEdges,
  selectedNodes = new Set(),
  highlightedNodes = new Map(),
  hoveredNode = null,
  onNodeClick,
  onEdgeClick,
  onNodeHover,
  paneState = 'normal',
  layoutMode = 'force',
  styleConfig = DEFAULT_STYLE_CONFIG,
  showZoomControls = true,
  showLegend = true,
  showLayoutControls = true,
  scenarioSelector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>(layoutMode);
  const [isCytoscapeReady, setIsCytoscapeReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Merge data sources (prefer new GraphData format)
  const graphNodes = useMemo(() => {
    return data?.nodes || legacyNodes || [];
  }, [data, legacyNodes]);

  const graphEdges = useMemo(() => {
    return data?.edges || legacyEdges || [];
  }, [data, legacyEdges]);

  // Generate Cytoscape styles from config
  const getCytoscapeStyles = useCallback(() => {
    const styles: any[] = [
      // Base node style
      {
        selector: 'node',
        style: {
          'background-color': '#94A3B8',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '11px',
          'color': '#fff',
          'text-outline-width': 2,
          'text-outline-color': '#475569',
          'width': 50,
          'height': 50,
          'border-width': 2,
          'border-color': '#CBD5E1',
          'transition-property': 'background-color, border-color, border-width',
          'transition-duration': '0.2s',
        },
      },
    ];

    // Add node type styles
    Object.entries(styleConfig.nodeStyles).forEach(([type, style]) => {
      styles.push({
        selector: `node[type="${type}"]`,
        style: {
          'background-color': style.backgroundColor,
          'shape': style.shape,
          'width': style.width,
          'height': style.height,
          'text-outline-color': style.backgroundColor,
        },
      });
    });

    // Base edge style
    styles.push({
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#CBD5E1',
        'target-arrow-color': '#CBD5E1',
        'target-arrow-shape': 'none',
        'curve-style': 'bezier',
        'opacity': 0.8,
      },
    });

    // Add edge type styles
    Object.entries(styleConfig.edgeStyles).forEach(([type, style]) => {
      styles.push({
        selector: `edge[type="${type}"]`,
        style: {
          'line-color': style.lineColor,
          'target-arrow-color': style.lineColor,
          'target-arrow-shape': style.targetArrowShape,
          'width': style.width,
          'line-style': style.lineStyle,
        },
      });
    });

    // Selection and highlight styles
    styles.push(
      {
        selector: 'node.selected',
        style: {
          'border-width': 4,
          'border-color': '#FBBF24',
          'z-index': 999,
        },
      },
      {
        selector: 'node.highlighted',
        style: {
          'border-width': 3,
          'border-color': '#F59E0B',
          'z-index': 998,
        },
      },
      {
        selector: 'node.preview',
        style: {
          'border-width': 2,
          'border-color': '#60A5FA',
          'opacity': 0.8,
        },
      },
      {
        selector: 'edge.highlighted',
        style: {
          'width': 4,
          'opacity': 1,
          'z-index': 999,
        },
      }
    );

    return styles;
  }, [styleConfig]);


  // Get layout configuration
  const getLayoutConfig = useCallback((mode: LayoutMode) => {
    const basePadding = 80; // Consistent padding to prevent edge clipping
    switch (mode) {
      case 'hierarchy':
        return {
          name: 'breadthfirst',
          directed: true,
          spacingFactor: 1.5,
          animate: true,
          animationDuration: 500,
          roots: '[type="Storey"]',
          padding: basePadding,
          fit: true,
        };
      case 'force':
        return {
          name: 'cose',
          animate: true,
          animationDuration: 500,
          nodeRepulsion: () => 8000,
          idealEdgeLength: () => 100,
          edgeElasticity: () => 100,
          gravity: 0.25,
          numIter: 100,
          padding: basePadding,
          fit: true,
        };
      case 'concentric':
        return {
          name: 'concentric',
          animate: true,
          animationDuration: 500,
          concentric: (node: any) => node.degree(),
          levelWidth: () => 2,
          spacingFactor: 1.5,
          padding: basePadding,
          fit: true,
        };
      case 'grid':
        return {
          name: 'grid',
          animate: true,
          animationDuration: 500,
          spacingFactor: 1.2,
          rows: Math.ceil(Math.sqrt(graphNodes.length)),
          padding: basePadding,
          fit: true,
        };
      default:
        return { name: 'cose', animate: true, padding: basePadding, fit: true };
    }
  }, [graphNodes.length]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: getCytoscapeStyles(),
      layout: { name: 'preset' }, // Start with preset, will run layout after adding elements
      minZoom: 0.15,
      maxZoom: 4,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;
    setIsCytoscapeReady(true);

    // Node click handler
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const nodeId = node.id();
      const nodeData = graphNodes.find(n => n.id === nodeId);
      if (nodeData && onNodeClick) {
        onNodeClick(nodeId, nodeData);
      }
    });

    // Edge click handler
    cy.on('tap', 'edge', (evt: any) => {
      const edge = evt.target;
      const edgeId = edge.id();
      const edgeData = graphEdges.find(e => e.id === edgeId);
      if (edgeData && onEdgeClick) {
        onEdgeClick(edgeId, edgeData);
      }
    });

    // Node hover handlers
    cy.on('mouseover', 'node', (evt: any) => {
      const node = evt.target;
      if (onNodeHover) {
        onNodeHover(node.id());
      }
      // Add hover effect
      node.style('border-width', 3);
    });

    cy.on('mouseout', 'node', (evt: any) => {
      const node = evt.target;
      if (onNodeHover) {
        onNodeHover(null);
      }
      // Remove hover effect (unless selected)
      if (!selectedNodes.has(node.id())) {
        node.style('border-width', 2);
      }
    });

    // Zoom change handler
    cy.on('zoom', () => {
      setZoomLevel(cy.zoom());
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
        setIsCytoscapeReady(false);
      }
    };
  }, []);


  // Update graph data when nodes/edges change
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Convert nodes and edges to Cytoscape format
    const elements = [
      ...graphNodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          ...node.properties,
        },
      })),
      ...graphEdges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          ...edge.properties,
        },
      })),
    ];

    // Update elements
    cy.elements().remove();
    if (elements.length > 0) {
      cy.add(elements);
      cy.layout(getLayoutConfig(currentLayout)).run();
    }
  }, [graphNodes, graphEdges, currentLayout, getLayoutConfig]);

  // Update styles when config changes
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.style(getCytoscapeStyles());
  }, [getCytoscapeStyles]);

  // Apply selection and highlight states
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Reset all classes
    cy.nodes().removeClass('selected highlighted preview');
    cy.edges().removeClass('highlighted');

    // Apply highlighted styles
    highlightedNodes.forEach((style, nodeId) => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        const className = style.intensity === 'preview' ? 'preview' : 
                         style.intensity === 'selected' ? 'selected' : 'highlighted';
        node.addClass(className);
        
        // Also highlight connected edges
        node.connectedEdges().addClass('highlighted');
      }
    });

    // Apply selected styles
    selectedNodes.forEach(nodeId => {
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        node.addClass('selected');
        // Highlight connected edges
        node.connectedEdges().addClass('highlighted');
      }
    });
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
        fit: {
          eles: selectedElements,
          padding: 80,
        },
        duration: 400,
        easing: 'ease-out',
      });
    }
  }, [selectedNodes]);

  // Layout change handler
  const changeLayout = useCallback((mode: LayoutMode) => {
    setCurrentLayout(mode);
    if (cyRef.current) {
      cyRef.current.layout(getLayoutConfig(mode)).run();
    }
  }, [getLayoutConfig]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      const newZoom = Math.min(cyRef.current.zoom() * 1.3, 4);
      cyRef.current.animate({ zoom: newZoom, duration: 200 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      const newZoom = Math.max(cyRef.current.zoom() / 1.3, 0.2);
      cyRef.current.animate({ zoom: newZoom, duration: 200 });
    }
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: { padding: 80 },
        duration: 400,
      });
    }
  }, []);

  const handleCenterSelected = useCallback(() => {
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
        center: { eles: selectedElements },
        zoom: 1.5,
        duration: 400,
      });
    }
  }, [selectedNodes]);


  // Get node type color for legend
  const getNodeTypeColor = (type: NodeType): string => {
    return styleConfig.nodeStyles[type]?.backgroundColor || '#94A3B8';
  };

  // Get edge type info for legend
  const getEdgeTypeInfo = (type: EdgeType) => {
    return styleConfig.edgeStyles[type] || { lineColor: '#CBD5E1', lineStyle: 'solid' };
  };

  // Node types present in current data
  const presentNodeTypes = useMemo(() => {
    const types = new Set(graphNodes.map(n => n.type));
    return Array.from(types) as NodeType[];
  }, [graphNodes]);

  // Edge types present in current data
  const presentEdgeTypes = useMemo(() => {
    const types = new Set(graphEdges.map(e => e.type));
    return Array.from(types) as EdgeType[];
  }, [graphEdges]);

  // Edge type labels (Chinese)
  const edgeTypeLabels: Record<EdgeType, string> = {
    ON_LEVEL: '所属楼层',
    ADJACENT_TO: '相邻',
    CONNECTS_TO: '连通',
    CROSSES: '穿越',
    BELONGS_TO_SYSTEM: '属于系统',
    SERVES: '服务',
    IN_BUILDING: '属于建筑',
    IN_ZONE: '属于区域',
  };

  // Node type labels (Chinese)
  const nodeTypeLabels: Record<NodeType, string> = {
    Space: '空间',
    MEPElement: '构件',
    MEPSystem: '系统',
    Storey: '楼层',
    RouteNode: '路径点',
  };

  return (
    <div className="w-full h-full relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Cytoscape container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Layout controls - moved to top right */}
      {showLayoutControls && paneState !== 'minimized' && (
        <div className="absolute top-14 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 z-10 p-2">
          <div className="text-xs text-slate-500 mb-2 font-medium">布局</div>
          <div className="flex flex-col gap-1">
            {(['hierarchy', 'force', 'concentric', 'grid'] as LayoutMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => changeLayout(mode)}
                className={`px-3 py-1.5 text-xs rounded transition-all ${
                  currentLayout === mode
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode === 'hierarchy' ? '层次' : 
                 mode === 'force' ? '力导向' : 
                 mode === 'concentric' ? '同心圆' : '网格'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zoom controls - moved to bottom center */}
      {showZoomControls && paneState !== 'minimized' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 z-10 flex items-center gap-1 p-1">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="缩小"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-slate-500 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="放大"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
          <button
            onClick={handleFitToScreen}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="适应屏幕"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          {selectedNodes.size > 0 && (
            <button
              onClick={handleCenterSelected}
              className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="居中选中节点"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l-4 4m0 0l-4-4m4 4V3m0 18a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </button>
          )}
        </div>
      )}


      {/* Status badge and scenario selector row */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {/* Left side: scenario selector + status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Scenario selector slot */}
          {scenarioSelector && (
            <div className="flex-shrink-0">
              {scenarioSelector}
            </div>
          )}
          {/* Status badge */}
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              selectedNodes.size > 0 ? 'bg-amber-500' : 'bg-green-500'
            } animate-pulse`} />
            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
              {selectedNodes.size > 0 
                ? `已选 ${selectedNodes.size}` 
                : `${graphNodes.length} 节点 · ${graphEdges.length} 关系`}
            </span>
          </div>
        </div>
      </div>

      {/* Selected node info - moved to left side, below status */}
      {selectedNodes.size > 0 && paneState !== 'minimized' && (
        <div className="absolute top-14 left-4 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-md border border-slate-200 z-10 max-w-[160px] max-h-32 overflow-y-auto">
          <div className="text-xs text-slate-500 mb-1 font-medium">选中节点</div>
          <div className="space-y-0.5">
            {Array.from(selectedNodes).slice(0, 4).map(id => {
              const node = graphNodes.find((n: GraphNode) => n.id === id);
              return node ? (
                <div key={id} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getNodeTypeColor(node.type) }}
                  />
                  <span className="font-medium text-slate-700 truncate text-[11px]">{node.label}</span>
                </div>
              ) : null;
            })}
            {selectedNodes.size > 4 && (
              <div className="text-[10px] text-slate-400">
                +{selectedNodes.size - 4} 更多
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover preview - positioned below selected nodes or status */}
      {hoveredNode && !selectedNodes.has(hoveredNode) && paneState !== 'minimized' && (
        <div className={`absolute ${selectedNodes.size > 0 ? 'top-48' : 'top-14'} left-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-slate-200 z-10`}>
          <div className="flex items-center gap-1.5 text-xs">
            {(() => {
              const node = graphNodes.find((n: GraphNode) => n.id === hoveredNode);
              if (!node) return <span className="text-slate-500 text-[11px]">{hoveredNode}</span>;
              return (
                <>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getNodeTypeColor(node.type) }}
                  />
                  <span className="font-medium text-slate-700 text-[11px]">{node.label}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Legend - compact version at bottom right */}
      {showLegend && paneState !== 'minimized' && (
        <div className="absolute bottom-14 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 z-10 p-2 min-w-[120px]">
          {/* Node types - filter out MEPElement (构件) */}
          <div className="text-[10px] text-slate-500 mb-1.5 font-medium">节点</div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 mb-2">
            {presentNodeTypes
              .filter(type => type !== 'MEPElement')
              .map(type => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getNodeTypeColor(type) }}
                />
                <span className="text-[10px] text-slate-600 whitespace-nowrap">{nodeTypeLabels[type]}</span>
              </div>
            ))}
          </div>
          
          {/* Edge types */}
          {presentEdgeTypes.length > 0 && (
            <>
              <div className="text-[10px] text-slate-500 mb-1.5 font-medium">关系</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {presentEdgeTypes.slice(0, 4).map(type => {
                  const info = getEdgeTypeInfo(type);
                  return (
                    <div key={type} className="flex items-center gap-1">
                      <div 
                        className="w-3 flex-shrink-0"
                        style={{ 
                          height: 2,
                          backgroundColor: info.lineColor,
                          borderStyle: info.lineStyle === 'dashed' ? 'dashed' : 'solid',
                        }}
                      />
                      <span className="text-[10px] text-slate-600 whitespace-nowrap">{edgeTypeLabels[type]}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Minimized state indicator */}
      {paneState === 'minimized' && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-white text-sm font-medium">图谱已最小化</div>
        </div>
      )}

      {/* No data state */}
      {graphNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-slate-400 text-lg mb-2">暂无图数据</div>
            <div className="text-slate-300 text-sm">请加载数据场景</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isCytoscapeReady && graphNodes.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center p-6">
            <div className="text-slate-600 text-lg mb-2">正在加载图谱...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
