import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import GraphViewer from './components/GraphViewer';
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import { BIMQueryResponse, BIMOperation, MockBIMElement, HighlightStyle } from './types';
import { 
  generateScenario, 
  getAvailableScenarios, 
  ScenarioType,
  GraphNode 
} from './services/mockGraphData';

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
  const { currentProject } = useProject();
  const { t } = useI18n();
  const [allElements] = useState<MockBIMElement[]>(generateMockElements(500));
  const [activeElements, setActiveElements] = useState<MockBIMElement[]>([]);
  const [currentFilter, setCurrentFilter] = useState<BIMQueryResponse | null>(null);
  
  // Graph state
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('office-tower-22f');
  const [selectedGraphNodes, setSelectedGraphNodes] = useState<Set<string>>(new Set());
  const [highlightedGraphNodes, setHighlightedGraphNodes] = useState<Map<string, HighlightStyle>>(new Map());
  const [hoveredGraphNode, setHoveredGraphNode] = useState<string | null>(null);

  // Generate graph data
  const graphData = useMemo(() => {
    return generateScenario(currentScenario);
  }, [currentScenario]);

  const scenarios = getAvailableScenarios();

  useEffect(() => {
    setActiveElements(allElements);
  }, [allElements]);

  // Graph event handlers
  const handleGraphNodeClick = useCallback((nodeId: string, node: GraphNode) => {
    console.log('Graph node clicked:', nodeId, node);
    setSelectedGraphNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleGraphNodeHover = useCallback((nodeId: string | null) => {
    setHoveredGraphNode(nodeId);
  }, []);

  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setSelectedGraphNodes(new Set());
    setHighlightedGraphNodes(new Map());
  }, []);

  const handleCommand = (response: BIMQueryResponse) => {
    setCurrentFilter(response);
    
    if (response.operation === BIMOperation.RESET) {
      setActiveElements(allElements);
      return;
    }

    let filtered = [...allElements];

    if (response.category) {
      filtered = filtered.filter((e: MockBIMElement) => e.category.toLowerCase().includes(response.category!.toLowerCase()));
    }
    
    if (response.level) {
      filtered = filtered.filter((e: MockBIMElement) => e.level.toLowerCase().includes(response.level!.toLowerCase()));
    }

    if (response.material) {
      filtered = filtered.filter((e: MockBIMElement) => e.material.toLowerCase().includes(response.material!.toLowerCase()));
    }

    setActiveElements(filtered);
  };

  // Memoize the embed URL to prevent unnecessary re-renders
  const embedUrl = currentProject?.embedUrl || '';

  // Memoize the SpeckleViewer to prevent iframe reload
  const memoizedSpeckleViewer = useMemo(() => (
    <SpeckleViewer embedUrl={embedUrl} />
  ), [embedUrl]);

  // Memoize the scenario selector
  const memoizedScenarioSelector = useMemo(() => (
    <select
      value={currentScenario}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleScenarioChange(e.target.value as ScenarioType)}
      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {scenarios.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  ), [currentScenario, scenarios, handleScenarioChange]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <DashboardHeader />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Split Pane Container (70-75% width) */}
        <div className="flex-[0.7] lg:flex-[0.75] min-w-0">
          <SplitPaneContainer
            topPaneTitle={t('layout.modelViewer')}
            bottomPaneTitle={t('layout.graphViewer')}
            topPane={
              <div className="relative w-full h-full">
                {memoizedSpeckleViewer}
                </div>
              }
              bottomPane={
                <div className="w-full h-full relative overflow-hidden">
                  <GraphViewer
                    data={graphData}
                    selectedNodes={selectedGraphNodes}
                    highlightedNodes={highlightedGraphNodes}
                    hoveredNode={hoveredGraphNode}
                    onNodeClick={handleGraphNodeClick}
                    onNodeHover={handleGraphNodeHover}
                    paneState="normal"
                    layoutMode="force"
                    showZoomControls={true}
                    showLegend={true}
                    showLayoutControls={true}
                    scenarioSelector={memoizedScenarioSelector}
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
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <ProjectProvider>
        <LayoutStateProvider>
          <AppContent />
        </LayoutStateProvider>
      </ProjectProvider>
    </I18nProvider>
  );
};

export default App;