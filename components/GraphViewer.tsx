import React, { useRef, useEffect, useCallback, useState } from 'react';
import { PaneState, HighlightStyle } from '../types';
import { useLanguage } from '../contexts/LanguageProvider';

// Graph data types
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

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: PaneState;
  layoutMode?: LayoutMode;
}

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
  const cyRef = useRef<any>(null); // Cytoscape instance
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>(layoutMode);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if Cytoscape is available
    if (typeof window !== 'undefined' && (window as any).cytoscape) {
      const cy = (window as any).cytoscape({
        container: containerRef.current,
        style: getCytoscapeStyles(),
        layout: getLayoutConfig(currentLayout),
        minZoom: 0.5,
        maxZoom: 3,
        wheelSensitivity: 0.2,
      });

      cyRef.current = cy;

      // Add event listeners
      cy.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        handleNodeClick(node.id());
      });

      cy.on('mouseover', 'node', (evt: any) => {
        const node = evt.target;
        handleNodeHover(node.id());
      });

      cy.on('mouseout', 'node', () => {
        handleNodeHover(null);
      });

      return () => {
        if (cyRef.current) {
          cyRef.current.destroy();
        }
      };
    } else {
      console.warn('Cytoscape.js not loaded. Please include the library.');
    }
  }, []);

  // Update graph data
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Convert nodes and edges to Cytoscape format
    const elements = [
      ...nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          ...node.properties,
        },
      })),
      ...edges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      })),
    ];

    cy.elements().remove();
    cy.add(elements);
    cy.layout(getLayoutConfig(currentLayout)).run();
  }, [nodes, edges, currentLayout]);

  // Apply highlights
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Reset all node styles
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
      // Center and zoom to selected nodes
      cy.animate({
        fit: {
          eles: selectedElements,
          padding: 50,
        },
        duration: 500,
        easing: 'ease-in-out',
      });

      // Expand nodes to show 1-degree relationships
      selectedElements.forEach((node: any) => {
        expandNode(node.id());
      });
    }
  }, [selectedNodes]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick(nodeId);
  }, [onNodeClick]);

  // Handle node hover
  const handleNodeHover = useCallback((nodeId: string | null) => {
    onNodeHover(nodeId);
  }, [onNodeHover]);

  // Expand node to show 1-degree relationships
  const expandNode = (nodeId: string) => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const node = cy.getElementById(nodeId);

    if (node.length > 0) {
      // Show connected nodes
      const neighbors = node.neighborhood();
      neighbors.style('display', 'element');

      setExpandedNodes(prev => new Set(prev).add(nodeId));
    }
  };

  // Change layout mode
  const changeLayout = (mode: LayoutMode) => {
    setCurrentLayout(mode);
    if (cyRef.current) {
      cyRef.current.layout(getLayoutConfig(mode)).run();
    }
  };

  // Get Cytoscape layout configuration
  const getLayoutConfig = (mode: LayoutMode) => {
    switch (mode) {
      case 'hierarchy':
        return {
          name: 'breadthfirst',
          directed: true,
          spacingFactor: 1.5,
          animate: true,
          animationDuration: 500,
        };
      case 'force':
        return {
          name: 'cose',
          animate: true,
          animationDuration: 500,
          nodeRepulsion: 8000,
          idealEdgeLength: 100,
        };
      case 'circular':
        return {
          name: 'circle',
          animate: true,
          animationDuration: 500,
          spacingFactor: 1.5,
        };
      default:
        return { name: 'breadthfirst' };
    }
  };

  // Get Cytoscape styles
  const getCytoscapeStyles = () => [
    {
      selector: 'node',
      style: {
        'background-color': '#94A3B8',
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        'color': '#1E293B',
        'width': '40px',
        'height': '40px',
        'border-width': '2px',
        'border-color': '#CBD5E1',
      },
    },
    {
      selector: 'node[type="Project"]',
      style: {
        'background-color': '#8B5CF6',
        'shape': 'diamond',
      },
    },
    {
      selector: 'node[type="Level"]',
      style: {
        'background-color': '#3B82F6',
        'shape': 'rectangle',
      },
    },
    {
      selector: 'node[type="Space"]',
      style: {
        'background-color': '#10B981',
        'shape': 'roundrectangle',
      },
    },
    {
      selector: 'node[type="Element"]',
      style: {
        'background-color': '#F59E0B',
        'shape': 'ellipse',
      },
    },
    {
      selector: 'node[type="System"]',
      style: {
        'background-color': '#EF4444',
        'shape': 'hexagon',
      },
    },
    {
      selector: 'node.selected',
      style: {
        'border-width': '4px',
        'border-color': '#3B82F6',
        'z-index': 999,
      },
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': '3px',
        'border-color': '#F59E0B',
      },
    },
    {
      selector: 'node.preview',
      style: {
        'border-width': '2px',
        'border-color': '#60A5FA',
        'opacity': 0.7,
      },
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
      selector: 'edge[type="HAS_LEVEL"]',
      style: {
        'line-color': '#3B82F6',
        'target-arrow-color': '#3B82F6',
      },
    },
    {
      selector: 'edge[type="CONTAINS"]',
      style: {
        'line-color': '#10B981',
        'target-arrow-color': '#10B981',
      },
    },
    {
      selector: 'edge[type="HAS_ELEMENT"]',
      style: {
        'line-color': '#F59E0B',
        'target-arrow-color': '#F59E0B',
      },
    },
  ];

  // Get node type color
  const getNodeTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      Project: '#8B5CF6',
      Level: '#3B82F6',
      Space: '#10B981',
      Element: '#F59E0B',
      System: '#EF4444',
      Pipe: '#06B6D4',
      Duct: '#EC4899',
    };
    return colors[type] || '#94A3B8';
  };

  return (
    <div className="w-full h-full relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Cytoscape container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Layout controls */}
      {paneState !== 'minimized' && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 z-10 p-2">
          <div className="text-xs text-slate-600 mb-2 font-semibold">{t('graphViewer.layout')}</div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => changeLayout('hierarchy')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentLayout === 'hierarchy'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('graphViewer.hierarchy')}
            </button>
            <button
              onClick={() => changeLayout('force')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentLayout === 'force'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('graphViewer.force')}
            </button>
            <button
              onClick={() => changeLayout('circular')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                currentLayout === 'circular'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('graphViewer.circular')}
            </button>
          </div>
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${selectedNodes.size > 0 ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
        <span className="text-xs font-semibold text-slate-700">
          {selectedNodes.size > 0 ? `${selectedNodes.size} ${t('graphViewer.selected')}` : `${nodes.length} ${t('graphViewer.nodes')}`}
        </span>
      </div>

      {/* Node info */}
      {selectedNodes.size > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-slate-200 z-10 max-w-xs">
          <div className="text-xs text-slate-600">
            {Array.from(selectedNodes).map(id => {
              const node = nodes.find(n => n.id === id);
              return node ? (
                <div key={id} className="mb-1 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getNodeTypeColor(node.type) }}
                  />
                  <span className="font-semibold">{node.label}</span>
                  <span className="text-slate-400">{node.type}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Hover preview */}
      {hoveredNode && !selectedNodes.has(hoveredNode) && (
        <div className="absolute top-16 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 z-10">
          <div className="text-xs text-slate-600">
            {nodes.find(n => n.id === hoveredNode)?.label || hoveredNode}
          </div>
        </div>
      )}

      {/* Legend */}
      {paneState !== 'minimized' && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 z-10 p-2">
          <div className="text-xs text-slate-600 mb-2 font-semibold">{t('graphViewer.nodeTypes')}</div>
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
      )}

      {/* Minimized state indicator */}
      {paneState === 'minimized' && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-white text-sm">{t('graphViewer.minimized')}</div>
        </div>
      )}

      {/* No Cytoscape warning */}
      {typeof window !== 'undefined' && !(window as any).cytoscape && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center p-6">
            <div className="text-slate-600 text-lg mb-2">{t('graphViewer.notLoaded')}</div>
            <div className="text-slate-400 text-sm">
              {t('graphViewer.installMessage')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
