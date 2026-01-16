import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';

cytoscape.use(cola);
cytoscape.use(dagre);

export interface NodeData {
  id: string;
  label: string;
  category: 'space' | 'element' | 'system';
  parentId?: string;
  [key: string]: unknown;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  relationship: string;
  [key: string]: unknown;
}

export interface GraphViewerProps {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNodeId?: string;
  highlightedNodeIds?: string[];
  layoutMode: 'hierarchical' | 'force-directed' | 'circular';
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onLayoutChange?: (mode: 'hierarchical' | 'force-directed' | 'circular') => void;
  panelState: { isMaximized: boolean; isMinimized: boolean };
}

const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds = [],
  layoutMode,
  onNodeClick,
  onNodeHover,
  onLayoutChange,
  panelState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#5b9bd5',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'font-size': 12,
            'width': 60,
            'height': 60,
            'border-width': 2,
            'border-color': '#fff',
            'overlay-padding': 10,
            'grabbable': true,
            'selectable': true,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#ffc000',
            'border-width': 4,
            'border-color': '#ff6600',
            'width': 70,
            'height': 70,
            'z-index': 9999,
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#70ad47',
            'border-width': 3,
            'border-color': '#2f5597',
            'width': 65,
            'height': 65,
          },
        },
        {
          selector: 'node.hovered',
          style: {
            'background-color': '#4472c4',
            'border-width': 3,
            'border-color': '#fff',
            'width': 68,
            'height': 68,
            'opacity': 0.9,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.7,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 4,
            'line-color': '#70ad47',
            'target-arrow-color': '#70ad47',
            'opacity': 1,
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 5,
            'line-color': '#ffc000',
            'target-arrow-color': '#ffc000',
            'opacity': 1,
          },
        },
      ],
      elements: {
        nodes: [],
        edges: [],
      },
    });

    const cy = cyRef.current;

    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeId = node.id();
      onNodeClick?.(nodeId);
      
      // 禁用自动缩放，改为仅在点击时选择节点
      // cy.fit(node, 50);
    });

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      const nodeId = node.id();
      node.addClass('hovered');
      onNodeHover?.(nodeId);
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      node.removeClass('hovered');
      onNodeHover?.(null);
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick, onNodeHover]);

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.remove(cy.elements());

    const filteredNodes = nodes.filter(node => {
      if (expandedNodeIds.size === 0) {
        return true;
      }
      if (expandedNodeIds.has(node.id)) {
        return true;
      }
      if (node.parentId && expandedNodeIds.has(node.parentId)) {
        return true;
      }
      return false;
    });

    cy.add({
      nodes: filteredNodes.map(node => ({
        data: { ...node },
      })),
      edges: edges.map(edge => ({
        data: { ...edge },
      })),
    });

    const layoutConfig = {
      hierarchical: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 50,
      },
      'force-directed': {
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 1500,
        ungrabifyWhileSimulating: false,
        fit: true,
        padding: 50,
      },
      circular: {
        name: 'circle',
        radius: 200,
        startAngle: 3 / 2 * Math.PI,
        sweep: Math.PI * 2,
      },
    }[layoutMode];

    cy.layout(layoutConfig).run();
  }, [nodes, edges, expandedNodeIds, layoutMode]);

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.nodes().removeClass('highlighted');
    cy.edges().removeClass('highlighted');

    highlightedNodeIds.forEach(nodeId => {
      cy.getElementById(nodeId).addClass('highlighted');
      
      cy.getElementById(nodeId).connectedEdges().addClass('highlighted');
    });
  }, [highlightedNodeIds]);

  useEffect(() => {
    if (!cyRef.current || !selectedNodeId) return;

    const cy = cyRef.current;
    const selectedNode = cy.getElementById(selectedNodeId);
    
    if (selectedNode.length > 0) {
      cy.nodes().unselect();
      selectedNode.select();
      
      cy.animate({
        fit: {
          eles: selectedNode,
          padding: 50,
        },
        duration: 500,
      });
    }
  }, [selectedNodeId]);

  const handleNodeExpand = (nodeId: string) => {
    setExpandedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const layouts = [
    { mode: 'hierarchical' as const, label: '层次布局', icon: '📊' },
    { mode: 'force-directed' as const, label: '力导向', icon: '⚡' },
    { mode: 'circular' as const, label: '圆形布局', icon: '⭕' },
  ];

  if (panelState.isMinimized) {
    return null;
  }

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: panelState.isMaximized ? 'block' : 'block',
      }}
    >
      <div 
        ref={containerRef} 
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* 布局切换工具栏 */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: 4,
        zIndex: 1000,
      }}>
        {layouts.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => onLayoutChange?.(mode)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: mode === layoutMode ? '2px solid #5b9bd5' : '1px solid #ddd',
              backgroundColor: mode === layoutMode ? '#5b9bd5' : 'white',
              color: mode === layoutMode ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: mode === layoutMode ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (mode !== layoutMode) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== layoutMode) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GraphViewer;
