import React from 'react';

interface DashboardHeaderProps {
  projectName?: string;
  onOpenProjectManager: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ projectName, onOpenProjectManager }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
          B
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart<span className="text-blue-600">BIM</span></h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenProjectManager}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            {projectName || '选择项目'}
          </span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
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
  );
};

export default DashboardHeader;
