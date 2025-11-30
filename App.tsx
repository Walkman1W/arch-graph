import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import GraphViewer from './components/GraphViewer';
import SplitPaneContainer from './components/SplitPaneContainer';
import { LayoutStateProvider } from './components/LayoutStateProvider';
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

  // 模拟图谱数据
const mockGraphData = {
  nodes: [
    { id: 'project-1', label: '建筑项目', type: 'Project' },
    { id: 'level-1', label: '一层', type: 'Level' },
    { id: 'level-2', label: '二层', type: 'Level' },
    { id: 'space-1', label: '大厅', type: 'Space' },
    { id: 'space-2', label: '办公室', type: 'Space' },
    { id: 'space-3', label: '会议室', type: 'Space' },
    { id: 'element-1', label: '柱子', type: 'Element' },
    { id: 'element-2', label: '墙壁', type: 'Element' },
    { id: 'element-3', label: '窗户', type: 'Element' },
    { id: 'system-1', label: '暖通系统', type: 'System' }
  ],
  edges: [
    { id: 'edge-1', source: 'project-1', target: 'level-1', label: '包含' },
    { id: 'edge-2', source: 'project-1', target: 'level-2', label: '包含' },
    { id: 'edge-3', source: 'level-1', target: 'space-1', label: '包含' },
    { id: 'edge-4', source: 'level-1', target: 'space-2', label: '包含' },
    { id: 'edge-5', source: 'level-2', target: 'space-3', label: '包含' },
    { id: 'edge-6', source: 'space-1', target: 'element-1', label: '包含' },
    { id: 'edge-7', source: 'space-2', target: 'element-2', label: '包含' },
    { id: 'edge-8', source: 'space-3', target: 'element-3', label: '包含' },
    { id: 'edge-9', source: 'element-1', target: 'system-1', label: '属于' },
    { id: 'edge-10', source: 'element-2', target: 'system-1', label: '属于' }
  ]
};

return (
    <LayoutStateProvider>
      <div className="flex flex-col h-screen">
        <DashboardHeader />
        <SplitPaneContainer
          topPanel={<SpeckleViewer elements={activeElements} />}
          bottomPanel={<GraphViewer data={mockGraphData} />}
          rightPanel={<ControlPanel onCommand={handleCommand} />}
        />
      </div>
    </LayoutStateProvider>
  );
};

export default App;