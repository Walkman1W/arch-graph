import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SpeckleViewer from './components/SpeckleViewer';
import ControlPanel from './components/ControlPanel';
import QuickActionsToolbar from './components/QuickActionsToolbar';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveElements(allElements);
  }, [allElements]);

  const handleCommand = (response: BIMQueryResponse) => {
    setCurrentFilter(response);
    setError(null); // Clear any previous errors
    setIsLoading(true); // Start loading
    
    if (response.operation === BIMOperation.RESET) {
      setActiveElements(allElements);
      setIsLoading(false); // Stop loading
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
     
     // Handle errors gracefully
     if (response.operation === BIMOperation.UNKNOWN) {
       setError(response.reasoning);
     }
     
     setIsLoading(false); // Stop loading after processing
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <DashboardHeader />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Model & Overlays */}
        <div className="flex-1 relative bg-slate-100 min-w-0">
          <SpeckleViewer embedUrl="https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D" />

          {/* Status Overlay (Top Left) */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
             {/* Loading Indicator */}
             {isLoading && (
               <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto animate-fade-in">
                 <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 <div>
                   <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Processing</p>
                   <p className="text-sm font-semibold text-blue-800">AI is analyzing your request...</p>
                 </div>
               </div>
             )}
             
             <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto">
               <div className={`w-2 h-2 rounded-full ${activeElements.length < allElements.length ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Visibility</p>
                 <p className="text-sm font-semibold text-slate-800">{activeElements.length} / {allElements.length} Elements</p>
               </div>
             </div>
             
             {/* Error Display */}
             {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto animate-fade-in">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <div>
                   <p className="text-xs text-red-500 uppercase font-bold tracking-wider">Error</p>
                   <p className="text-sm font-semibold text-red-800">{error}</p>
                 </div>
               </div>
             )}
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
          
          {/* Quick Actions Toolbar */}
          <QuickActionsToolbar onCommand={handleCommand} />
        </div>

        {/* Right Side: Dialog State */}
        <ControlPanel 
          onCommandProcessed={handleCommand}
          filteredCount={activeElements.length}
          totalCount={allElements.length}
          currentFilter={currentFilter}
          onClearFilter={() => handleCommand({
            operation: BIMOperation.RESET,
            category: null,
            level: null,
            material: null,
            keywords: [],
            reasoning: 'View reset to show all elements',
            suggestions: []
          })}
        />
      </main>
    </div>
  );
};

export default App;