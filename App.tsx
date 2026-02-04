import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import ProjectModal from './components/ProjectModal';
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { I18nProvider } from './contexts/I18nContext';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import { useI18n } from './contexts/I18nContext';
import { BIMQueryResponse, BIMOperation, MockBIMElement, Project, ProjectModalState, ProjectFormData } from './types';

const DEFAULT_SPECKLE_URL = 'https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D';

const STORAGE_KEY = 'smartbim_projects';

// Default project keys for i18n - actual display names come from translations
const DEFAULT_PROJECT_ID = 'project-default';
const DEFAULT_PROJECT_KEY = 'defaultProject';

const loadProjectsFromStorage = (language: 'en' | 'zh' = 'en'): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Check if we need to update default project name based on language
      const projects = JSON.parse(stored);
      const defaultProject = projects.find((p: Project) => p.id === DEFAULT_PROJECT_ID);
      if (defaultProject) {
        // Update default project name/description based on current language
        defaultProject.name = language === 'zh' ? '示例建筑模型' : 'Sample Building Model';
        defaultProject.description = language === 'zh' 
          ? '默认示例项目，展示基本的建筑模型结构' 
          : 'Default sample project showcasing basic building model structure';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      }
      return projects;
    }
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
  }
  
  // Create default project based on language
  const defaultProject: Project = {
    id: DEFAULT_PROJECT_ID,
    name: language === 'zh' ? '示例建筑模型' : 'Sample Building Model',
    speckleUrl: DEFAULT_SPECKLE_URL,
    description: language === 'zh' 
      ? '默认示例项目，展示基本的建筑模型结构' 
      : 'Default sample project showcasing basic building model structure',
    thumbnail: undefined,
    createdAt: Date.now(),
    isActive: true,
  };
  
  saveProjectsToStorage([defaultProject]);
  return [defaultProject];
};

const saveProjectsToStorage = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

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

// Inner App component that uses i18n
const AppContent: React.FC = () => {
  const { t, language } = useI18n();
  const [allElements] = useState<MockBIMElement[]>(generateMockElements(500));
  const [activeElements, setActiveElements] = useState<MockBIMElement[]>([]);
  const [currentFilter, setCurrentFilter] = useState<BIMQueryResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalState, setModalState] = useState<ProjectModalState>({
    isOpen: false,
    mode: 'view',
    selectedProjectId: null,
  });

  useEffect(() => {
    setActiveElements(allElements);
  }, [allElements]);

  // Load projects when component mounts
  useEffect(() => {
    const storedProjects = loadProjectsFromStorage(language);
    setProjects(storedProjects);
  }, []);

  // Update default project name when language changes
  useEffect(() => {
    const updatedProjects = loadProjectsFromStorage(language);
    setProjects(updatedProjects);
  }, [language]);

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

  const handleOpenProjects = () => {
    setModalState({ isOpen: true, mode: 'view', selectedProjectId: null });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: 'view', selectedProjectId: null });
  };

  const handleSwitchMode = (mode: 'view' | 'add') => {
    setModalState(prev => ({ ...prev, mode }));
  };

  const handleAddProject = (formData: ProjectFormData) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: formData.name,
      speckleUrl: formData.speckleUrl,
      description: formData.description,
      thumbnail: undefined,
      createdAt: Date.now(),
      isActive: false,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    setModalState({ isOpen: true, mode: 'view', selectedProjectId: null });
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const handleSelectProject = (projectId: string) => {
    const updatedProjects = projects.map(p => ({
      ...p,
      isActive: p.id === projectId,
    }));
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    handleCloseModal();
  };

  const currentProject = projects.find(p => p.isActive);

  return (
    <LayoutStateProvider>
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <DashboardHeader 
          onOpenProjects={handleOpenProjects}
          currentProjectName={currentProject?.name}
        />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Side: Split Pane Container (70-75% width) */}
          <div className="flex-[0.7] lg:flex-[0.75] min-w-0">
            <SplitPaneContainer
              topPane={
                <div className="relative w-full h-full">
                  <SpeckleViewer embedUrl={currentProject?.speckleUrl || DEFAULT_SPECKLE_URL} />
                  
                  {/* Status Overlay (Top Left) */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto">
                      <div className={`w-2 h-2 rounded-full ${activeElements.length < allElements.length ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t('modelViewer.visibility') as string}</p>
                        <p className="text-sm font-semibold text-slate-800">{activeElements.length} / {allElements.length} {t('modelViewer.elements') as string}</p>
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
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">{t('graphViewer.title') as string}</h2>
                    <p className="text-slate-600">{t('graphViewer.placeholder') as string}</p>
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

        {/* Project Modal */}
        <ProjectModal
          modalState={modalState}
          projects={projects}
          onClose={handleCloseModal}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={handleSelectProject}
          onSwitchMode={handleSwitchMode}
        />
      </div>
    </LayoutStateProvider>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

export default App;
