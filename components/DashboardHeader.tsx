import React, { useState } from 'react';
import ProjectManager from './ProjectManager';
import { Project } from '../types';

interface DashboardHeaderProps {
  onProjectChange?: (project: Project) => void;
  currentProject?: Project | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onProjectChange,
  currentProject,
}) => {
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  const handleSelectProject = (project: Project) => {
    if (onProjectChange) {
      onProjectChange(project);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
            B
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Smart<span className="text-blue-600">BIM</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {/* Projects 按钮 - 带下拉指示 */}
            <button
              onClick={() => setIsProjectManagerOpen(true)}
              className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Projects</span>
              {currentProject && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {currentProject.name.slice(0, 8)}
                  {currentProject.name.length > 8 ? '...' : ''}
                </span>
              )}
            </button>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Analytics
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Reports
            </span>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <img
              src="https://picsum.photos/32/32"
              alt="User"
              className="w-8 h-8 rounded-full border border-slate-200"
            />
            <span className="hidden md:block text-sm font-semibold text-slate-700">
              Architect Doe
            </span>
          </div>
        </div>
      </header>

      {/* Project Manager 弹窗 */}
      <ProjectManager
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        onSelectProject={handleSelectProject}
        currentProjectId={currentProject?.id || null}
      />
    </>
  );
};

export default DashboardHeader;
