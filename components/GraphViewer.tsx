import React, { useRef, useEffect, useState, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, LayoutOptions } from 'cytoscape';
import { useLayoutState } from '../contexts/LayoutStateProvider';
import { HighlightStyle, PaneState } from '../types';

export type GraphNodeType = 'Project' | 'Level' | 'Space' | 'Element' | 'System' | 'Pipe' | 'Duct' | 'Cable';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  properties: Record<string, any>;
  spaceId?: string;
  systemId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PART_OF_SYSTEM' | 'PASSES_THROUGH' | 'CONNECTED_TO' | 'LOCATED_AT';
}

export type LayoutMode = 'hierarchy' | 'force' | 'circular';

interface GraphViewerProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  paneState?: PaneState;
  layoutMode?: LayoutMode;
  onLayoutModeChange?: (mode: LayoutMode) => void;
}

const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes = [],
  edges = [],
  paneState = 'normal',
  layoutMode = 'force',
  onLayoutModeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [localLayoutMode, setLocalLayoutMode] = useState<LayoutMode>(layoutMode);
  
  const {
    selectedElements,
    highlightedElements,
    hoveredElement,
    selectElement,
    setHoveredElement,
    clearHighlights
  } = useLayoutState();

  const generateMockData = useCallback(() => {
    const mockNodes: GraphNode[] = [
      { id: 'project-1', label: 'Building A', type: 'Project', properties: { name: 'Building A' } },
      { id: 'level-1', label: 'Level 1', type: 'Level', properties: { floor: 1 } },
      { id: 'level-2', label: 'Level 2', type: 'Level', properties: { floor: 2 } },
      { id: 'space-1', label: 'Office 101', type: 'Space', properties: { area: '50 sqm' } },
      { id: 'space-2', label: 'Office 102', type: 'Space', properties: { area: '45 sqm' } },
      { id: 'space-3', label: 'Meeting Room', type: 'Space', properties: { area: '30 sqm' } },
      { id: 'element-1', label: 'Wall 1', type: 'Element', properties: { material: 'Concrete' } },
      { id: 'element-2', label: 'Door 1', type: 'Element', properties: { material: 'Wood' } },
      { id: 'system-1', label: 'HVAC System', type: 'System', properties: { type: 'Heating' } },
      { id: 'pipe-1', label: 'Pipe 1', type: 'Pipe', properties: { diameter: '50mm' } },
    ];

    const mockEdges: GraphEdge[] = [
      { id: 'e1', source: 'project-1', target: 'level-1', type: 'HAS_LEVEL' },
      { id: 'e2', source: 'project-1', target: 'level-2', type: 'HAS_LEVEL' },
      { id: 'e3', source: 'level-1', target: 'space-1', type: 'CONTAINS' },
      { id: 'e4', source: 'level-1', target: 'space-2', type: 'CONTAINS' },
      { id: 'e5', source: 'level-2', target: 'space-3', type: 'CONTAINS' },
      { id: 'e6', source: 'space-1', target: 'element-1', type: 'HAS_ELEMENT' },
      { id: 'e7', source: 'space-1', target: 'element-2', type: 'HAS_ELEMENT' },
      { id: 'e8', source: 'element-1', target: 'system-1', type: 'PART_OF_SYSTEM' },
      { id: 'e9', source: 'pipe-1', target: 'space-1', type: 'PASSES_THROUGH' },
      { id: 'e10', source: 'pipe-1', target: 'system-1', type: 'PART_OF_SYSTEM' },
    ];

    return { mockNodes, mockEdges };
  }, []);

  const { mockNodes, mockEdges } = generateMockData();

  const displayNodes = nodes.length > 0 ? nodes : mockNodes;
  const displayEdges = edges.length > 0 ? edges : mockEdges;

  const getNodeTypeColor = useCallback((type: GraphNodeType): string => {
    const colorMap: Record<GraphNodeType, string> = {
      Project: '#6366f1',
      Level: '#8b5cf6',
      Space: '#3b82f6',
      Element: '#10b981',
      System: '#f59e0b',
      Pipe: '#ef4444',
      Duct: '#f97316',
      Cable: '#06b6d4',
    };
    return colorMap[type] || '#6b7280';
  }, []);

  const getLayoutOptions = useCallback((): LayoutOptions => {
    const mode = onLayoutModeChange ? layoutMode : localLayoutMode;
    
    switch (mode) {
      case 'hierarchy':
        return {
          name: 'breadthfirst',
          directed: true,
          spacingFactor: 1.5,
          animate: false,
        };
      case 'circular':
        return {
          name: 'circle',
          fit: true,
          padding: 30,
          animate: false,
        };
      case 'force':
      default:
        return {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
          animate: false,
          refresh: 0,
          refreshIterations: 0,
        };
    }
  }, [layoutMode, localLayoutMode, onLayoutModeChange]);

  const initializeCytoscape = useCallback(() => {
    if (!containerRef.current) return null;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
      console.warn('GraphViewer: Container has zero dimensions, delaying initialization');
      return null;
    }

    console.log('GraphViewer: Initializing Cytoscape with container size:', rect.width, 'x', rect.height);

    const cy = cytoscape({
      container: container,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: NodeSingular) => getNodeTypeColor(ele.data('type') as GraphNodeType),
            'label': 'data(label)',
            'font-size': '8px',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#ffffff',
            'text-outline-color': '#000000',
            'text-outline-width': '2px',
            'width': '55px',
            'height': '55px',
            'border-width': '2px',
            'border-color': '#ffffff',
            'transition-property': 'background-color',
            'transition-duration': '0.2s',
            'text-max-width': '50px',
            'text-wrap': 'wrap',
            'text-background-color': 'rgba(0,0,0,0.5)',
            'text-background-padding': '2px',
            'text-background-opacity': '0.9',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#fbbf24',
          },
        },
        {
          selector: 'node.neighbor',
          style: {
            'border-width': '3px',
            'border-color': '#22c55e',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': '2px',
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': '0.6',
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': '3px',
            'line-color': '#22c55e',
            'target-arrow-color': '#22c55e',
            'opacity': '1',
          },
        },
      ],
      layout: getLayoutOptions(),
      wheelSensitivity: 0.3,
      minZoom: 0.1,
      maxZoom: 3,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      autoungrabify: false,
      autounselectify: false,
      layoutOnStable: false,
    });

    cyRef.current = cy;
    setIsInitialized(true);

    console.log('GraphViewer: Cytoscape initialized successfully');

    return cy;
  }, [getNodeTypeColor, getLayoutOptions]);

  const updateGraphData = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) {
      console.warn('GraphViewer: Cytoscape instance not available for data update');
      return;
    }

    console.log('GraphViewer: Updating graph data with', displayNodes.length, 'nodes and', displayEdges.length, 'edges');

    const elements = [
      ...displayNodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          properties: node.properties,
          spaceId: node.spaceId,
          systemId: node.systemId,
        },
      })),
      ...displayEdges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      })),
    ];

    cy.json({ elements });
    const layout = cy.layout(getLayoutOptions());
    layout.run();

    console.log('GraphViewer: Graph data updated and layout applied');
  }, [displayNodes, displayEdges, getLayoutOptions]);

  const handleNodeClick = useCallback((event: any) => {
    const node = event.target;
    const nodeId = node.id();
    
    selectElement(nodeId, 'graph');
    
    const cy = cyRef.current;
    if (!cy) return;
    
    cy.$('node.neighbor').removeClass('neighbor');
    cy.$('edge.highlighted').removeClass('highlighted');
    
    const connectedEdges = node.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes().filter((n: NodeSingular) => n.id() !== nodeId);
    
    connectedNodes.addClass('neighbor');
    connectedEdges.addClass('highlighted');
    
    const allEles = node.union(connectedNodes).union(connectedEdges);
    const padding = 50;
    
    cy.fit(allEles, padding);
  }, [selectElement]);

  const handleNodeHover = useCallback((event: any, isHovering: boolean) => {
    const node = event.target;
    const nodeId = node.id();
    
    if (isHovering) {
      setHoveredElement(nodeId);
    } else {
      setHoveredElement(null);
    }
  }, [setHoveredElement]);

  const expandNode = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    const node = cy.getElementById(nodeId);
    if (!node) return;

    const connectedEdges = node.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes().filter((n: NodeSingular) => n.id() !== nodeId);

    connectedNodes.forEach((neighbor: NodeSingular) => {
      neighbor.style('display', 'element');
    });

    connectedEdges.forEach((edge: EdgeSingular) => {
      edge.style('display', 'element');
    });

    cy.animate({
      fit: {
        eles: node.union(connectedNodes),
        padding: 50,
      },
      duration: 300,
    });
  }, []);

  const applyHighlights = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('preview');

    selectedElements.forEach(elementId => {
      const element = cy.getElementById(elementId);
      if (element) {
        element.select();
      }
    });
  }, [selectedElements]);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    if (onLayoutModeChange) {
      onLayoutModeChange(mode);
    } else {
      setLocalLayoutMode(mode);
    }
  }, [onLayoutModeChange]);

  useEffect(() => {
    const cy = initializeCytoscape();
    if (!cy) return;

    cy.on('tap', 'node', handleNodeClick);
    cy.on('mouseover', 'node', (event) => handleNodeHover(event, true));
    cy.on('mouseout', 'node', (event) => handleNodeHover(event, false));

    return () => {
      cy.destroy();
    };
  }, [initializeCytoscape, handleNodeClick, handleNodeHover]);

  useEffect(() => {
    if (isInitialized) {
      updateGraphData();
    }
  }, [isInitialized, updateGraphData]);

  useEffect(() => {
    if (isInitialized) {
      applyHighlights();
    }
  }, [isInitialized, applyHighlights]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !isInitialized) return;

    const handleModeChange = () => {
      cy.layout(getLayoutOptions()).run();
    };

    handleModeChange();
  }, [layoutMode, localLayoutMode]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !isInitialized) return;

    if (paneState === 'minimized') {
      cy.container().style.opacity = '0.5';
      cy.container().style.pointerEvents = 'none';
    } else {
      cy.container().style.opacity = '1';
      cy.container().style.pointerEvents = 'auto';
    }
  }, [paneState, isInitialized]);

  const currentLayoutMode = onLayoutModeChange ? layoutMode : localLayoutMode;

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {paneState !== 'minimized' && (
        <>
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 pointer-events-auto">
              <div className={`w-2 h-2 rounded-full ${selectedElements.size > 0 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span className="text-xs font-semibold text-slate-700">
                {selectedElements.size > 0 ? `${selectedElements.size} Selected` : 'Ready'}
              </span>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 pointer-events-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 capitalize">
                {currentLayoutMode} Layout
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 pointer-events-auto flex flex-col gap-1">
              <button
                onClick={() => handleLayoutModeChange('hierarchy')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  currentLayoutMode === 'hierarchy' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Hierarchy
              </button>
              <button
                onClick={() => handleLayoutModeChange('force')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  currentLayoutMode === 'force' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Force
              </button>
              <button
                onClick={() => handleLayoutModeChange('circular')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  currentLayoutMode === 'circular' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Circular
              </button>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 pointer-events-auto">
              <span className="text-xs font-semibold text-slate-700">
                {displayNodes.length} Nodes, {displayEdges.length} Edges
              </span>
            </div>
          </div>

          {hoveredElement && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-300 px-4 py-3 pointer-events-none"
              style={{ animation: 'fadeIn 0.2s ease-out' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-700">Preview</span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">{hoveredElement}</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            {Array.from(selectedElements).slice(0, 3).map(elementId => {
              const node = displayNodes.find(n => n.id === elementId);
              if (!node) return null;
              return (
                <div 
                  key={elementId}
                  className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2 pointer-events-auto flex items-center gap-2"
                  style={{ borderLeft: `3px solid ${getNodeTypeColor(node.type)}` }}
                >
                  <span className="text-xs font-semibold text-slate-700">{node.label}</span>
                </div>
              );
            })}
            {selectedElements.size > 3 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2 pointer-events-auto">
                <span className="text-xs font-semibold text-slate-700">
                  +{selectedElements.size - 3} more
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2 pointer-events-auto">
              <p className="text-xs text-slate-500">Click to select • Hover to preview</p>
            </div>
          </div>
        </>
      )}

      {paneState === 'minimized' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-4xl mb-2">🕸️</div>
            <p className="text-sm font-semibold text-slate-600">Graph Viewer</p>
            <p className="text-xs text-slate-500 mt-1">{selectedElements.size} selected</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GraphViewer;
