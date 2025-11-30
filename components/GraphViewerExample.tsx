import React, { useState } from 'react';
import GraphViewer, { GraphNode, GraphEdge, LayoutMode } from './GraphViewer';
import { HighlightStyle } from '../types';

// Mock graph data
const mockNodes: GraphNode[] = [
  {
    id: 'project-1',
    label: 'Building A',
    type: 'Project',
    properties: { name: 'Building A', location: 'Downtown' },
  },
  {
    id: 'level-1',
    label: 'Level 1',
    type: 'Level',
    properties: { elevation: 0 },
  },
  {
    id: 'level-2',
    label: 'Level 2',
    type: 'Level',
    properties: { elevation: 3.5 },
  },
  {
    id: 'space-101',
    label: 'Room 101',
    type: 'Space',
    properties: { area: 25, usage: 'Office' },
  },
  {
    id: 'space-102',
    label: 'Room 102',
    type: 'Space',
    properties: { area: 30, usage: 'Meeting' },
  },
  {
    id: 'space-201',
    label: 'Room 201',
    type: 'Space',
    properties: { area: 28, usage: 'Office' },
  },
  {
    id: 'elem-001',
    label: 'Wall-001',
    type: 'Element',
    properties: { material: 'Concrete' },
  },
  {
    id: 'elem-002',
    label: 'Door-001',
    type: 'Element',
    properties: { width: 900 },
  },
  {
    id: 'system-hvac',
    label: 'HVAC System',
    type: 'System',
    properties: { capacity: 5000 },
  },
];

const mockEdges: GraphEdge[] = [
  {
    id: 'e1',
    source: 'project-1',
    target: 'level-1',
    type: 'HAS_LEVEL',
  },
  {
    id: 'e2',
    source: 'project-1',
    target: 'level-2',
    type: 'HAS_LEVEL',
  },
  {
    id: 'e3',
    source: 'level-1',
    target: 'space-101',
    type: 'CONTAINS',
  },
  {
    id: 'e4',
    source: 'level-1',
    target: 'space-102',
    type: 'CONTAINS',
  },
  {
    id: 'e5',
    source: 'level-2',
    target: 'space-201',
    type: 'CONTAINS',
  },
  {
    id: 'e6',
    source: 'space-101',
    target: 'elem-001',
    type: 'HAS_ELEMENT',
  },
  {
    id: 'e7',
    source: 'space-101',
    target: 'elem-002',
    type: 'HAS_ELEMENT',
  },
  {
    id: 'e8',
    source: 'elem-001',
    target: 'system-hvac',
    type: 'CONNECTED_TO',
  },
];

const GraphViewerExample: React.FC = () => {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [highlightedNodes, setHighlightedNodes] = useState<Map<string, HighlightStyle>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('hierarchy');

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    
    // Toggle selection
    const newSelected = new Set(selectedNodes);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    setSelectedNodes(newSelected);

    // Add highlight
    const newHighlighted = new Map(highlightedNodes);
    if (newSelected.has(nodeId)) {
      newHighlighted.set(nodeId, {
        color: '#3B82F6',
        category: 'element',
        intensity: 'selected',
      });
    } else {
      newHighlighted.delete(nodeId);
    }
    setHighlightedNodes(newHighlighted);
  };

  const handleNodeHover = (nodeId: string | null) => {
    console.log('Node hovered:', nodeId);
    setHoveredNode(nodeId);

    // Add preview highlight
    if (nodeId && !selectedNodes.has(nodeId)) {
      const newHighlighted = new Map(highlightedNodes);
      newHighlighted.set(nodeId, {
        color: '#60A5FA',
        category: 'element',
        intensity: 'preview',
      });
      setHighlightedNodes(newHighlighted);
    }
  };

  const handleClearSelection = () => {
    setSelectedNodes(new Set());
    setHighlightedNodes(new Map());
    setHoveredNode(null);
  };

  const handleSelectSpace = () => {
    const spaceNodes = mockNodes.filter(n => n.type === 'Space').map(n => n.id);
    const newSelected = new Set(spaceNodes);
    setSelectedNodes(newSelected);

    const newHighlighted = new Map<string, HighlightStyle>();
    spaceNodes.forEach(id => {
      newHighlighted.set(id, {
        color: '#10B981',
        category: 'space',
        intensity: 'selected',
      });
    });
    setHighlightedNodes(newHighlighted);
  };

  const handleSelectSystem = () => {
    const systemNodes = mockNodes.filter(n => n.type === 'System').map(n => n.id);
    const newSelected = new Set(systemNodes);
    setSelectedNodes(newSelected);

    const newHighlighted = new Map<string, HighlightStyle>();
    systemNodes.forEach(id => {
      newHighlighted.set(id, {
        color: '#EF4444',
        category: 'system',
        intensity: 'selected',
      });
    });
    setHighlightedNodes(newHighlighted);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 mb-2">GraphViewer Component Example</h1>
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleClearSelection}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={handleSelectSpace}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Select Spaces
          </button>
          <button
            onClick={handleSelectSystem}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Select Systems
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLayoutMode('hierarchy')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              layoutMode === 'hierarchy'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Hierarchy Layout
          </button>
          <button
            onClick={() => setLayoutMode('force')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              layoutMode === 'force'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Force Layout
          </button>
          <button
            onClick={() => setLayoutMode('circular')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              layoutMode === 'circular'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Circular Layout
          </button>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Selected: {selectedNodes.size} nodes | Highlighted: {highlightedNodes.size} nodes
        </div>
      </div>

      <div className="flex-1 p-4">
        <GraphViewer
          nodes={mockNodes}
          edges={mockEdges}
          selectedNodes={selectedNodes}
          highlightedNodes={highlightedNodes}
          hoveredNode={hoveredNode}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          paneState="normal"
          layoutMode={layoutMode}
        />
      </div>
    </div>
  );
};

export default GraphViewerExample;
