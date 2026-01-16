import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import GraphViewer, { GraphNode, GraphEdge } from './components/GraphViewer';
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import { BIMQueryResponse, BIMOperation, MockBIMElement, PaneState, HighlightStyle } from './types';

// Mock data generator for simulation
const generateMockElements = (count: number): MockBIMElement[] => {
  const categories = ['Walls', 'Columns', 'Slabs', 'Windows', 'Doors', 'Beams', 'HVAC'];
  const levels = ['Foundation', 'Level 1', 'Level 2', 'Roof'];
  const materials = ['Concrete', 'Brick', 'Glass', 'Steel', 'Timber'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `el-${i}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    name: `Element ${i + 1}`,
    material: materials[Math.floor(Math.random() * materials.length)]
  }));
};

// Mock graph data for testing
const mockGraphNodes: GraphNode[] = [
  { id: 'project1', label: '办公楼项目', type: 'Project', properties: { name: '办公楼项目', location: '北京' } },
  { id: 'level1', label: '一层', type: 'Level', properties: { elevation: '0.00m' } },
  { id: 'level2', label: '二层', type: 'Level', properties: { elevation: '4.50m' } },
  { id: 'zone1', label: '办公区', type: 'Space', properties: { area: '200㎡' } },
  { id: 'zone2', label: '会议室', type: 'Space', properties: { area: '50㎡' } },
  { id: 'zone3', label: '走廊', type: 'Space', properties: { area: '30㎡' } },
  { id: 'wall1', label: '外墙-W1', type: 'Element', properties: { material: '混凝土', thickness: '200mm' } },
  { id: 'wall2', label: '内墙-W2', type: 'Element', properties: { material: '轻质砖', thickness: '120mm' } },
  { id: 'column1', label: '柱子-C1', type: 'Element', properties: { material: '混凝土', size: '600x600' } },
  { id: 'pipe1', label: '给排水管道', type: 'Pipe', properties: { diameter: '100mm', material: 'PVC' } },
  { id: 'duct1', label: '空调风管', type: 'Duct', properties: { size: '400x200mm', material: '镀锌钢板' } },
  { id: 'system1', label: '空调系统', type: 'System', properties: { type: 'VRV', capacity: '10HP' } }
];

const mockGraphEdges: GraphEdge[] = [
  { id: 'e1', source: 'project1', target: 'level1', type: 'HAS_LEVEL' },
  { id: 'e2', source: 'project1', target: 'level2', type: 'HAS_LEVEL' },
  { id: 'e3', source: 'level1', target: 'zone1', type: 'CONTAINS' },
  { id: 'e4', source: 'level1', target: 'zone2', type: 'CONTAINS' },
  { id: 'e5', source: 'level1', target: 'zone3', type: 'CONTAINS' },
  { id: 'e6', source: 'zone1', target: 'wall1', type: 'HAS_ELEMENT' },
  { id: 'e7', source: 'zone1', target: 'wall2', type: 'HAS_ELEMENT' },
  { id: 'e8', source: 'zone2', target: 'column1', type: 'HAS_ELEMENT' },
  { id: 'e9', source: 'project1', target: 'system1', type: 'HAS_ELEMENT' },
  { id: 'e10', source: 'system1', target: 'duct1', type: 'CONNECTED_TO' },
  { id: 'e11', source: 'level1', target: 'pipe1', type: 'PASSES_THROUGH' },
  { id: 'e12', source: 'level2', target: 'pipe1', type: 'PASSES_THROUGH' }
];

const App: React.FC = () => {
  const [allElements] = useState<MockBIMElement[]>(generateMockElements(500));
  const [activeElements, setActiveElements] = useState<MockBIMElement[]>([]);
  const [currentFilter, setCurrentFilter] = useState<BIMQueryResponse | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [paneState, setPaneState] = useState<PaneState>('normal');
  const [layoutMode, setLayoutMode] = useState<'hierarchy' | 'force' | 'circular'>('hierarchy');
  const highlightedNodes = new Map<string, HighlightStyle>();

  useEffect(() => {
    setActiveElements(allElements);
  }, [allElements]);

  const handleCommand = (response: BIMQueryResponse) => {
    setCurrentFilter(response);
    
    if (response.operation === BIMOperation.RESET) {
      setActiveElements(allElements);
      return;
    }

    let filtered = [...allElements];

    if (response.category) {
      filtered = filtered.filter(e => e.category.toLowerCase().includes(response.category!.toLowerCase()));
    }
    
    if (response.level) {
      filtered = filtered.filter(e => e.level.toLowerCase().includes(response.level!.toLowerCase()));
    }

    if (response.material) {
      filtered = filtered.filter(e => e.material.toLowerCase().includes(response.material!.toLowerCase()));
    }

    setActiveElements(filtered);
  };

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
  };

  const handleLayoutChange = (mode: 'hierarchy' | 'force' | 'circular') => {
    setLayoutMode(mode);
  };

  return (
    <LayoutStateProvider>
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Side: Split Pane Container (70-75% width) */}
          <div className="flex-[0.7] lg:flex-[0.75] min-w-0">
            <SplitPaneContainer
              topPaneTitle="3D 模型查看器"
              bottomPaneTitle="图谱可视化"
              topPane={
                <div className="relative w-full h-full">
                  <SpeckleViewer embedUrl="https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D" />
                  
                  {/* Status Overlay (Top Left) */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto">
                      <div className={`w-2 h-2 rounded-full ${activeElements.length < allElements.length ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Visibility</p>
                        <p className="text-sm font-semibold text-slate-800">{activeElements.length} / {allElements.length} Elements</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Filter Tags (Bottom Left) */}
                  {currentFilter && currentFilter.operation !== 'RESET' && (
                    <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2 max-w-md pointer-events-none">
                      {currentFilter.operation && (
                        <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono rounded-md shadow-lg">
                          CMD: {currentFilter.operation}
                        </span>
                      )}
                      {currentFilter.category && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-lg">
                          {currentFilter.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              }
              bottomPane={<GraphViewer
                  nodes={mockGraphNodes}
                  edges={mockGraphEdges}
                  selectedNodes={selectedNodes}
                  highlightedNodes={highlightedNodes}
                  hoveredNode={hoveredNode}
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  paneState={paneState}
                  layoutMode={layoutMode}
                  onLayoutChange={handleLayoutChange}
                />
              }
            />
          </div>

          {/* Right Side: Control Panel (25-30% width) */}
          <div className="flex-[0.3] lg:flex-[0.25] min-w-0">
            <ControlPanel 
              onCommandProcessed={handleCommand}
              filteredCount={activeElements.length}
            />
          </div>
        </main>
      </div>
    </LayoutStateProvider>
  );
};

export default App;