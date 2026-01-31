import React, { useState } from 'react';
import { SpeckleProject } from '../types';
import ProjectModal from './ProjectModal';

interface DashboardHeaderProps {
  onProjectSelect?: (project: SpeckleProject) => void;
  currentProjectId?: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onProjectSelect, currentProjectId }) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleProjectClick = () => {
    setIsProjectModalOpen(true);
  };

  const handleProjectSelect = (project: SpeckleProject) => {
    setIsProjectModalOpen(false);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
            B
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart<span className="text-blue-600">BIM</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <span 
              onClick={handleProjectClick}
              className="hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-1"
            >
              Projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Analytics</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Reports</span>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <img 
              src="https://picsum.photos/32/32" 
              alt="User" 
              className="w-8 h-8 rounded-full border border-slate-200"
            />
            <span className="hidden md:block text-sm font-semibold text-slate-700">Architect Doe</span>
          </div>
        </div>
      </header>
      
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectSelect={handleProjectSelect}
        currentProjectId={currentProjectId}
      />
    </>
  );
};

export default DashboardHeader;
