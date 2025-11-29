# 实现指南

## 当前项目状态

Arch-Graph 是一个 BIM 图数据库智能助手，目前处于 MVP 开发阶段。

## 已完成的 Specs

### 1. three-pane-layout (三分屏布局系统)

**状态**: 规划完成，待实现

**位置**: `.kiro/specs/three-pane-layout/`

**概述**: 实现创新的三分屏界面布局，包括：
- 左上：3D 模型查看器（可最大化/最小化）
- 左下：图谱可视化（可最大化/最小化）
- 右侧：固定对话面板

**核心功能**:
- 可拖动调整的分隔条
- 面板最大化/最小化
- 三向数据联动（模型 ↔ 图谱 ↔ 对话）
- 状态持久化
- 性能优化（< 500ms 同步）

**开始实现**: 打开 `.kiro/specs/three-pane-layout/tasks.md`，点击任务旁的 "Start task" 按钮

## 待创建的 Specs

基于 PRD 文档，以下是建议的后续 specs：

### 2. neo4j-integration (Neo4j 图数据库集成)

**优先级**: 高

**范围**:
- Neo4j 连接和认证
- 图数据模型定义（节点类型、关系类型）
- Cypher 查询执行
- 数据导入/导出

### 3. graph-visualization (图谱可视化)

**优先级**: 高

**范围**:
- Cytoscape.js 集成
- 多种布局算法（层次、力导向、圆形）
- 节点和边的样式定制
- 交互功能（缩放、平移、选择）

### 4. llm-cypher-generation (LLM Cypher 查询生成)

**优先级**: 高

**范围**:
- 自然语言 → Cypher 转换
- Gemini API 集成
- 查询验证和优化
- 错误处理和降级

### 5. spatial-analysis (空间分析功能)

**优先级**: 中

**范围**:
- 空间查询（每层空间分析）
- 路径规划（A* 算法）
- 管线穿越分析
- 空间关系计算

### 6. model-import (BIM 模型导入)

**优先级**: 中

**范围**:
- IFC 文件解析
- Revit 数据提取
- 模型 → 图数据库映射
- ETL 流程

## 实现顺序建议

1. **three-pane-layout** (当前) - 建立 UI 基础
2. **neo4j-integration** - 建立数据基础
3. **graph-visualization** - 完成图谱显示
4. **llm-cypher-generation** - 实现智能查询
5. **spatial-analysis** - 添加高级功能
6. **model-import** - 完成数据导入

## 开发工作流

1. **创建 Spec**: 使用 Kiro 创建新的 spec（requirements → design → tasks）
2. **执行任务**: 打开 tasks.md，逐个执行任务
3. **测试验证**: 运行测试确保正确性
4. **迭代改进**: 根据反馈调整和优化

## 技术栈提醒

- **前端**: React 19 + TypeScript + Tailwind CSS
- **3D**: Speckle Viewer + Three.js
- **图谱**: Cytoscape.js
- **数据库**: Neo4j
- **AI**: Google Gemini 2.5 Flash
- **测试**: Vitest + fast-check + Playwright

## 环境变量

确保 `.env.local` 包含：
```
GEMINI_API_KEY=your_key_here
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
```
