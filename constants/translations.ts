export type Translations = {
  en: typeof translations.en;
  zh: typeof translations.zh;
};

const translations = {
  en: {
    // Header
    header: {
      title: 'Smart',
      titleHighlight: 'BIM',
      projects: 'Projects',
      analytics: 'Analytics',
      reports: 'Reports',
      userName: 'Architect Doe',
    },
    // Language Switch
    language: {
      switch: '中/EN',
      en: 'English',
      zh: '中文',
    },
    // Model Viewer (Speckle)
    modelViewer: {
      title: '3D Model Viewer',
      liveModel: 'Live Model',
      visibility: 'Visibility',
      elements: 'Elements',
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
    },
    // Pane Controls
    pane: {
      maximize: 'Maximize',
      minimize: 'Minimize',
      restore: 'Restore',
    },
    // Graph Viewer
    graphViewer: {
      title: 'Graph Visualization',
      placeholder: 'Cytoscape.js graph will be implemented in Task 6',
      comingSoon: 'Coming Soon',
    },
    // Control Panel (AI Commander)
    controlPanel: {
      title: 'AI Commander',
      subtitle: 'Powered by Gemini 2.5',
      welcomeMessage: "Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.",
      suggestions: {
        isolateStructure: 'Isolate Structure',
        showLevel1: 'Show Level 1',
        resetView: 'Reset View',
      },
      aiTools: 'AI Tools',
      analyzeStructure: 'Analyze Structure',
      mepCheck: 'MEP Check',
      inputPlaceholder: "Ask AI to filter (e.g. 'Show beams')...",
      microphoneTooltip: 'Toggle Microphone',
      sendTooltip: 'Send Message',
      processing: 'Processing...',
      errorMessage: "I encountered an error connecting to the AI service. Please check your API key.",
      actionApplied: 'Action applied',
      selected: 'Selected',
      filterApplied: "I've applied the filter",
    },
    // Project Modal
    projectModal: {
      title: {
        view: 'Project Management',
        add: 'Add New Project',
      },
      subtitle: {
        view: 'Manage your BIM projects',
        add: 'Add a new Speckle project',
      },
      emptyState: {
        title: 'No Projects',
        description: 'Click the + button to add your first project',
      },
      current: 'Current',
      switchProject: 'Switch to this project',
      delete: 'Delete',
      form: {
        name: 'Project Name',
        nameRequired: 'Project name is required',
        speckleUrl: 'Speckle Embed URL',
        urlRequired: 'Speckle URL is required',
        urlInvalid: 'Please enter a valid Speckle URL',
        description: 'Description',
        descriptionOptional: '(Optional)',
        namePlaceholder: 'e.g., Office Building BIM Model',
        urlPlaceholder: 'https://app.speckle.systems/projects/...',
        descriptionPlaceholder: 'Briefly describe this project...',
      },
      buttons: {
        add: 'Add Project',
        reset: 'Reset',
        addNew: 'Add New Project',
      },
    },
    // Common
    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
  zh: {
    // Header
    header: {
      title: 'Smart',
      titleHighlight: 'BIM',
      projects: '项目',
      analytics: '分析',
      reports: '报告',
      userName: '建筑师 Doe',
    },
    // Language Switch
    language: {
      switch: '中/EN',
      en: 'English',
      zh: '中文',
    },
    // Model Viewer (Speckle)
    modelViewer: {
      title: '3D 模型查看器',
      liveModel: '实时模型',
      visibility: '可见性',
      elements: '元素',
      status: {
        active: '活跃',
        inactive: '非活跃',
      },
    },
    // Pane Controls
    pane: {
      maximize: '最大化',
      minimize: '最小化',
      restore: '恢复',
    },
    // Graph Viewer
    graphViewer: {
      title: '图谱可视化',
      placeholder: 'Cytoscape.js 图谱将在任务 6 中实现',
      comingSoon: '即将推出',
    },
    // Control Panel (AI Commander)
    controlPanel: {
      title: 'AI 指挥官',
      subtitle: '由 Gemini 2.5 驱动',
      welcomeMessage: "你好！我是你的 BIM 助手。描述你想看到的内容，我将为你生成控制指令。",
      suggestions: {
        isolateStructure: '隔离结构',
        showLevel1: '显示第一层',
        resetView: '重置视图',
      },
      aiTools: 'AI 工具',
      analyzeStructure: '分析结构',
      mepCheck: 'MEP 检查',
      inputPlaceholder: "让 AI 过滤（例如：'显示梁'）...",
      microphoneTooltip: '切换麦克风',
      sendTooltip: '发送消息',
      processing: '处理中...',
      errorMessage: "连接 AI 服务时出错。请检查您的 API 密钥。",
      actionApplied: '操作已应用',
      selected: '已选择',
      filterApplied: "我已应用过滤器",
    },
    // Project Modal
    projectModal: {
      title: {
        view: '项目管理',
        add: '添加新项目',
      },
      subtitle: {
        view: '管理您的 BIM 项目',
        add: '添加一个新的 Speckle 项目',
      },
      emptyState: {
        title: '暂无项目',
        description: '点击右上角的 + 按钮添加您的第一个项目',
      },
      current: '当前',
      switchProject: '切换到此项目',
      delete: '删除',
      form: {
        name: '项目名称',
        nameRequired: '项目名称不能为空',
        speckleUrl: 'Speckle 嵌入 URL',
        urlRequired: 'Speckle URL 不能为空',
        urlInvalid: '请输入有效的 Speckle URL',
        description: '项目描述',
        descriptionOptional: '（可选）',
        namePlaceholder: '例如：办公楼 BIM 模型',
        urlPlaceholder: 'https://app.speckle.systems/projects/...',
        descriptionPlaceholder: '简要描述这个项目...',
      },
      buttons: {
        add: '添加项目',
        reset: '重置',
        addNew: '添加新项目',
      },
    },
    // Common
    common: {
      close: '关闭',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
  },
};

export default translations;
