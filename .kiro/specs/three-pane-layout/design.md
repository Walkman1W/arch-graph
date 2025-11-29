# 设计文档

## 概述

本设计文档描述了 Arch-Graph 三分屏布局系统的架构和实现方案。该系统实现了一个创新的用户界面，将 3D 模型查看器、图谱可视化和 LLM 对话界面整合在一个统一的、高度交互的布局中。

核心设计目标：
- 提供灵活的分屏布局，支持动态调整和状态管理
- 实现三个面板之间的实时数据联动和同步高亮
- 确保流畅的用户体验，所有交互响应时间 < 500ms
- 支持状态持久化，保存用户的布局偏好

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx (Root)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │         LayoutStateProvider (Context)             │  │
│  │  - dividerPosition                                │  │
│  │  - paneStates (maximized/minimized)               │  │
│  │  - selectedElements                               │  │
│  │  - highlightedElements                            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           DashboardHeader.tsx                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────┬──────────────────────────┤
│  │  SplitPaneContainer      │   ControlPanel           │
│  │  ┌────────────────────┐  │   - Chat Interface       │
│  │  │  ModelViewer       │  │   - Query Results        │
│  │  │  - Speckle/Three.js│  │   - Property Cards       │
│  │  │  - Selection       │  │   - Clear Button         │
│  │  │  - Highlight       │  │                          │
│  │  └────────────────────┘  │                          │
│  │  ═══ Divider ═══════════ │                          │
│  │  ┌────────────────────┐  │                          │
│  │  │  GraphViewer       │  │                          │
│  │  │  - Cytoscape.js    │  │                          │
│  │  │  - Node Selection  │  │                          │
│  │  │  - Layout          │  │                          │
│  │  └────────────────────┘  │                          │
│  └──────────────────────────┴──────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

### 数据流架构

```
User Interaction
      ↓
Event Handler (Component)
      ↓
LayoutStateProvider (Update State)
      ↓
React Context Propagation
      ↓
All Subscribed Components Re-render
      ↓
Sync Actions (Highlight, Focus, Zoom)
```

## 组件和接口

### 1. LayoutStateProvider（上下文提供者）

**职责**: 管理全局布局状态和选择状态

**接口**:
```typescript
interface LayoutState {
  // 分隔条位置 (0-1 之间的比例)
  dividerPosition: number;
  
  // 面板状态
  paneStates: {
    model: 'normal' | 'maximized' | 'minimized';
    graph: 'normal' | 'maximized' | 'minimized';
  };
  
  // 选中的元素
  selectedElements: Set<string>;
  
  // 高亮的元素
  highlightedElements: Map<string, HighlightStyle>;
  
  // 悬停预览的元素
  hoveredElement: string | null;
}

interface LayoutActions {
  setDividerPosition: (position: number) => void;
  maximizePane: (pane: 'model' | 'graph') => void;
  minimizePane: (pane: 'model' | 'graph') => void;
  restorePane: (pane: 'model' | 'graph') => void;
  resetLayout: () => void;
  selectElement: (elementId: string, source: 'model' | 'graph' | 'control') => void;
  highlightElements: (elementIds: string[], style: HighlightStyle) => void;
  clearHighlights: () => void;
  setHoveredElement: (elementId: string | null) => void;
}

interface HighlightStyle {
  color: string;
  category: 'space' | 'element' | 'system' | 'pipe';
  intensity: 'preview' | 'selected' | 'result';
}
```

### 2. SplitPaneContainer 组件

**职责**: 管理左侧上下分屏布局和拖动调整

**属性（Props）**:
```typescript
interface SplitPaneContainerProps {
  topPane: React.ReactNode;
  bottomPane: React.ReactNode;
  defaultSplitRatio?: number; // 默认 0.6
  minPaneHeight?: number; // 默认 0.2
  maxPaneHeight?: number; // 默认 0.8
}
```

**状态管理**:
- 监听 LayoutStateProvider 的 dividerPosition 和 paneStates
- 处理拖动事件，更新 dividerPosition
- 处理双击事件，重置为默认比例
- 应用 CSS transitions 实现平滑动画

### 3. ModelViewer 组件

**职责**: 渲染 3D BIM 模型，处理选择和高亮

**属性（Props）**:
```typescript
interface ModelViewerProps {
  speckleUrl?: string;
  elements: BIMElement[];
  selectedElements: Set<string>;
  highlightedElements: Map<string, HighlightStyle>;
  hoveredElement: string | null;
  onElementClick: (elementId: string) => void;
  onElementHover: (elementId: string | null) => void;
  paneState: 'normal' | 'maximized' | 'minimized';
}
```

**功能**:
- 集成 Speckle Viewer 或 Three.js
- 实现元素选择和高亮渲染
- 相机控制和动画（zoom, center, orbit）
- 性能优化：使用 instancing 和 LOD

### 4. GraphViewer 组件

**职责**: 渲染 Neo4j 图谱，处理节点选择和布局

**属性（Props）**:
```typescript
interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: 'normal' | 'maximized' | 'minimized';
  layoutMode: 'hierarchy' | 'force' | 'circular';
}

interface GraphNode {
  id: string;
  label: string;
  type: 'Project' | 'Level' | 'Space' | 'Element' | 'System' | 'Pipe' | 'Duct';
  properties: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PASSES_THROUGH' | 'CONNECTED_TO';
}
```

**功能**:
- 集成 Cytoscape.js 进行图谱渲染
- 支持多种布局算法
- 节点和边的样式定制
- 缩放、平移、节点展开/折叠

### 5. ControlPanel 组件

**职责**: 显示对话界面、查询结果和属性卡片

**属性（Props）**:
```typescript
interface ControlPanelProps {
  messages: Message[];
  queryResults: QueryResult[];
  selectedElementProperties: ElementProperties | null;
  onSendMessage: (message: string) => void;
  onResultClick: (resultId: string) => void;
  onClearHighlights: () => void;
}

interface QueryResult {
  id: string;
  type: 'space' | 'element' | 'system' | 'relationship';
  data: any;
  category: string;
}
```

## 数据模型

### BIMElement

```typescript
interface BIMElement {
  id: string;
  name: string;
  type: string;
  spaceId?: string;
  systemId?: string;
  geometry: {
    position: [number, number, number];
    boundingBox: BoundingBox;
  };
  properties: Record<string, any>;
}
```

### LayoutPreferences

```typescript
interface LayoutPreferences {
  dividerPosition: number;
  paneStates: {
    model: 'normal' | 'maximized' | 'minimized';
    graph: 'normal' | 'maximized' | 'minimized';
  };
  graphLayoutMode: 'hierarchy' | 'force' | 'circular';
  timestamp: number;
}
```

### SyncEvent

```typescript
interface SyncEvent {
  type: 'select' | 'highlight' | 'hover' | 'clear';
  source: 'model' | 'graph' | 'control';
  elementIds: string[];
  style?: HighlightStyle;
  timestamp: number;
}
```

## 正确性属性

*属性是指在系统的所有有效执行中都应该成立的特征或行为——本质上是关于系统应该做什么的正式声明。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*


### 布局属性

属性 1：宽度分配边界
*对于任意*视口宽度，左侧分屏区域应占据 70-75%，对话面板应占据 25-30%
**验证：需求 1.2**

属性 2：分隔条拖动约束
*对于任意*分隔条拖动操作，结果高度比例应遵守每个面板的最小值（20%）和最大值（80%）约束
**验证：需求 1.8, 1.9**

属性 3：双击重置
*对于任意*分隔条位置，双击分隔条应将高度比例重置为 60%/40%
**验证：需求 1.10**

属性 4：最大化互斥性
*对于任意*面板最大化操作，应该恰好有一个面板处于 100% 高度，另一个应处于工具栏状态
**验证：需求 1.12**

属性 5：最大化-恢复往返
*对于任意*初始布局状态，最大化面板然后恢复应返回到原始状态
**验证：需求 1.14**

属性 6：最小化互斥
*对于任意*最小化操作序列，至少有一个面板必须保持正常或最大化状态（两者不能同时最小化）
**验证：需求 1.16**

属性 7：状态持久化往返
*对于任意*布局状态（分隔条位置、面板状态），保存到本地存储并重新加载应恢复完全相同的状态
**验证：需求 1.18, 1.19**

### 同步属性

属性 8：模型到图谱同步
*对于任意*在模型查看器中点击的元素，图谱查看器中对应的节点应被高亮并居中
**验证：需求 2.1, 2.3**

属性 9：图谱到模型同步
*对于任意*在图谱查看器中点击的节点，模型查看器中对应的元素应被高亮且相机应聚焦到它
**验证：需求 2.5, 2.7**

属性 10：双向同步一致性
*对于任意*元素，在模型查看器中点击它然后在图谱查看器中点击对应节点应保持一致的选择状态
**验证：需求 2.1, 2.5**

属性 11：空间节点展开
*对于任意*在图谱查看器中点击的空间节点，所有具有该 spaceId 的元素应在模型查看器中被高亮
**验证：需求 2.8**

属性 12：系统节点展开
*对于任意*在图谱查看器中点击的系统节点，所有具有该 systemId 的元素应在模型查看器中被高亮
**验证：需求 2.9**

属性 13：查询结果高亮
*对于任意*查询结果集，所有匹配的元素 ID 应在模型查看器和图谱查看器中被高亮
**验证：需求 2.10, 2.11**

属性 14：清除高亮重置
*对于任意*高亮状态，点击清除按钮应移除所有高亮并返回默认视图
**验证：需求 2.14**

属性 15：同步性能
*对于任意*同步操作（选择、高亮、聚焦），操作应在 500 毫秒内完成
**验证：需求 2.15**

属性 16：视图变化时高亮持久化
*对于任意*高亮状态和面板状态变化（最大化/最小化），高亮应在活动面板中保持可见
**验证：需求 2.16**

属性 17：悬停预览不干扰
*对于任意*元素悬停，预览高亮应出现而不改变当前选择状态
**验证：需求 2.19**

属性 18：事件发射完整性
*对于任意*选择变化，应发出包含正确元素 ID 和源信息的自定义事件
**验证：需求 2.20**

## 错误处理

### 布局错误

1. **无效的分隔条位置**
   - 验证：将分隔条位置限制在 [0.2, 0.8] 范围内
   - 降级：如果检测到无效值，重置为默认值 0.6

2. **损坏的本地存储**
   - 检测：在 JSON.parse 周围使用 try-catch
   - 降级：使用默认布局配置
   - 日志：将错误记录到控制台以便调试

3. **同时最小化尝试**
   - 预防：当另一个面板已经最小化时禁用最小化按钮
   - UI 反馈：显示工具提示解释为什么按钮被禁用

### 同步错误

1. **元素未找到**
   - 场景：元素 ID 在一个视图中存在但在另一个视图中不存在
   - 处理：记录警告，跳过该元素的同步，继续处理其他元素
   - UI 反馈：在对话面板中显示细微通知

2. **同步超时**
   - 检测：监控同步操作持续时间
   - 处理：如果 > 500ms，取消操作并显示警告
   - 降级：允许用户重试或清除状态

3. **图谱布局失败**
   - 场景：Cytoscape.js 无法计算布局
   - 处理：捕获错误，尝试降级布局算法
   - UI 反馈：显示错误消息并提供重新加载选项

4. **相机动画失败**
   - 场景：Three.js 相机动画失败
   - 处理：直接跳转到目标位置，不使用动画
   - 日志：记录错误以便调试

## 测试策略

### 单元测试

**框架**：Vitest + React Testing Library

**测试覆盖**：

1. **LayoutStateProvider 测试**
   - 使用默认值进行状态初始化
   - 通过操作进行状态更新
   - 本地存储保存/加载
   - 上下文值传播

2. **SplitPaneContainer 测试**
   - Divider drag calculations
   - Constraint enforcement (min/max)
   - Double-click reset
   - Pane state transitions

3. **Synchronization Logic Tests**
   - Element ID mapping (model ↔ graph)
   - Highlight style application
   - Event emission
   - Clear operations

**Example Unit Test**:
```typescript
describe('LayoutStateProvider', () => {
  it('should enforce minimum pane height constraint', () => {
    const { result } = renderHook(() => useLayoutState());
    act(() => {
      result.current.setDividerPosition(0.1); // Try to set below minimum
    });
    expect(result.current.dividerPosition).toBe(0.2); // Should be clamped
  });
});
```

### 基于属性的测试

**框架**：fast-check（JavaScript 属性测试库）

**配置**：每个属性测试应至少运行 100 次迭代

**测试覆盖**：

1. **布局约束属性**
   - 生成随机视口大小，验证宽度分配
   - 生成随机拖动位置，验证约束
   - 生成随机状态序列，验证不变量

2. **同步属性**
   - 生成随机元素选择，验证同步
   - 生成随机查询结果，验证高亮
   - 生成随机状态变化，验证持久化

**属性测试示例**：
```typescript
import fc from 'fast-check';

describe('布局属性', () => {
  it('属性 2：分隔条拖动约束', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1 }), // 随机拖动位置
        (dragPosition) => {
          const result = calculatePaneHeights(dragPosition);
          return result.top >= 0.2 && result.top <= 0.8 &&
                 result.bottom >= 0.2 && result.bottom <= 0.8;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

**框架**：Playwright

**测试场景**：

1. **端到端布局交互**
   - 加载应用，验证初始布局
   - 拖动分隔条，验证平滑过渡
   - 最大化/最小化面板，验证动画
   - 重新加载应用，验证状态恢复

2. **端到端同步**
   - 在模型中点击元素，验证图谱高亮
   - 在图谱中点击节点，验证模型高亮
   - 提交查询，验证所有面板中的结果
   - 清除高亮，验证重置

3. **性能测试**
   - 测量同步操作持续时间
   - 验证所有操作 < 500ms
   - 使用大型数据集测试（1000+ 元素）

### 手动测试清单

- [ ] 不同屏幕尺寸的响应式布局（1920x1080, 1366x768, 2560x1440）
- [ ] 所有状态转换的平滑动画
- [ ] 键盘快捷键（Escape 清除）
- [ ] 无障碍：键盘导航、屏幕阅读器支持
- [ ] 浏览器兼容性（Chrome、Firefox、Safari、Edge）

## 性能考虑

### 优化策略

1. **React 优化**
   - 对昂贵的组件使用 `React.memo`
   - 对计算值使用 `useMemo`（高亮样式、过滤节点）
   - 对事件处理器使用 `useCallback`
   - 为大型结果列表实现虚拟滚动

2. **3D 渲染优化**
   - 对重复几何体使用 Three.js 实例化
   - 为远距离对象实现 LOD（细节层次）
   - 视锥剔除以跳过屏幕外元素
   - 在拖动操作期间对相机更新进行防抖

3. **图谱渲染优化**
   - 限制可见节点（仅显示相关子图）
   - 对批量更新使用 Cytoscape.js 批处理操作
   - 为大型图谱实现节点聚类
   - 缓存布局计算

4. **状态管理优化**
   - 对本地存储写入进行防抖（最多每 500ms 保存一次）
   - 使用 Set 和 Map 进行 O(1) 查找
   - 使用 React 18 自动批处理进行批量状态更新

### 性能目标

- 初始加载：< 2 秒
- 分隔条拖动：60 FPS（每帧 16.67ms）
- 元素选择同步：< 500ms
- 面板最大化/最小化动画：300ms
- 图谱布局计算：500 个节点 < 1 秒

## 无障碍

### WCAG 2.1 AA 合规

1. **键盘导航**
   - Tab 键遍历所有交互元素
   - 箭头键导航图谱节点
   - Escape 键清除选择
   - Space/Enter 键激活按钮

2. **屏幕阅读器支持**
   - 为所有按钮和控件添加 ARIA 标签
   - 为动态内容更新添加 ARIA 实时区域
   - 语义化 HTML 结构

3. **视觉无障碍**
   - 文本最小对比度 4.5:1
   - 所有交互元素的焦点指示器
   - 高亮使用色盲友好的调色板
   - 可调整文本大小而不破坏布局

4. **运动无障碍**
   - 大型点击目标（最小 44x44px）
   - 拖动操作有键盘替代方案
   - 不需要基于时间的交互

## 未来增强

1. **多显示器支持**
   - 将面板分离到单独的窗口
   - 跨窗口同步状态

2. **自定义布局**
   - 保存多个布局预设
   - 在预设之间快速切换

3. **高级过滤**
   - 按节点类型过滤图谱
   - 按系统/楼层过滤模型

4. **协作功能**
   - 与其他用户共享选择
   - 实时光标位置

5. **移动支持**
   - 拖动操作的触摸手势
   - 平板电脑的响应式布局
