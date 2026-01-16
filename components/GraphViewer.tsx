import React, { useRef, useEffect, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import { HighlightStyle, PaneState } from '../types';

cytoscape.use(cola);
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
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PASSES_THROUGH' | 'CONNECTED_TO' | 'PART_OF_SYSTEM';
}

export interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: PaneState;
  layoutMode?: 'hierarchy' | 'force' | 'circular';
}

const NODE_COLORS = {
  Project: '#4a90e2',
  Level: '#50e3c2',
  Space: '#4a90e2',
  Element: '#50e3c2',
  System: '#e25050',
  Pipe: '#9b59b6',
  Duct: '#f39c12',
};

const HIGHLIGHT_COLORS = {
  selected: '#00ff00',
  preview: '#ffff00',
  result: '#00ffff',
};

const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes,
  edges,
  selectedNodes,
  highlightedNodes,
  hoveredNode,
  onNodeClick,
  onNodeHover,
  paneState,
  layoutMode = 'hierarchy',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cytoscape
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const cy = cytoscape({
      container: containerRef.current,

      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4a90e2',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#ffffff',
            'font-size': 12,
            'font-weight': 'bold',
            'width': 'label',
            'height': 'label',
            'padding': 10,
            'border-width': 2,
            'border-color': '#ffffff',
            'text-outline-width': 1,
            'text-outline-color': '#4a90e2',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#999999',
            'target-arrow-color': '#999999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(type)',
            'font-size': 10,
            'color': '#666666',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-padding': 2,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#00ff00',
            'border-color': '#000000',
            'border-width': 3,
            'z-index': 1000,
          },
        },
        {
          selector: 'node:selected.successor-node',
          style: {
            'background-color': '#ffff00',
            'opacity': 0.7,
          },
        },
        {
          selector: '.preview',
          style: {
            'background-color': '#ffff00',
            'border-color': '#000000',
            'border-width': 3,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#00ffff',
            'border-color': '#000000',
            'border-width': 2,
          },
        },
        {
          selector: 'node[type = "System"]',
          style: {
            'background-color': '#e25050',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "Space"]',
          style: {
            'background-color': '#4a90e2',
            'shape': 'roundrectangle',
          },
        },
        {
          selector: 'node[type = "Element"]',
          style: {
            'background-color': '#50e3c2',
            'shape': 'ellipse',
          },
        },
      ],

      layout: {
        name: layoutMode === 'hierarchy' ? 'dagre' : layoutMode === 'force' ? 'cola' : 'circle',
        padding: 10,
        rankDir: 'TB',
        edgeLength: 150,
      },
    });

    cyRef.current = cy;
    setIsInitialized(true);

    // Event listeners
    cy.on('tap', 'node', (event) => {
      if (paneState === 'minimized') return;
      const node = event.target;
      const nodeId = node.id();
      onNodeClick(nodeId);

      // Center and zoom to the node
      cy.animate({
        center: {
          eles: node,
        },
        zoom: cy.zoom() * 1.5,
        duration: 500,
      });
    });

    cy.on('mouseover', 'node', (event) => {
      if (paneState === 'minimized') return;
      const node = event.target;
      onNodeHover(node.id());
      node.addClass('preview');
    });

    cy.on('mouseout', 'node', (event) => {
      if (paneState === 'minimized') return;
      const node = event.target;
      onNodeHover(null);
      node.removeClass('preview');
    });

    cy.on('tap', (event) => {
      if (event.target === cy) {
        onNodeClick('');
      }
    });

    return () => {
      cy.destroy();
    };
  }, [isInitialized]);

  // Update graph data
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const currentNodeIds = new Set(cy.nodes().map((n) => n.id()));
    const newNodeIds = new Set(nodes.map((n) => n.id()));

    // Remove old nodes
    const nodesToRemove = Array.from(currentNodeIds).filter((id) => !newNodeIds.has(id));
    if (nodesToRemove.length > 0) {
      cy.remove(cy.nodes(nodesToRemove));
    }

    // Add or update nodes
    nodes.forEach((node) => {
      const existingNode = cy.$id(node.id);
      const data = {
        id: node.id,
        label: node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label,
        type: node.type,
        properties: node.properties,
      };

      if (existingNode.length > 0) {
        existingNode.data(data);
      } else {
        cy.add({
          group: 'nodes',
          data,
        });
      }
    });

    // Update edges
    const currentEdgeIds = new Set(cy.edges().map((e) => e.id()));
    const newEdgeIds = new Set(edges.map((e) => e.id));

    // Remove old edges
    const edgesToRemove = Array.from(currentEdgeIds).filter((id) => !newEdgeIds.has(id));
    if (edgesToRemove.length > 0) {
      cy.remove(cy.edges(edgesToRemove));
    }

    // Add or update edges
    edges.forEach((edge) => {
      const existingEdge = cy.$id(edge.id);
      const data = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      };

      if (existingEdge.length > 0) {
        existingEdge.data(data);
      } else {
        cy.add({
          group: 'edges',
          data,
        });
      }
    });

    // Run layout
    cy.layout({
      name: layoutMode === 'hierarchy' ? 'dagre' : layoutMode === 'force' ? 'cola' : 'circle',
      padding: 10,
      rankDir: 'TB',
      edgeLength: 150,
    }).run();
  }, [nodes, edges, layoutMode]);

  // Update node styles based on selection and highlights
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Clear all selections and highlights
    cy.nodes().removeClass('selected preview highlighted');
    cy.nodes().selectify(false);

    // Apply selected state
    selectedNodes.forEach((nodeId) => {
      const node = cy.$id(nodeId);
      if (node.length > 0) {
        node.selectify(true);
        node.addClass('selected');

        // Highlight connected nodes
        const connectedNodes = node.neighborhood();
        connectedNodes.addClass('successor-node');
      }
    });

    // Apply hover preview
    if (hoveredNode) {
      const node = cy.$id(hoveredNode);
      if (node.length > 0) {
        node.addClass('preview');
      }
    }

    // Apply highlights
    highlightedNodes.forEach((style, nodeId) => {
      const node = cy.$id(nodeId);
      if (node.length > 0 && !selectedNodes.has(nodeId)) {
        node.addClass('highlighted');
        node.style('background-color', HIGHLIGHT_COLORS[style.intensity] || NODE_COLORS[style.category]);
      }
    });
  }, [selectedNodes, highlightedNodes, hoveredNode]);

  // Center and zoom when node is selected
  useEffect(() => {
    if (!cyRef.current || selectedNodes.size === 0) return;

    const cy = cyRef.current;
    const selectedNodeIds = Array.from(selectedNodes);
    const selectedNodes = cy.nodes(selectedNodeIds);

    if (selectedNodes.length > 0) {
      cy.animate({
        center: {
          eles: selectedNodes,
        },
        zoom: Math.max(cy.zoom(), 1),
        duration: 500,
      });
    }
  }, [selectedNodes]);

  // Handle pane state changes
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    if (paneState === 'maximized') {
      cy.resize();
      cy.fit();
    }
  }, [paneState]);

  // Render minimized state
  if (paneState === 'minimized') {
    return (
      <div className="w-full h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs font-semibold">Graph Viewer (Minimized)</span>
        </div>
      </div>
    );
  }

  // Render normal or maximized state
  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative ${
        paneState === 'maximized' ? 'absolute inset-0 z-20' : ''
      }`}
      style={{ cursor: 'grab' }}
    >
      {/* Overlay Badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-xs font-semibold text-slate-700">Knowledge Graph</span>
      </div>

      {/* Layout Mode Indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10">
        <span className="text-xs font-semibold text-slate-600 capitalize">{layoutMode} layout</span>
      </div>

      {/* Selected Node Info */}
      {selectedNodes.size > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-slate-200 z-10">
          <div className="text-xs text-slate-500 mb-1">Selected Nodes</div>
          <div className="text-sm font-semibold text-slate-800">
            {Array.from(selectedNodes).join(', ')}
          </div>
        </div>
      )}

      {/* Graph Stats */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 z-10">
        <div className="text-xs text-slate-600">
          <span className="font-semibold">Nodes:</span> {nodes.length} | 
          <span className="font-semibold"> Edges:</span> {edges.length}
        </div>
      </div>
    </div>
  );
};

export default GraphViewer;
