import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
import { PaneState, HighlightStyle } from '../types';

cytoscape.use(coseBilkent);
cytoscape.use(dagre);

export interface GraphNode {
  id: string;
  label: string;
  type: 'Project' | 'Level' | 'Space' | 'Element' | 'System' | 'Pipe' | 'Duct';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PASSES_THROUGH' | 'CONNECTED_TO';
}

export type LayoutMode = 'hierarchy' | 'force' | 'circular';

export interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: PaneState;
  layoutMode: LayoutMode;
  onLayoutChange?: (mode: LayoutMode) => void;
}

const TYPE_COLORS: Record<GraphNode['type'], string> = {
  Project: '#3B82F6',
  Level: '#10B981',
  Space: '#F59E0B',
  Element: '#EF4444',
  System: '#8B5CF6',
  Pipe: '#EC4899',
  Duct: '#06B6D4'
};

const TYPE_ICONS: Record<GraphNode['type'], string> = {
  Project: '🏗️',
  Level: '📊',
  Space: '🏠',
  Element: '🧱',
  System: '⚙️',
  Pipe: '🔵',
  Duct: '🔶'
};

export const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes,
  edges,
  selectedNodes,
  highlightedNodes,
  hoveredNode,
  onNodeClick,
  onNodeHover,
  paneState,
  layoutMode,
  onLayoutChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const getLayoutConfig = useCallback((mode: LayoutMode): cytoscape.LayoutOptions => {
    switch (mode) {
      case 'hierarchy':
        return {
          name: 'dagre'
        } as cytoscape.LayoutOptions;
      case 'force':
        return {
          name: 'cose-bilkent'
        } as cytoscape.LayoutOptions;
      case 'circular':
        return {
          name: 'circle'
        } as cytoscape.LayoutOptions;
      default:
        return { name: 'preset' };
    }
  }, []);

  const applyStyles = useCallback(() => {
    if (!cyRef.current) return;

    cyRef.current.style()
      .selector('node')
      .style({
        'background-color': (node) => {
          const nodeData = node.data() as GraphNode;
          return TYPE_COLORS[nodeData.type];
        },
        'label': (node) => {
          const nodeData = node.data() as GraphNode;
          return `${TYPE_ICONS[nodeData.type]} ${nodeData.label}`;
        },
        'width': 60,
        'height': 60,
        'font-size': 10,
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': 80,
        'border-width': 2,
        'border-color': '#333',
        'background-opacity': 1
      })
      .selector('edge')
      .style({
        'width': 2,
        'line-color': '#94A3B8',
        'target-arrow-color': '#94A3B8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      })
      .selector('.selected')
      .style({
        'border-width': 4,
        'border-color': '#FFFFFF',
        'background-color': '#FFFFFF',
        'width': 70,
        'height': 70,
        'z-index': 1000
      })
      .selector('.highlighted')
      .style({
        'border-width': 4,
        'border-color': '#FBBF24',
        'width': 65,
        'height': 65,
        'z-index': 500
      })
      .selector('.hovered')
      .style({
        'background-opacity': 0.7,
        'z-index': 800
      })
      .selector('.hidden')
      .style({
        'display': 'none'
      })
      .update();
  }, []);

  const updateSelection = useCallback(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('selected');
    selectedNodes.forEach((nodeId) => {
      const node = cyRef.current?.nodes(`#${nodeId}`);
      if (node && node.length > 0) {
        node.addClass('selected');
      }
    });
  }, [selectedNodes]);

  const updateHighlights = useCallback(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('highlighted');
    highlightedNodes.forEach((style, nodeId) => {
      const node = cyRef.current?.nodes(`#${nodeId}`);
      if (node && node.length > 0) {
        node.addClass('highlighted');
        if (style.intensity === 'preview') {
          node.style('background-opacity', 0.5);
        }
      }
    });
  }, [highlightedNodes]);

  const updateHover = useCallback(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('hovered');
    if (hoveredNode) {
      const node = cyRef.current.nodes(`#${hoveredNode}`);
      if (node && node.length > 0) {
        node.addClass('hovered');
      }
    }
  }, [hoveredNode]);

  const updateVisibility = useCallback(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('hidden');
    cyRef.current.edges().removeClass('hidden');

    if (expandedNodes.size === 0) {
      return;
    }

    const visibleNodes = new Set<string>();
    expandedNodes.forEach((nodeId) => {
      visibleNodes.add(nodeId);
      const node = cyRef.current?.nodes(`#${nodeId}`);
      if (node && node.length > 0) {
        node.neighborhood().nodes().forEach((neighbor) => {
          visibleNodes.add(neighbor.id());
        });
      }
    });

    cyRef.current.nodes().forEach((node) => {
      if (!visibleNodes.has(node.id())) {
        node.addClass('hidden');
      }
    });

    cyRef.current.edges().forEach((edge) => {
      const source = edge.source().id();
      const target = edge.target().id();
      if (!visibleNodes.has(source) || !visibleNodes.has(target)) {
        edge.addClass('hidden');
      }
    });
  }, [expandedNodes]);

  const centerOnNode = useCallback((nodeId: string) => {
    if (!cyRef.current) return;

    const node = cyRef.current.nodes(`#${nodeId}`);
    if (node && node.length > 0) {
      cyRef.current.animate({
        fit: {
          elements: node,
          padding: 50
        },
        duration: 500
      });
    }
  }, []);

  const expandNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: nodes.map((node) => ({
          data: { ...node, id: node.id }
        })),
        edges: edges.map((edge) => ({
          data: { ...edge, id: edge.id, source: edge.source, target: edge.target }
        }))
      },
      layout: getLayoutConfig(layoutMode),
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3B82F6',
            'label': 'data(label)',
            'width': 60,
            'height': 60,
            'font-size': 10,
            'text-valign': 'center',
            'text-halign': 'center',
            'border-width': 2,
            'border-color': '#333'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94A3B8',
            'target-arrow-color': '#94A3B8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      wheelSensitivity: 0.1,
      minZoom: 0.1,
      maxZoom: 4
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      onNodeClick(nodeId);
      centerOnNode(nodeId);
      expandNode(nodeId);
    });

    cy.on('mouseover', 'node', (event) => {
      const nodeId = event.target.id();
      onNodeHover(nodeId);
    });

    cy.on('mouseout', 'node', () => {
      onNodeHover(null);
    });

    cy.on('tap', () => {
      const target = cy.$(':selected');
      if (target.length === 0) {
      }
    });

    applyStyles();
    updateSelection();
    updateHighlights();
    updateHover();
    updateVisibility();

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, layoutMode]);

  useEffect(() => {
    if (cyRef.current) {
      applyStyles();
    }
  }, [applyStyles]);

  useEffect(() => {
    updateSelection();
  }, [updateSelection]);

  useEffect(() => {
    updateHighlights();
  }, [updateHighlights]);

  useEffect(() => {
    updateHover();
  }, [updateHover]);

  useEffect(() => {
    updateVisibility();
  }, [updateVisibility]);

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout(getLayoutConfig(layoutMode)).run();
    }
  }, [layoutMode, getLayoutConfig]);

  if (paneState === 'minimized') {
    return (
      <div className="h-16 bg-slate-800 flex items-center justify-center border-t border-slate-700">
        <span className="text-slate-400 text-sm">📊 Graph Viewer (Minimized)</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute top-2 right-2 bg-slate-800/90 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-xs text-slate-400 mb-1">Layout Mode</div>
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 text-xs rounded transition-colors ${
              layoutMode === 'hierarchy'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => onLayoutChange?.('hierarchy')}
            title="Hierarchy Layout"
          >
            📊
          </button>
          <button
            className={`px-2 py-1 text-xs rounded transition-colors ${
              layoutMode === 'force'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => onLayoutChange?.('force')}
            title="Force-Directed Layout"
          >
            ⚡
          </button>
          <button
            className={`px-2 py-1 text-xs rounded transition-colors ${
              layoutMode === 'circular'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => onLayoutChange?.('circular')}
            title="Circular Layout"
          >
            🔵
          </button>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 bg-slate-800/90 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-xs text-slate-400">
          Nodes: {nodes.length} | Edges: {edges.length}
        </div>
      </div>
    </div>
  );
};

export default GraphViewer;
