import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import ProjectManager from './components/ProjectManager';
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import { BIMQueryResponse, BIMOperation, MockBIMElement, Project } from './types';
import { projectService } from './services/projectService';
import { speckleUtils } from './utils/speckleUtils';

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
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  useEffect(() => {
    setActiveElements(allElements);
  }, [allElements]);

  useEffect(() => {
    const projectState = projectService.loadProjects();
    setProjects(projectState.projects);
    const active = projectState.projects.find(p => p.isActive) || null;
    setActiveProject(active);
  }, []);

  const handleProjectsChange = useCallback(() => {
    const projectState = projectService.loadProjects();
    setProjects(projectState.projects);
    const active = projectState.projects.find(p => p.isActive) || null;
    setActiveProject(active);
  }, []);

  const handleOpenProjectManager = useCallback(() => {
    setIsProjectManagerOpen(true);
  }, []);

  const handleCloseProjectManager = useCallback(() => {
    setIsProjectManagerOpen(false);
  }, []);

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

  return (
    <LayoutStateProvider>
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <DashboardHeader 
          projectName={activeProject?.name}
          onOpenProjectManager={handleOpenProjectManager}
        />
        
        {isProjectManagerOpen && (
          <ProjectManager
            isOpen={isProjectManagerOpen}
            onClose={handleCloseProjectManager}
            onProjectsChange={handleProjectsChange}
          />
        )}
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Side: Split Pane Container (70-75% width) */}
          <div className="flex-[0.7] lg:flex-[0.75] min-w-0">
            <SplitPaneContainer
              topPaneTitle="3D 模型查看器"
              bottomPaneTitle="图谱可视化"
              topPane={
                <div className="relative w-full h-full">
                  <SpeckleViewer 
                    embedUrl={
                      activeProject?.speckleUrl 
                        ? speckleUtils.getEmbedUrl(activeProject.speckleUrl)
                        : "https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D"
                    } 
                  />
                  
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
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🕸️</div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">图谱可视化</h2>
                    <p className="text-slate-600">Cytoscape.js 图谱将在任务 6 中实现</p>
                  </div>
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