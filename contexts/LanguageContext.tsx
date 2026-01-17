import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh';

export interface Translations {
  common: {
    projects: string;
    analytics: string;
    reports: string;
    current: string;
    switchToProject: string;
    delete: string;
    add: string;
    cancel: string;
    save: string;
    reset: string;
    close: string;
    elements: string;
    nodes: string;
    selected: string;
    live: string;
  };
  header: {
    title: string;
    titleHighlight: string;
    user: string;
  };
  chat: {
    title: string;
    subtitle: string;
    welcome: string;
    error: string;
    selected: string;
    actionApplied: string;
    filterApplied: string;
    aiTools: string;
    placeholder: string;
    suggestions: {
      isolateStructure: string;
      showLevel1: string;
      resetView: string;
    };
    quickActions: {
      analyzeStructure: string;
      mepCheck: string;
    };
  };
  graph: {
    title: string;
    layout: string;
    nodeInfo: string;
    noSelection: string;
    layouts: {
      force: string;
      circular: string;
      hierarchical: string;
    };
    nodeTypes: {
      element: string;
      category: string;
      property: string;
    };
  };
  model: {
    title: string;
    loading: string;
    noModel: string;
    status: string;
  };
  project: {
    title: string;
    subtitle: string;
    addProject: string;
    addProjectSubtitle: string;
    projectName: string;
    speckleUrl: string;
    description: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
    noProjects: string;
    noProjectsSubtitle: string;
    addFirstProject: string;
    current: string;
    switchToProject: string;
    reset: string;
    optional: string;
    placeholder: {
      name: string;
      url: string;
      description: string;
    };
    errors: {
      nameRequired: string;
      urlRequired: string;
      urlInvalid: string;
    };
    help: string;
  };
  pane: {
    minimize: string;
    maximize: string;
    restore: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      projects: 'Projects',
      analytics: 'Analytics',
      reports: 'Reports',
      current: 'Current',
      switchToProject: 'Switch to this project',
      delete: 'Delete',
      add: 'Add',
      cancel: 'Cancel',
      save: 'Save',
      reset: 'Reset',
      close: 'Close',
      elements: 'Elements',
      nodes: 'Nodes',
      selected: 'Selected',
      live: 'Live',
    },
    header: {
      title: 'Smart',
      titleHighlight: 'BIM',
      user: 'Architect Doe',
    },
    chat: {
      title: 'AI Commander',
      subtitle: 'Powered by Gemini 2.5',
      welcome: 'Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.',
      error: 'I encountered an error connecting to the AI service. Please check your API key.',
      selected: 'Selected',
      actionApplied: 'Action',
      filterApplied: "I've applied the filter:",
      aiTools: 'AI Tools',
      placeholder: 'Ask AI to filter (e.g. \'Show beams\')...',
      suggestions: {
        isolateStructure: 'Isolate Structure',
        showLevel1: 'Show Level 1',
        resetView: 'Reset View',
      },
      quickActions: {
        analyzeStructure: 'Analyze Structure',
        mepCheck: 'MEP Check',
      },
    },
    graph: {
      title: 'Graph Viewer',
      layout: 'Layout',
      nodeInfo: 'Node Info',
      noSelection: 'No node selected',
      layouts: {
        force: 'Force',
        circular: 'Circular',
        hierarchical: 'Hierarchical',
      },
      nodeTypes: {
        element: 'Element',
        category: 'Category',
        property: 'Property',
      },
    },
    model: {
      title: 'Model Viewer',
      loading: 'Loading model...',
      noModel: 'No model loaded',
      status: 'Status',
    },
    project: {
      title: 'Projects',
      subtitle: 'Manage your Speckle projects',
      addProject: 'Add New Project',
      addProjectSubtitle: 'Add a new Speckle project',
      projectName: 'Project Name',
      speckleUrl: 'Speckle URL',
      description: 'Description',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this project?',
      noProjects: 'No Projects',
      noProjectsSubtitle: 'Click the + button in the top right to add your first project',
      addFirstProject: 'Add your first project',
      current: 'Current',
      switchToProject: 'Switch to this project',
      reset: 'Reset',
      optional: '(Optional)',
      placeholder: {
        name: 'e.g., Office Building BIM Model',
        url: 'https://app.speckle.systems/projects/...',
        description: 'Briefly describe this project...',
      },
      errors: {
        nameRequired: 'Project name cannot be empty',
        urlRequired: 'Speckle URL cannot be empty',
        urlInvalid: 'Please enter a valid Speckle URL',
      },
      help: 'Copy the embed URL from the Speckle project page',
    },
    pane: {
      minimize: 'Minimize',
      maximize: 'Maximize',
      restore: 'Restore',
    },
  },
  zh: {
    common: {
      projects: '项目',
      analytics: '分析',
      reports: '报告',
      current: '当前',
      switchToProject: '切换到此项目',
      delete: '删除',
      add: '添加',
      cancel: '取消',
      save: '保存',
      reset: '重置',
      close: '关闭',
      elements: '元素',
      nodes: '节点',
      selected: '已选择',
      live: '实时',
    },
    header: {
      title: '智能',
      titleHighlight: 'BIM',
      user: '建筑师',
    },
    chat: {
      title: 'AI 指挥官',
      subtitle: '由 Gemini 2.5 驱动',
      welcome: '您好！我是您的 BIM 助手。描述您想看到的内容，我会为您生成控制按钮。',
      error: '连接 AI 服务时遇到错误。请检查您的 API 密钥。',
      selected: '已选择',
      actionApplied: '操作',
      filterApplied: '我已应用过滤器：',
      aiTools: 'AI 工具',
      placeholder: '向 AI 询问过滤条件（例如：\'显示梁\'）...',
      suggestions: {
        isolateStructure: '隔离结构',
        showLevel1: '显示 1 层',
        resetView: '重置视图',
      },
      quickActions: {
        analyzeStructure: '分析结构',
        mepCheck: 'MEP 检查',
      },
    },
    graph: {
      title: '图谱查看器',
      layout: '布局',
      nodeInfo: '节点信息',
      noSelection: '未选择节点',
      layouts: {
        force: '力导向',
        circular: '圆形',
        hierarchical: '层次',
      },
      nodeTypes: {
        element: '元素',
        category: '类别',
        property: '属性',
      },
    },
    model: {
      title: '模型查看器',
      loading: '正在加载模型...',
      noModel: '未加载模型',
      status: '状态',
    },
    project: {
      title: '项目',
      subtitle: '管理您的 Speckle 项目',
      addProject: '添加新项目',
      addProjectSubtitle: '添加一个新的 Speckle 项目',
      projectName: '项目名称',
      speckleUrl: 'Speckle URL',
      description: '描述',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      confirmDelete: '确定要删除此项目吗？',
      noProjects: '暂无项目',
      noProjectsSubtitle: '点击右上角的 + 按钮添加您的第一个项目',
      addFirstProject: '添加您的第一个项目',
      current: '当前',
      switchToProject: '切换到此项目',
      reset: '重置',
      optional: '(可选)',
      placeholder: {
        name: '例如：办公楼 BIM 模型',
        url: 'https://app.speckle.systems/projects/...',
        description: '简要描述这个项目...',
      },
      errors: {
        nameRequired: '项目名称不能为空',
        urlRequired: 'Speckle URL 不能为空',
        urlInvalid: '请输入有效的 Speckle URL',
      },
      help: '请从 Speckle 项目页面复制 embed URL',
    },
    pane: {
      minimize: '最小化',
      maximize: '最大化',
      restore: '恢复',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'smartbim_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (stored as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
