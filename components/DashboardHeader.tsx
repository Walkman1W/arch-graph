import React from 'react';
import { useI18n } from '../contexts/I18nContext';

interface DashboardHeaderProps {
  onOpenProjects: () => void;
  currentProjectName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenProjects, currentProjectName }) => {
  const { t, toggleLanguage, language } = useI18n();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
          B
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {t('header.title') as string}<span className="text-blue-600">{t('header.titleHighlight') as string}</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button 
            onClick={onOpenProjects}
            className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{t('header.projects') as string}</span>
            {currentProjectName && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {currentProjectName}
              </span>
            )}
          </button>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">{t('header.analytics') as string}</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">{t('header.reports') as string}</span>
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        
        {/* Language Switch Button */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-300"
          title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
        >
          {t('language.switch') as string}
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <img 
            src="https://picsum.photos/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <span className="hidden md:block text-sm font-semibold text-slate-700">{t('header.userName') as string}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
