import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  zh: {
    // Header
    'header.projects': '项目',
    'header.analytics': '分析',
    'header.reports': '报告',
    'header.user': '建筑师',
    
    // Project Management
    'project.title': '项目列表',
    'project.add': '添加项目',
    'project.addNew': '添加新项目',
    'project.name': '项目名称',
    'project.embedUrl': '模型嵌入链接',
    'project.namePlaceholder': '输入项目名称',
    'project.urlPlaceholder': '粘贴完整的 iframe 标签或 src 链接',
    'project.cancel': '取消',
    'project.save': '保存',
    'project.default': '默认项目',
    'project.delete': '删除',
    'project.confirmDelete': '确定要删除此项目吗？',
    
    // Layout
    'layout.modelViewer': '3D 模型查看器',
    'layout.graphViewer': '图谱可视化',
    'layout.visibility': '可见性',
    'layout.elements': '构件',
    'layout.command': '命令',
    
    // Graph Viewer
    'graph.placeholder': 'Cytoscape.js 图谱将在任务 6 中实现',
    
    // Control Panel
    'control.title': 'AI 指挥官',
    'control.poweredBy': '由 Gemini 2.5 驱动',
    'control.elements': '构件',
    'control.inputPlaceholder': '询问 AI 进行过滤（例如：显示梁）...',
    'control.microphoneTitle': '切换麦克风',
    'control.aiTools': 'AI 工具：',
    'control.analyzeStructure': '分析结构',
    'control.mepCheck': '机电检查',
    'control.greeting': '你好！我是你的 BIM 助手。描述你想看到的内容，我会为你生成控制选项。',
    'control.selected': '已选择',
    'control.applied': '我已应用过滤器',
    'control.processing': '处理中...',
    
    // AI Prompts
    'ai.analyzeStructural': '分析结构构件',
    'ai.showMechanical': '显示机电和暖通系统',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
  },
  en: {
    // Header
    'header.projects': 'Projects',
    'header.analytics': 'Analytics',
    'header.reports': 'Reports',
    'header.user': 'Architect',
    
    // Project Management
    'project.title': 'Project List',
    'project.add': 'Add Project',
    'project.addNew': 'Add New Project',
    'project.name': 'Project Name',
    'project.embedUrl': 'Model Embed URL',
    'project.namePlaceholder': 'Enter project name',
    'project.urlPlaceholder': 'Paste complete iframe tag or src URL',
    'project.cancel': 'Cancel',
    'project.save': 'Save',
    'project.default': 'Default Project',
    'project.delete': 'Delete',
    'project.confirmDelete': 'Are you sure you want to delete this project?',
    
    // Layout
    'layout.modelViewer': '3D Model Viewer',
    'layout.graphViewer': 'Graph Visualization',
    'layout.visibility': 'Visibility',
    'layout.elements': 'Elements',
    'layout.command': 'Command',
    
    // Graph Viewer
    'graph.placeholder': 'Cytoscape.js graph will be implemented in Task 6',
    
    // Control Panel
    'control.title': 'AI Commander',
    'control.poweredBy': 'Powered by Gemini 2.5',
    'control.elements': 'Elements',
    'control.inputPlaceholder': 'Ask AI to filter (e.g. \'Show beams\')...',
    'control.microphoneTitle': 'Toggle Microphone',
    'control.aiTools': 'AI Tools:',
    'control.analyzeStructure': 'Analyze Structure',
    'control.mepCheck': 'MEP Check',
    'control.greeting': 'Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.',
    'control.selected': 'Selected',
    'control.applied': 'I\'ve applied the filter',
    'control.processing': 'Processing...',
    
    // AI Prompts
    'ai.analyzeStructural': 'Analyze structural elements',
    'ai.showMechanical': 'Show Mechanical and HVAC systems',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.zh] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
