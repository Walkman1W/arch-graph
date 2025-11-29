# 项目结构

## 根目录组织

```
/
├── components/          # React UI 组件
├── services/           # 外部 API 集成和业务逻辑
├── requeitment/        # 产品需求和文档
├── .kiro/              # Kiro IDE 配置和引导规则
├── App.tsx             # 主应用组件
├── index.tsx           # React 入口点
├── types.ts            # 集中的 TypeScript 类型定义
├── vite.config.ts      # Vite 打包工具配置
├── tsconfig.json       # TypeScript 编译器配置
└── .env.local          # 环境变量（不提交到版本控制）
```

## 组件架构

### `/components/`
所有 React 组件遵循扁平结构，命名清晰：

- **DashboardHeader.tsx**: 顶部导航和品牌标识
- **SpeckleViewer.tsx**: 3D BIM 模型查看器包装器（Speckle iframe 或 Three.js）
- **GraphViewer.tsx**: Neo4j 图谱可视化组件（Cytoscape.js/D3.js）
- **ControlPanel.tsx**: 右侧固定对话界面和聊天历史
- **SplitPaneContainer.tsx**: 左侧上下分屏容器，管理模型和图谱的布局
- **VoiceCommander.tsx**: 语音输入集成（可选）
- **GestureOverlay.tsx**: 手势识别 UI（可选）

**约定**:
- 每个文件一个组件
- PascalCase 命名，与组件名称匹配
- 使用 TypeScript 接口定义 props 的函数式组件
- Props 接口在组件内定义或从 `types.ts` 导入

### 三分屏布局结构

```
┌─────────────────────────────────────────────────┐
│              DashboardHeader                    │
├──────────────────────────────┬──────────────────┤
│                              │                  │
│   SpeckleViewer (上)         │                  │
│   可最大化/最小化             │  ControlPanel    │
├──────────────────────────────┤  (固定右侧)      │
│                              │                  │
│   GraphViewer (下)           │                  │
│   可最大化/最小化             │                  │
└──────────────────────────────┴──────────────────┘
```

## 服务层

### `/services/`
外部集成和 API 逻辑：

- **geminiService.ts**: Google Gemini AI 集成
  - 导出 `parseBIMQuery()` 函数
  - 处理结构化的 JSON schema 响应
  - 包含系统提示词和错误处理

**约定**:
- camelCase 文件命名，带 `Service` 后缀
- 导出命名函数（不使用默认导出）
- 所有 API 调用使用 Async/await
- 优雅的错误处理与降级响应

## 类型定义

### `types.ts`
所有 TypeScript 接口和枚举的唯一真实来源：

- **枚举**: `BIMOperation`, `GestureType`
- **接口**: `BIMQueryResponse`, `BIMActionPayload`, `BIMSuggestion`, `MockBIMElement`, `Message`

**约定**:
- 接口和枚举使用 PascalCase
- 枚举值使用 SCREAMING_SNAKE_CASE
- 仅共享类型（组件特定类型保留在组件文件中）

## 应用入口点

- **index.tsx**: React 根渲染，最小逻辑
- **App.tsx**: 主应用外壳
  - 布局结构（头部 + 主内容）
  - 过滤元素的状态管理
  - 命令处理逻辑
  - 模拟数据生成

## 配置文件

- **vite.config.ts**: 构建配置、路径别名、环境变量注入
- **tsconfig.json**: TypeScript 编译器选项、路径映射
- **package.json**: 依赖项和 npm 脚本

## 样式方法

- **Tailwind CSS**: 在 JSX 中直接使用实用类
- **无独立 CSS 文件**: 所有样式通过 className 内联
- **响应式设计**: 基于 Flexbox 的布局
- **调色板**: 基于 Slate 的中性主题，带强调色（蓝色、绿色）

## 数据流模式

```
用户输入 → ControlPanel → geminiService.parseBIMQuery() 
  → BIMQueryResponse → App.handleCommand() 
  → 过滤逻辑 → 更新 activeElements 
  → SpeckleViewer（视觉反馈）
```

## 新增结构（MVP 实现）

基于 PRD，将添加以下内容：

- `/services/neo4jService.ts` - Neo4j 连接和 Cypher 查询执行
- `/services/cypherGenerator.ts` - LLM 生成的 Cypher 查询处理
- `/utils/` - 空间分析和图谱数据处理的辅助函数
- `/hooks/` - 用于图数据和分屏状态的自定义 React hooks
- `/components/GraphViewer.tsx` - 图谱可视化组件（Cytoscape.js）
- `/components/SplitPaneContainer.tsx` - 分屏容器组件

## Neo4j 数据模型

### 节点类型
- `Project`: 项目根节点
- `Level`: 楼层
- `Space`: 空间/房间
- `Element`: 构件
- `System`: 机电系统
- `Pipe`: 管道
- `Duct`: 风管
- `Cable`: 电缆

### 关系类型
- `HAS_LEVEL`: Project → Level
- `CONTAINS`: Level → Space
- `HAS_ELEMENT`: Space → Element
- `PART_OF_SYSTEM`: Element → System
- `PASSES_THROUGH`: Pipe/Duct → Space
- `CONNECTED_TO`: Element ↔ Element
- `LOCATED_AT`: Element → Space
