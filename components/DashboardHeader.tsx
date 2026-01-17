import React from 'react';
import { useLanguage } from '../contexts/LanguageProvider';
import { Language } from '../i18n';

interface DashboardHeaderProps {
  onOpenProjects: () => void;
  currentProjectName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenProjects, currentProjectName }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
          B
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart<span className="text-blue-600">BIM</span></h1>
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
            <span>{t('header.projects')}</span>
            {currentProjectName && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {currentProjectName}
              </span>
            )}
          </button>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">{t('header.analytics')}</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">{t('header.reports')}</span>
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
          title={language === 'en' ? '切换到中文' : 'Switch to English'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>{language === 'en' ? '中文' : 'EN'}</span>
        </button>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <img 
            src="https://picsum.photos/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <span className="hidden md:block text-sm font-semibold text-slate-700">{t('header.user')}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
