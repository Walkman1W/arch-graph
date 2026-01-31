import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface TranslationType {
  [key: string]: {
    zh: string;
    en: string;
  };
}

const translations: TranslationType = {
  // DashboardHeader
  'dashboard.title': {
    zh: 'SmartBIM',
    en: 'SmartBIM'
  },
  'dashboard.projects': {
    zh: '项目',
    en: 'Projects'
  },
  'dashboard.analytics': {
    zh: '分析',
    en: 'Analytics'
  },
  'dashboard.reports': {
    zh: '报告',
    en: 'Reports'
  },
  'dashboard.current_project': {
    zh: '当前项目',
    en: 'Current Project'
  },
  
  // ControlPanel
  'controlpanel.title': {
    zh: 'AI 指挥官',
    en: 'AI Commander'
  },
  'controlpanel.powered_by': {
    zh: '由 Gemini 2.5 提供支持',
    en: 'Powered by Gemini 2.5'
  },
  'controlpanel.elements': {
    zh: '元素',
    en: 'Elements'
  },
  'controlpanel.placeholder': {
    zh: '让 AI 帮您筛选（例如 "显示梁"）...',
    en: 'Ask AI to filter (e.g. "Show beams")...'
  },
  'controlpanel.analyze_structure': {
    zh: '分析结构',
    en: 'Analyze Structure'
  },
  'controlpanel.mep_check': {
    zh: 'MEP 检查',
    en: 'MEP Check'
  },
  'controlpanel.ai_tools': {
    zh: 'AI 工具:',
    en: 'AI Tools:'
  },
  'controlpanel.selected': {
    zh: '已选择: ',
    en: 'Selected: '
  },
  'controlpanel.applied_filter': {
    zh: '已应用筛选: ',
    en: 'I\'ve applied the filter: '
  },
  'controlpanel.error': {
    zh: '连接 AI 服务时遇到错误。请检查您的 API 密钥。',
    en: 'I encountered an error connecting to the AI service. Please check your API key.'
  },
  'controlpanel.welcome': {
    zh: '你好！我是你的 BIM 助手。请描述你想看到的内容，我会为你生成控制方案。',
    en: 'Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.'
  },
  'controlpanel.isolate_structure': {
    zh: '隔离结构',
    en: 'Isolate Structure'
  },
  'controlpanel.show_level_1': {
    zh: '显示第一层',
    en: 'Show Level 1'
  },
  'controlpanel.reset_view': {
    zh: '重置视图',
    en: 'Reset View'
  },
  
  // Pane titles
  'pane.model_viewer': {
    zh: '3D 模型查看器',
    en: '3D Model Viewer'
  },
  'pane.graph_viewer': {
    zh: '图谱可视化',
    en: 'Graph Visualization'
  },
  'pane.live_model': {
    zh: '实时模型',
    en: 'Live Model'
  },
  'pane.visibility': {
    zh: '可见性',
    en: 'Visibility'
  },
  'pane.elements': {
    zh: '元素',
    en: 'Elements'
  },
  
  // ProjectModal
  'modal.add_project': {
    zh: '添加新项目',
    en: 'Add New Project'
  },
  'modal.manage_projects': {
    zh: '项目管理',
    en: 'Manage Projects'
  },
  'modal.add_description': {
    zh: '添加一个新的 Speckle 项目',
    en: 'Add a new Speckle project'
  },
  'modal.manage_description': {
    zh: '管理您的 BIM 项目',
    en: 'Manage your BIM projects'
  },
  'modal.no_projects': {
    zh: '暂无项目',
    en: 'No Projects'
  },
  'modal.add_first_project': {
    zh: '点击右上角的 + 按钮添加您的第一个项目',
    en: 'Click the + button in the top right to add your first project'
  },
  'modal.project_name': {
    zh: '项目名称',
    en: 'Project Name'
  },
  'modal.speckle_url': {
    zh: 'Speckle Embed URL',
    en: 'Speckle Embed URL'
  },
  'modal.description': {
    zh: '项目描述',
    en: 'Description'
  },
  'modal.required': {
    zh: '*',
    en: '*'
  },
  'modal.optional': {
    zh: '(可选)',
    en: '(Optional)'
  },
  'modal.enter_name': {
    zh: '例如：办公楼 BIM 模型',
    en: 'e.g., Office Building BIM Model'
  },
  'modal.enter_url': {
    zh: 'https://app.speckle.systems/projects/...',
    en: 'https://app.speckle.systems/projects/...'
  },
  'modal.enter_description': {
    zh: '简要描述这个项目...',
    en: 'Briefly describe this project...'
  },
  'modal.add_button': {
    zh: '添加项目',
    en: 'Add Project'
  },
  'modal.reset_button': {
    zh: '重置',
    en: 'Reset'
  },
  'modal.switch_project': {
    zh: '切换到此项目',
    en: 'Switch to This Project'
  },
  'modal.delete': {
    zh: '删除',
    en: 'Delete'
  },
  'modal.current': {
    zh: '当前',
    en: 'Current'
  },
  
  // Error messages
  'error.name_required': {
    zh: '项目名称不能为空',
    en: 'Project name is required'
  },
  'error.url_required': {
    zh: 'Speckle URL 不能为空',
    en: 'Speckle URL is required'
  },
  'error.invalid_url': {
    zh: '请输入有效的 Speckle URL',
    en: 'Please enter a valid Speckle URL'
  },
  
  // App
  'app.default_project': {
    zh: '示例建筑模型',
    en: 'Sample Building Model'
  },
  'app.default_description': {
    zh: '默认示例项目，展示基本的建筑模型结构',
    en: 'Default sample project showcasing basic building model structure'
  },
  'app.graph_implementation': {
    zh: 'Cytoscape.js 图谱将在任务 6 中实现',
    en: 'Cytoscape.js graph will be implemented in Task 6'
  },
  
  // PaneHeader
  'paneheader.minimize': {
    zh: '最小化',
    en: 'Minimize'
  },
  'paneheader.maximize': {
    zh: '最大化',
    en: 'Maximize'
  },
  'paneheader.restore': {
    zh: '恢复',
    en: 'Restore'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
