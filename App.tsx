import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import { LayoutStateProvider, useLayoutState } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import GraphViewer from './components/GraphViewer';
import { BIMQueryResponse, BIMOperation, MockBIMElement } from './types';

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

const App: React.FC = () => {
  const [allElements] = useState<MockBIMElement[]>(generateMockElements(500));
  const [activeElements, setActiveElements] = useState<MockBIMElement[]>([]);
  const [currentFilter, setCurrentFilter] = useState<BIMQueryResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [graphLayoutMode, setGraphLayoutMode] = useState<'hierarchical' | 'force-directed' | 'circular'>('hierarchical');
  const [panelState, setPanelState] = useState({ isMaximized: false, isMinimized: false });

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

  // Sample graph data for GraphViewer
  const graphNodes = [
    { id: 'n1', label: '建筑系统', category: 'system' as const },
    { id: 'n2', label: '结构空间', category: 'space' as const, parentId: 'n1' },
    { id: 'n3', label: 'MEP空间', category: 'space' as const, parentId: 'n1' },
    { id: 'n4', label: '柱子', category: 'element' as const, parentId: 'n2' },
    { id: 'n5', label: '墙体', category: 'element' as const, parentId: 'n2' },
    { id: 'n6', label: '楼板', category: 'element' as const, parentId: 'n2' },
    { id: 'n7', label: '风管', category: 'element' as const, parentId: 'n3' },
    { id: 'n8', label: '水管', category: 'element' as const, parentId: 'n3' },
    { id: 'n9', label: '电气', category: 'element' as const, parentId: 'n3' },
    { id: 'n10', label: '混凝土柱', category: 'element' as const, parentId: 'n4' },
    { id: 'n11', label: '钢柱', category: 'element' as const, parentId: 'n4' },
  ];

  const graphEdges = [
    { id: 'e1', source: 'n1', target: 'n2', relationship: 'contains' },
    { id: 'e2', source: 'n1', target: 'n3', relationship: 'contains' },
    { id: 'e3', source: 'n2', target: 'n4', relationship: 'contains' },
    { id: 'e4', source: 'n2', target: 'n5', relationship: 'contains' },
    { id: 'e5', source: 'n2', target: 'n6', relationship: 'contains' },
    { id: 'e6', source: 'n3', target: 'n7', relationship: 'contains' },
    { id: 'e7', source: 'n3', target: 'n8', relationship: 'contains' },
    { id: 'e8', source: 'n3', target: 'n9', relationship: 'contains' },
    { id: 'e9', source: 'n4', target: 'n10', relationship: 'contains' },
    { id: 'e10', source: 'n4', target: 'n11', relationship: 'contains' },
  ];

  const handleGraphLayoutChange = (mode: 'hierarchical' | 'force-directed' | 'circular') => {
    setGraphLayoutMode(mode);
  };

  const handlePanelStateChange = (state: { isMaximized: boolean; isMinimized: boolean }) => {
    setPanelState(state);
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
              bottomPane={
                <div className="w-full h-full bg-white">
                  <GraphViewer
                  nodes={graphNodes}
                  edges={graphEdges}
                  selectedNodeId={selectedNode}
                  highlightedNodeIds={Array.from(highlightedNodes)}
                  layoutMode={graphLayoutMode}
                  onNodeClick={setSelectedNode}
                  onNodeHover={(nodeId) => {
                    if (nodeId) {
                      const relatedEdges = graphEdges.filter(
                        e => e.source === nodeId || e.target === nodeId
                      );
                      const relatedNodes = new Set<string>();
                      relatedEdges.forEach(e => {
                        relatedNodes.add(e.source);
                        relatedNodes.add(e.target);
                      });
                      setHighlightedNodes(relatedNodes);
                    } else {
                      setHighlightedNodes(new Set());
                    }
                  }}
                  onLayoutChange={setGraphLayoutMode}
                  panelState={panelState}
                />
                </div>
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