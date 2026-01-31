import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译资源
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // 通用
    'common.projects': '项目',
    'common.analytics': '分析',
    'common.reports': '报告',
    'common.elements': '元素',
    'common.visibility': '可见性',
    'common.liveModel': '实时模型',
    'common.minimize': '最小化',
    'common.maximize': '最大化',
    'common.restore': '恢复',
    'common.close': '关闭',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.add': '添加',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.select': '选择',
    'common.loading': '加载中',
    'common.error': '错误',
    'common.success': '成功',
    
    // 应用标题
    'app.title': 'SmartBIM',
    'app.subtitle': '智能建筑信息模型助手',
    
    // 仪表板头部
    'header.projects': '项目',
    'header.analytics': '分析',
    'header.reports': '报告',
    
    // 模型查看器
    'modelViewer.title': '3D 模型查看器',
    'modelViewer.visibility': '可见性',
    'modelViewer.elements': '元素',
    'modelViewer.liveModel': '实时模型',
    
    // 图谱查看器
    'graphViewer.title': '图谱可视化',
    'graphViewer.description': 'Cytoscape.js 图谱将在任务 6 中实现',
    
    // 控制面板
    'controlPanel.title': 'AI 指挥官',
    'controlPanel.poweredBy': 'Powered by Gemini 2.5',
    'controlPanel.placeholder': '询问 AI 进行过滤（例如："显示梁"）...',
    'controlPanel.aiTools': 'AI 工具:',
    'controlPanel.analyzeStructure': '分析结构',
    'controlPanel.mepCheck': 'MEP 检查',
    'controlPanel.initialMessage': '您好！我是您的 BIM 助手。描述您想要查看的内容，我将为您生成控件。',
    'controlPanel.suggestion.isolateStructure': '隔离结构',
    'controlPanel.suggestion.showLevel1': '显示 1 层',
    'controlPanel.suggestion.resetView': '重置视图',
    'controlPanel.appliedFilter': '我已应用过滤器：',
    'controlPanel.errorConnecting': '连接 AI 服务时遇到错误。请检查您的 API 密钥。',
    
    // 项目管理
    'project.defaultName': '示例建筑模型',
    'project.defaultDescription': '默认示例项目，展示基本的建筑模型结构',
    'project.modal.viewProjects': '查看项目',
    'project.modal.addProject': '添加项目',
    'project.modal.projectName': '项目名称',
    'project.modal.projectUrl': 'Speckle URL',
    'project.modal.projectDescription': '项目描述',
    'project.modal.createProject': '创建项目',
    'project.modal.noProjects': '暂无项目',
    'project.modal.addNewProject': '添加新项目',
    'project.modal.addNewProjectTitle': '添加新项目',
    'project.modal.manageProjects': '项目管理',
    'project.modal.addNewProjectDesc': '添加一个新的 Speckle 项目',
    'project.modal.manageProjectsDesc': '管理您的 BIM 项目',
    'project.modal.noProjectsDesc': '点击右上角的 + 按钮添加您的第一个项目',
    'project.modal.current': '当前',
    'project.modal.switchToProject': '切换到此项目',
    'project.modal.delete': '删除',
    'project.modal.nameRequired': '项目名称不能为空',
    'project.modal.urlRequired': 'Speckle URL 不能为空',
    'project.modal.urlInvalid': '请输入有效的 Speckle URL',
    'project.modal.namePlaceholder': '例如：办公楼 BIM 模型',
    'project.modal.urlPlaceholder': 'https://app.speckle.systems/projects/...',
    'project.modal.descriptionPlaceholder': '简要描述这个项目...',
    'project.modal.descriptionOptional': '(可选)',
    'project.modal.addProjectBtn': '添加项目',
    'project.modal.resetBtn': '重置',
    'project.modal.urlHelp': '请从 Speckle 项目页面复制 embed URL',
    
    // 语音命令
    'voice.notSupported': '此浏览器不支持语音识别。',
    
    // 类别和材料
    'category.walls': '墙体',
    'category.columns': '柱子',
    'category.slabs': '楼板',
    'category.windows': '窗户',
    'category.doors': '门',
    'category.beams': '梁',
    'category.hvac': '暖通空调',
    
    'material.concrete': '混凝土',
    'material.brick': '砖',
    'material.glass': '玻璃',
    'material.steel': '钢材',
    'material.timber': '木材',
    
    // 楼层
    'level.foundation': '基础',
    'level.level1': '1 层',
    'level.level2': '2 层',
    'level.roof': '屋顶',
    
    // 操作
    'operation.isolate': '隔离',
    'operation.show': '显示',
    'operation.reset': '重置',
    'operation.filter': '过滤',
    'operation.analyze': '分析',
    
    // 消息
    'message.selected': '已选择：',
    'message.actionApplied': '操作已应用：',
    'message.noResults': '未找到结果',
    'message.processing': '处理中...',
  },
  en: {
    // Common
    'common.projects': 'Projects',
    'common.analytics': 'Analytics',
    'common.reports': 'Reports',
    'common.elements': 'Elements',
    'common.visibility': 'Visibility',
    'common.liveModel': 'Live Model',
    'common.minimize': 'Minimize',
    'common.maximize': 'Maximize',
    'common.restore': 'Restore',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.add': 'Add',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.select': 'Select',
    'common.loading': 'Loading',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // App
    'app.title': 'SmartBIM',
    'app.subtitle': 'Smart Building Information Modeling Assistant',
    
    // Dashboard Header
    'header.projects': 'Projects',
    'header.analytics': 'Analytics',
    'header.reports': 'Reports',
    
    // Model Viewer
    'modelViewer.title': '3D Model Viewer',
    'modelViewer.visibility': 'Visibility',
    'modelViewer.elements': 'Elements',
    'modelViewer.liveModel': 'Live Model',
    
    // Graph Viewer
    'graphViewer.title': 'Graph Visualization',
    'graphViewer.description': 'Cytoscape.js graph will be implemented in Task 6',
    
    // Control Panel
    'controlPanel.title': 'AI Commander',
    'controlPanel.poweredBy': 'Powered by Gemini 2.5',
    'controlPanel.placeholder': 'Ask AI to filter (e.g. \'Show beams\')...',
    'controlPanel.aiTools': 'AI Tools:',
    'controlPanel.analyzeStructure': 'Analyze Structure',
    'controlPanel.mepCheck': 'MEP Check',
    'controlPanel.initialMessage': 'Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.',
    'controlPanel.suggestion.isolateStructure': 'Isolate Structure',
    'controlPanel.suggestion.showLevel1': 'Show Level 1',
    'controlPanel.suggestion.resetView': 'Reset View',
    'controlPanel.appliedFilter': 'I\'ve applied the filter: ',
    'controlPanel.errorConnecting': 'I encountered an error connecting to the AI service. Please check your API key.',
    
    // Project Management
    'project.defaultName': 'Sample Building Model',
    'project.defaultDescription': 'Default sample project showing basic building model structure',
    'project.modal.viewProjects': 'View Projects',
    'project.modal.addProject': 'Add Project',
    'project.modal.projectName': 'Project Name',
    'project.modal.projectUrl': 'Speckle URL',
    'project.modal.projectDescription': 'Project Description',
    'project.modal.createProject': 'Create Project',
    'project.modal.noProjects': 'No projects available',
    'project.modal.addNewProject': 'Add New Project',
    'project.modal.addNewProjectTitle': 'Add New Project',
    'project.modal.manageProjects': 'Manage Projects',
    'project.modal.addNewProjectDesc': 'Add a new Speckle project',
    'project.modal.manageProjectsDesc': 'Manage your BIM projects',
    'project.modal.noProjectsDesc': 'Click the + button in the top right to add your first project',
    'project.modal.current': 'Current',
    'project.modal.switchToProject': 'Switch to this project',
    'project.modal.delete': 'Delete',
    'project.modal.nameRequired': 'Project name is required',
    'project.modal.urlRequired': 'Speckle URL is required',
    'project.modal.urlInvalid': 'Please enter a valid Speckle URL',
    'project.modal.namePlaceholder': 'e.g., Office Building BIM Model',
    'project.modal.urlPlaceholder': 'https://app.speckle.systems/projects/...',
    'project.modal.descriptionPlaceholder': 'Briefly describe this project...',
    'project.modal.descriptionOptional': '(optional)',
    'project.modal.addProjectBtn': 'Add Project',
    'project.modal.resetBtn': 'Reset',
    'project.modal.urlHelp': 'Please copy the embed URL from the Speckle project page',
    
    // Voice Command
    'voice.notSupported': 'Speech recognition is not supported in this browser.',
    
    // Categories
    'category.walls': 'Walls',
    'category.columns': 'Columns',
    'category.slabs': 'Slabs',
    'category.windows': 'Windows',
    'category.doors': 'Doors',
    'category.beams': 'Beams',
    'category.hvac': 'HVAC',
    
    // Materials
    'material.concrete': 'Concrete',
    'material.brick': 'Brick',
    'material.glass': 'Glass',
    'material.steel': 'Steel',
    'material.timber': 'Timber',
    
    // Levels
    'level.foundation': 'Foundation',
    'level.level1': 'Level 1',
    'level.level2': 'Level 2',
    'level.roof': 'Roof',
    
    // Operations
    'operation.isolate': 'Isolate',
    'operation.show': 'Show',
    'operation.reset': 'Reset',
    'operation.filter': 'Filter',
    'operation.analyze': 'Analyze',
    
    // Messages
    'message.selected': 'Selected: ',
    'message.actionApplied': 'Action applied: ',
    'message.noResults': 'No results found',
    'message.processing': 'Processing...',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 从 localStorage 获取保存的语言设置，默认为中文
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // 保存语言设置到 localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};