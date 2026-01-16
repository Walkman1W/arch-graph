import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import { LayoutStateProvider, useLayoutState } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import { GraphViewer } from './components/GraphViewer';
import { BIMQueryResponse, BIMOperation, MockBIMElement } from './types';
import { mockGraphNodes, mockGraphEdges } from './data/mockData';

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

const AppContent: React.FC = () => {
  const [allElements] = useState<MockBIMElement[]>(generateMockElements(500));
  const [activeElements, setActiveElements] = useState<MockBIMElement[]>([]);
  const [currentFilter, setCurrentFilter] = useState<BIMQueryResponse | null>(null);
  const { paneStates, selectedElements, highlightedElements, hoveredElement, selectElement, setHoveredElement } = useLayoutState();

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
    selectElement(nodeId, 'graph');
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredElement(nodeId);
  };

  // Speckle Viewer embed URL
  const speckleEmbedUrl = 'https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D';

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <DashboardHeader />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Split Pane Container (70-75% width) */}
        <div className="flex-[0.7] lg:flex-[0.75] min-w-0">
          <SplitPaneContainer
            topPaneTitle="3D 模型查看器"
            bottomPaneTitle="图谱可视化"
            topPane={
              <SpeckleViewer embedUrl={speckleEmbedUrl} />
            }
            bottomPane={
              <GraphViewer
                nodes={mockGraphNodes}
                edges={mockGraphEdges}
                selectedNodes={selectedElements}
                highlightedNodes={highlightedElements}
                hoveredNode={hoveredElement}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                paneState={paneStates.graph}
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
  );
};

const App: React.FC = () => {
  return (
    <LayoutStateProvider>
      <AppContent />
    </LayoutStateProvider>
  );
};

export default App;