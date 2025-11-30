# GraphViewer 组件实现文档

## 概述

GraphViewer 组件是三分屏布局系统中的核心组件之一，负责渲染 Neo4j 图数据库的节点和关系。该组件基于 Cytoscape.js 实现，支持多种布局算法、节点选择、高亮显示和交互式探索。

## 依赖安装

### 必需依赖

```bash
npm install cytoscape
npm install @types/cytoscape --save-dev
```

### 可选依赖（增强功能）

```bash
# 额外的布局算法
npm install cytoscape-cola
npm install cytoscape-dagre

# 导出功能
npm install cytoscape-svg
```

### HTML 引入方式（临时测试）

如果暂时不想安装 npm 包，可以在 `index.html` 中添加：

```html
<script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
```

## 功能特性

### 1. 图谱渲染

- **节点类型**: 支持 Project、Level、Space、Element、System、Pipe、Duct 等类型
- **边类型**: 支持 HAS_LEVEL、CONTAINS、HAS_ELEMENT、PASSES_THROUGH、CONNECTED_TO 等关系
- **样式定制**: 不同节点类型使用不同的颜色和形状
- **自动布局**: 支持层次、力导向、圆形三种布局算法

### 2. 交互功能

- **节点点击**: 选择节点并触发同步
- **节点悬停**: 显示节点信息预览
- **缩放平移**: 支持鼠标滚轮缩放和拖拽平移
- **节点展开**: 自动显示选中节点的一度关系

### 3. 高亮和选择

- **选择状态**: 通过 `selectedNodes` Set 管理
- **高亮样式**: 通过 `highlightedNodes` Map 应用不同样式
- **强度级别**: 支持 preview、selected、result 三种强度
- **自动聚焦**: 选中节点时自动居中和缩放

### 4. 布局算法

- **Hierarchy (层次布局)**: 适合树形结构，清晰展示层级关系
- **Force (力导向布局)**: 适合复杂网络，自动优化节点位置
- **Circular (圆形布局)**: 适合环形结构，节点均匀分布

### 5. 视觉元素

- **状态指示器**: 显示节点数量和选择状态
- **节点信息卡片**: 显示选中节点的详细信息
- **悬停预览**: 悬停时显示节点名称
- **图例**: 显示不同节点类型的颜色含义
- **布局控制器**: 切换不同布局算法

## 组件接口

### Props

```typescript
interface GraphViewerProps {
  nodes: GraphNode[];                               // 图节点数组
  edges: GraphEdge[];                               // 图边数组
  selectedNodes: Set<string>;                       // 选中的节点 ID 集合
  highlightedNodes: Map<string, HighlightStyle>;    // 高亮节点及其样式
  hoveredNode: string | null;                       // 当前悬停的节点 ID
  onNodeClick: (nodeId: string) => void;            // 节点点击回调
  onNodeHover: (nodeId: string | null) => void;     // 节点悬停回调
  paneState: PaneState;                             // 面板状态
  layoutMode?: LayoutMode;                          // 布局模式（可选）
}
```

### GraphNode 接口

```typescript
interface GraphNode {
  id: string;                                       // 唯一标识符
  label: string;                                    // 节点标签
  type: 'Project' | 'Level' | 'Space' | 'Element' | 'System' | 'Pipe' | 'Duct';
  properties: Record<string, any>;                  // 自定义属性
}
```

### GraphEdge 接口

```typescript
interface GraphEdge {
  id: string;                                       // 唯一标识符
  source: string;                                   // 源节点 ID
  target: string;                                   // 目标节点 ID
  type: 'HAS_LEVEL' | 'CONTAINS' | 'HAS_ELEMENT' | 'PASSES_THROUGH' | 'CONNECTED_TO';
}
```

### LayoutMode 类型

```typescript
type LayoutMode = 'hierarchy' | 'force' | 'circular';
```

## 核心功能实现

### 1. Cytoscape 初始化

```typescript
useEffect(() => {
  if (!containerRef.current) return;

  if (typeof window !== 'undefined' && (window as any).cytoscape) {
    const cy = (window as any).cytoscape({
      container: containerRef.current,
      style: getCytoscapeStyles(),
      layout: getLayoutConfig(currentLayout),
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    cyRef.current = cy;

    // 添加事件监听器
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      handleNodeClick(node.id());
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }
}, []);
```

### 2. 图数据更新

```typescript
useEffect(() => {
  if (!cyRef.current) return;

  const cy = cyRef.current;

  // 转换为 Cytoscape 格式
  const elements = [
    ...nodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        ...node.properties,
      },
    })),
    ...edges.map(edge => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      },
    })),
  ];

  cy.elements().remove();
  cy.add(elements);
  cy.layout(getLayoutConfig(currentLayout)).run();
}, [nodes, edges, currentLayout]);
```

### 3. 高亮应用

```typescript
useEffect(() => {
  if (!cyRef.current) return;

  const cy = cyRef.current;

  // 重置所有节点样式
  cy.nodes().removeClass('highlighted selected preview');

  // 应用高亮样式
  highlightedNodes.forEach((style, nodeId) => {
    const node = cy.getElementById(nodeId);
    if (node.length > 0) {
      const className = style.intensity === 'preview' ? 'preview' : 
                       style.intensity === 'selected' ? 'selected' : 'highlighted';
      node.addClass(className);
      node.style('background-color', style.color);
    }
  });
}, [highlightedNodes, selectedNodes]);
```

### 4. 自动聚焦

```typescript
useEffect(() => {
  if (!cyRef.current || selectedNodes.size === 0) return;

  const cy = cyRef.current;
  const selectedElements = cy.collection();

  selectedNodes.forEach(nodeId => {
    const node = cy.getElementById(nodeId);
    if (node.length > 0) {
      selectedElements.merge(node);
    }
  });

  if (selectedElements.length > 0) {
    // 居中并缩放到选中节点
    cy.animate({
      fit: {
        eles: selectedElements,
        padding: 50,
      },
      duration: 500,
      easing: 'ease-in-out',
    });

    // 展开节点显示一度关系
    selectedElements.forEach((node: any) => {
      expandNode(node.id());
    });
  }
}, [selectedNodes]);
```

### 5. 节点展开

```typescript
const expandNode = (nodeId: string) => {
  if (!cyRef.current) return;

  const cy = cyRef.current;
  const node = cy.getElementById(nodeId);

  if (node.length > 0) {
    // 显示相连节点
    const neighbors = node.neighborhood();
    neighbors.style('display', 'element');

    setExpandedNodes(prev => new Set(prev).add(nodeId));
  }
};
```

### 6. 布局配置

```typescript
const getLayoutConfig = (mode: LayoutMode) => {
  switch (mode) {
    case 'hierarchy':
      return {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 500,
      };
    case 'force':
      return {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
      };
    case 'circular':
      return {
        name: 'circle',
        animate: true,
        animationDuration: 500,
        spacingFactor: 1.5,
      };
    default:
      return { name: 'breadthfirst' };
  }
};
```

## 节点样式配置

### 节点类型颜色

| 类型 | 颜色 | 形状 |
|------|------|------|
| Project | #8B5CF6 (紫色) | 菱形 |
| Level | #3B82F6 (蓝色) | 矩形 |
| Space | #10B981 (绿色) | 圆角矩形 |
| Element | #F59E0B (橙色) | 椭圆 |
| System | #EF4444 (红色) | 六边形 |
| Pipe | #06B6D4 (青色) | 圆形 |
| Duct | #EC4899 (粉色) | 圆形 |

### 边类型颜色

| 类型 | 颜色 |
|------|------|
| HAS_LEVEL | #3B82F6 (蓝色) |
| CONTAINS | #10B981 (绿色) |
| HAS_ELEMENT | #F59E0B (橙色) |
| PASSES_THROUGH | #CBD5E1 (灰色) |
| CONNECTED_TO | #CBD5E1 (灰色) |

## 使用示例

### 基本使用

```typescript
import GraphViewer from './components/GraphViewer';
import { useLayoutState } from './contexts/LayoutStateProvider';

function App() {
  const {
    selectedElements,
    highlightedElements,
    hoveredElement,
    selectElement,
    setHoveredElement,
    paneStates,
  } = useLayoutState();

  // 将元素 ID 转换为节点 ID
  const selectedNodes = new Set(
    Array.from(selectedElements).map(id => `node-${id}`)
  );

  return (
    <GraphViewer
      nodes={graphNodes}
      edges={graphEdges}
      selectedNodes={selectedNodes}
      highlightedNodes={highlightedElements}
      hoveredNode={hoveredElement}
      onNodeClick={(id) => selectElement(id, 'graph')}
      onNodeHover={setHoveredElement}
      paneState={paneStates.graph}
      layoutMode="hierarchy"
    />
  );
}
```

### 与 LayoutStateProvider 集成

```typescript
import { LayoutStateProvider } from './contexts/LayoutStateProvider';

function App() {
  return (
    <LayoutStateProvider>
      <GraphViewer
        nodes={nodes}
        edges={edges}
        selectedNodes={selectedNodes}
        highlightedNodes={highlightedNodes}
        hoveredNode={hoveredNode}
        onNodeClick={(id) => selectElement(id, 'graph')}
        onNodeHover={setHoveredElement}
        paneState={paneStates.graph}
      />
    </LayoutStateProvider>
  );
}
```

## 性能优化

### 1. React 优化

- 使用 `useCallback` 包装事件处理器
- 使用 `useRef` 存储 Cytoscape 实例
- 精确控制 `useEffect` 依赖数组

### 2. Cytoscape 优化

- 使用批量操作更新多个节点
- 限制可见节点数量（大型图谱）
- 实现节点聚类（1000+ 节点）
- 缓存布局计算结果

### 3. 渲染优化

- 使用 CSS 类而非内联样式
- 减少不必要的重新布局
- 使用动画缓动函数提升体验

## 验证需求

该组件实现满足以下需求：

- ✅ **需求 2.5**: 图谱查看器中点击节点时，模型查看器高亮对应元素
- ✅ **需求 2.6**: 图谱查看器中点击节点时，对话面板显示属性卡片
- ✅ **需求 2.7**: 图谱查看器中点击节点时，模型查看器相机聚焦到对应元素
- ✅ **需求 2.8**: 图谱查看器中点击空间节点时，模型查看器高亮该空间内所有元素
- ✅ **需求 2.9**: 图谱查看器中点击系统节点时，模型查看器高亮该系统的所有元素
- ✅ **需求 2.19**: 悬停时显示预览高亮，不改变选择状态

## 常见问题

### Q: Cytoscape.js 未加载怎么办？

A: 确保已安装依赖：
```bash
npm install cytoscape
```

或在 `index.html` 中添加 CDN 链接：
```html
<script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
```

### Q: 如何添加更多布局算法？

A: 安装额外的布局扩展：
```bash
npm install cytoscape-cola cytoscape-dagre
```

然后在组件中注册：
```typescript
import cola from 'cytoscape-cola';
cytoscape.use(cola);
```

### Q: 如何优化大型图谱性能？

A: 
1. 限制初始显示的节点数量
2. 实现按需加载（点击展开）
3. 使用节点聚类
4. 禁用动画（大型图谱）

### Q: 如何导出图谱为图片？

A: 使用 Cytoscape 的导出功能：
```typescript
const png = cy.png({ full: true });
// 下载或显示 PNG
```

## 后续改进

1. **高级布局**: 集成 Cola、Dagre 等高级布局算法
2. **节点聚类**: 实现大型图谱的节点聚类
3. **搜索功能**: 添加节点搜索和过滤
4. **路径高亮**: 高亮两个节点之间的最短路径
5. **导出功能**: 支持导出为 PNG、SVG、JSON
6. **小地图**: 添加缩略图导航
7. **上下文菜单**: 右键菜单提供更多操作
8. **动画效果**: 添加节点出现和消失的动画

## 测试建议

### 单元测试

- 测试节点和边的数据转换
- 测试布局配置生成
- 测试事件处理器调用

### 集成测试

- 测试与 LayoutStateProvider 的集成
- 测试选择状态同步
- 测试布局切换功能

### 端到端测试

- 测试完整的用户交互流程
- 测试大型图谱的性能
- 测试不同布局算法的效果
