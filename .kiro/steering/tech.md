# 技术栈

## 构建系统

- **打包工具**: Vite 6.2.0
- **包管理器**: npm
- **编程语言**: TypeScript 5.8.2
- **模块系统**: ESNext，目标为 ES2022

## 前端技术栈

### 核心框架
- **React 19.2.0** 配合 React DOM
- **JSX 转换**: 自动模式 (`react-jsx`)
- **TypeScript**: 严格模式，启用实验性装饰器

### UI 与样式
- **Tailwind CSS**: 实用优先的样式系统（从组件类名推断）
- **组件架构**: 使用 Hooks 的函数式组件

### 3D 可视化
- **Speckle Viewer**: 主要的 BIM 模型查看器（嵌入式 iframe）
- **Three.js**: 用于高级 3D 交互、路径可视化和动画

### 图数据库与可视化
- **Neo4j**: 图数据库，存储建筑语义和空间关系
  - 使用 Neo4j AuraDB（云）或本地 Neo4j 实例
  - 通过 Neo4j JavaScript Driver 连接
- **Cytoscape.js**: 图谱可视化库，展示节点和关系
  - 支持多种布局算法（层次、力导向等）
  - 交互式节点点击和缩放

### AI 集成
- **Google Generative AI SDK** (`@google/genai` v1.30.0)
- **模型**: Gemini 2.5 Flash
- **结构化输出**: 基于 JSON schema 的类型安全响应

## 架构模式

### 状态管理
- React hooks (`useState`, `useEffect`)
- 基于 Props 的组件通信
- 无外部状态管理库（不使用 Redux/Zustand）

### 类型系统
- 在 `types.ts` 中集中定义类型
- 基于枚举的操作类型 (`BIMOperation`)
- API 响应的严格接口约定

### 服务层
- 专用服务模块 (`services/geminiService.ts`)
- API 调用使用 Async/await 模式
- 结构化错误处理与降级响应

## 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器，端口 3000
```

### 构建与部署
```bash
npm run build        # 生产环境构建
npm run preview      # 预览生产构建
```

### 初始化
```bash
npm install          # 安装依赖
```

## 环境配置

- **API 密钥**: 存储在 `.env.local`
- **必需变量**: 
  - `GEMINI_API_KEY`: Google Gemini API 密钥
  - `NEO4J_URI`: Neo4j 数据库连接 URI
  - `NEO4J_USER`: Neo4j 用户名
  - `NEO4J_PASSWORD`: Neo4j 密码
- **Vite 配置**: 将环境变量暴露为 `process.env.*`

## 开发服务器

- **端口**: 3000
- **主机**: 0.0.0.0（可在网络上访问）
- **热重载**: 通过 Vite HMR 启用

## 路径别名

- `@/*` 映射到项目根目录，便于更清晰的导入
