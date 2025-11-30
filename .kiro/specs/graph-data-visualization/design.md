# Graph Data Visualization - Design

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         GraphDataSyncContext                     │  │
│  │  - selectedNodes: string[]                       │  │
│  │  - selectedEdges: string[]                       │  │
│  │  - graphData: GraphData                          │  │
│  │  - syncFromGraph(nodeIds)                        │  │
│  │  - syncFromModel(elementIds)                     │  │
│  │  - syncFromChat(queryResult)                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┬──────────────┬──────────────────┐   │
│  │ SpeckleViewer│ GraphViewer  │  ControlPanel    │   │
│  │              │              │                  │   │
│  │ - highlight  │ - highlight  │  - display       │   │
│  │   elements   │   nodes      │    results       │   │
│  └──────────────┴──────────────┴──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 核心模块设计

### 1. 虚拟数据生成器 (`services/mockGraphData.ts`)

**职责**: 生成符合语义分层模型的虚拟图数据

```typescript
// 数据生成器接口
interface MockGraphDataGenerator {
  generateScenario(scenarioName: string): GraphData;
  generateBuilding(floors: number): GraphData;
  generateFloor(floorNumber: number): GraphData;
}

// 场景类型
type ScenarioType = 
  | 'simple-building'      // 简单建筑（3层，每层3个空间）
  | 'mep-system'           // 机电系统（管线穿越）
  | 'path-finding'         // 路径查找（连通性）
  | 'full-building';       // 完整建筑（所有关系）

// 虚拟数据结构
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    scenario: string;
    nodeCount: number;
    edgeCount: number;
    relationshipTypes: EdgeType[];
  };
}
```

**实现策略**:

1. **节点生成规则**:
   - 每层生成 3-5 个空间节点
   - 每个空间生成 1-2 个 MEP 构件
   - 每 3-4 个构件归属一个系统
   - 楼层节点作为层级根节点

2. **关系生成规则**:
   - 相邻空间自动生成 ADJACENT_TO
   - 管线随机穿越 2-4 个空间（CROSSES）
   - 构件自动关联到系统（BELONGS_TO_SYSTEM）
   - 所有空间关联到楼层（ON_LEVEL）

3. **数据一致性**:
   - globalId 使用 UUID
   - levelCode 格式统一（1F, 2F, 3F）
   - 标签使用中文（电房、走廊、机房）
   - bbox 使用合理的坐标范围

### 2. 图数据同步服务 (`contexts/GraphDataSyncContext.tsx`)

**职责**: 管理三向数据联动状态

```typescript
interface GraphDataSyncContextValue {
  // 状态
  graphData: GraphData;
  selectedNodes: string[];
  selectedEdges: string[];
  highlightedElements: string[];
  
  // 同步方法
  syncFromGraph: (nodeIds: string[]) => void;
  syncFromModel: (elementIds: string[]) => void;
  syncFromChat: (queryResult: QueryResult) => void;
  
  // 数据操作
  loadScenario: (scenario: ScenarioType) => void;
  filterByType: (nodeType: NodeType) => void;
  expandNeighbors: (nodeId: string) => void;
}

// 同步逻辑
class GraphDataSyncService {
  // 图谱 → 模型
  syncGraphToModel(nodeIds: string[]): string[] {
    // 1. 从节点 ID 提取 globalId
    // 2. 映射到 Speckle 元素 ID
    // 3. 返回需要高亮的元素列表
  }
  
  // 模型 → 图谱
  syncModelToGraph(elementIds: string[]): string[] {
    // 1. 从元素 ID 查找对应节点
    // 2. 查找邻居节点（1-hop）
    // 3. 返回需要高亮的节点列表
  }
  
  // 对话 → 图谱 + 模型
  syncChatToAll(queryResult: QueryResult): SyncResult {
    // 1. 解析查询结果（节点列表、关系列表）
    // 2. 同时更新图谱和模型高亮
    // 3. 返回同步结果
  }
}
```

### 3. GraphViewer 增强 (`components/GraphViewer.tsx`)

**职责**: 渲染图谱并处理交互

```typescript
interface GraphViewerProps {
  data: GraphData;
  selectedNodes?: string[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  layout?: LayoutType;
  styleConfig?: StyleConfig;
}

// 布局类型
type LayoutType = 
  | 'hierarchy'    // 层次布局（按楼层）
  | 'force'        // 力导向布局
  | 'concentric'   // 同心圆布局
  | 'grid';        // 网格布局

// 样式配置
interface StyleConfig {
  nodeStyles: Record<NodeType, NodeStyle>;
  edgeStyles: Record<EdgeType, EdgeStyle>;
  highlightStyle: HighlightStyle;
}
```

**Cytoscape.js 配置**:

```typescript
const cytoscapeConfig = {
  style: [
    // 空间节点样式
    {
      selector: 'node[type="Space"]',
      style: {
        'background-color': '#3B82F6',
        'shape': 'ellipse',
        'width': 60,
        'height': 60,
        'label': 'data(label)',
        'font-size': 12,
        'text-valign': 'center',
        'color': '#fff',
        'text-outline-width': 2,
        'text-outline-color': '#3B82F6'
      }
    },
    // MEP 构件节点样式
    {
      selector: 'node[type="MEPElement"]',
      style: {
        'background-color': '#10B981',
        'shape': 'rectangle',
        'width': 50,
        'height': 40
      }
    },
    // 系统节点样式
    {
      selector: 'node[type="MEPSystem"]',
      style: {
        'background-color': '#F59E0B',
        'shape': 'hexagon',
        'width': 70,
        'height': 70
      }
    },
    // 楼层节点样式
    {
      selector: 'node[type="Storey"]',
      style: {
        'background-color': '#6B7280',
        'shape': 'diamond',
        'width': 80,
        'height': 80
      }
    },
    // ADJACENT_TO 边样式
    {
      selector: 'edge[type="ADJACENT_TO"]',
      style: {
        'line-color': '#94A3B8',
        'width': 2,
        'line-style': 'solid'
      }
    },
    // CROSSES 边样式
    {
      selector: 'edge[type="CROSSES"]',
      style: {
        'line-color': '#EF4444',
        'width': 2,
        'line-style': 'dashed'
      }
    },
    // BELONGS_TO_SYSTEM 边样式
    {
      selector: 'edge[type="BELONGS_TO_SYSTEM"]',
      style: {
        'line-color': '#F59E0B',
        'width': 2,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#F59E0B'
      }
    },
    // 选中状态
    {
      selector: ':selected',
      style: {
        'border-width': 4,
        'border-color': '#FBBF24',
        'box-shadow': '0 0 20px #FBBF24'
      }
    }
  ],
  layout: {
    name: 'cose', // 力导向布局
    animate: true,
    animationDuration: 500,
    nodeRepulsion: 8000,
    idealEdgeLength: 100
  }
};
```

### 4. 数据类型定义 (`types.ts` 扩展)

```typescript
// 图节点
export interface GraphNode {
  id: string;
  type: 'Space' | 'MEPElement' | 'MEPSystem' | 'Storey' | 'RouteNode';
  label: string;
  properties: {
    globalId?: string;
    levelCode?: string;
    category?: string;
    tags?: string[];
    bbox?: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
    systemCode?: string;
  };
}

// 图边
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'ON_LEVEL' | 'ADJACENT_TO' | 'CONNECTS_TO' | 'CROSSES' | 
        'BELONGS_TO_SYSTEM' | 'SERVES' | 'IN_BUILDING' | 'IN_ZONE';
  properties?: {
    weight?: number;
    via?: string;
    distance?: number;
  };
}

// 图数据
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    scenario?: string;
    nodeCount?: number;
    edgeCount?: number;
    relationshipTypes?: string[];
  };
}

// 查询结果
export interface QueryResult {
  nodes: string[];
  edges: string[];
  summary: string;
  type: 'spatial' | 'mep' | 'system' | 'path';
}

// 同步结果
export interface SyncResult {
  graphNodes: string[];
  modelElements: string[];
  message: string;
}
```

## 交互流程设计

### 流程 1: 用户点击图谱节点

```
1. 用户点击 GraphViewer 中的节点
   ↓
2. GraphViewer 触发 onNodeClick(nodeId)
   ↓
3. GraphDataSyncContext.syncFromGraph([nodeId])
   ↓
4. 更新 selectedNodes 状态
   ↓
5. 触发 SpeckleViewer 高亮对应元素
   ↓
6. ControlPanel 显示节点详情
```

### 流程 2: 用户在 3D 模型中选择构件

```
1. 用户点击 SpeckleViewer 中的构件
   ↓
2. SpeckleViewer 触发 onElementClick(elementId)
   ↓
3. GraphDataSyncContext.syncFromModel([elementId])
   ↓
4. 查找对应的图节点和邻居节点
   ↓
5. 更新 selectedNodes 状态
   ↓
6. GraphViewer 高亮节点并居中
   ↓
7. ControlPanel 显示构件详情和关系
```

### 流程 3: 用户在对话框中查询

```
1. 用户输入"显示一层的所有空间"
   ↓
2. ControlPanel 调用 LLM 解析查询
   ↓
3. 生成虚拟查询结果（节点列表）
   ↓
4. GraphDataSyncContext.syncFromChat(queryResult)
   ↓
5. 同时更新 GraphViewer 和 SpeckleViewer
   ↓
6. ControlPanel 显示查询结果摘要
```

## 布局算法选择

### 层次布局 (Hierarchy)
- **适用场景**: 按楼层展示空间关系
- **算法**: Dagre 或 Breadthfirst
- **配置**:
  ```typescript
  {
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.5,
    roots: '[type="Storey"]' // 楼层作为根节点
  }
  ```

### 力导向布局 (Force-Directed)
- **适用场景**: 自动分散节点，展示复杂关系
- **算法**: COSE (Compound Spring Embedder)
- **配置**:
  ```typescript
  {
    name: 'cose',
    animate: true,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    edgeElasticity: 100
  }
  ```

### 同心圆布局 (Concentric)
- **适用场景**: 以某个节点为中心展示关系
- **算法**: Concentric
- **配置**:
  ```typescript
  {
    name: 'concentric',
    concentric: (node) => node.degree(), // 按度数排列
    levelWidth: () => 2
  }
  ```

## 性能优化策略

### 1. 虚拟化渲染
- 只渲染可见区域的节点
- 使用 Cytoscape.js 的视口裁剪

### 2. 懒加载
- 初始只加载一层数据
- 点击节点时动态加载邻居节点

### 3. 防抖和节流
- 节点拖拽使用节流（16ms）
- 搜索输入使用防抖（300ms）

### 4. 状态管理优化
- 使用 useMemo 缓存图数据
- 使用 useCallback 缓存事件处理器

## 样式主题

### 颜色方案（基于 Tailwind）

```typescript
const colorScheme = {
  nodes: {
    Space: '#3B82F6',       // blue-500
    MEPElement: '#10B981',  // green-500
    MEPSystem: '#F59E0B',   // amber-500
    Storey: '#6B7280',      // gray-500
    RouteNode: '#8B5CF6'    // violet-500
  },
  edges: {
    ON_LEVEL: '#94A3B8',           // slate-400
    ADJACENT_TO: '#94A3B8',        // slate-400
    CONNECTS_TO: '#60A5FA',        // blue-400
    CROSSES: '#EF4444',            // red-500
    BELONGS_TO_SYSTEM: '#F59E0B',  // amber-500
    SERVES: '#10B981'              // green-500
  },
  highlight: {
    border: '#FBBF24',      // amber-400
    shadow: 'rgba(251, 191, 36, 0.5)'
  }
};
```

## 错误处理

### 数据验证
- 验证节点 ID 唯一性
- 验证边的 source/target 存在
- 验证节点类型合法性

### 同步失败处理
- 节点未找到时显示提示
- 同步超时时回退状态
- 记录错误日志

## 测试策略

### 单元测试
- 虚拟数据生成器测试
- 数据同步逻辑测试
- 节点/边样式计算测试

### 集成测试
- 三向联动测试
- 布局切换测试
- 数据加载测试

### 性能测试
- 100 节点渲染性能
- 500 节点渲染性能
- 同步响应时间测试

## 未来扩展

### 阶段 2: 真实数据接入
- 替换虚拟数据为 Neo4j 查询
- 实现增量数据更新
- 支持数据缓存

### 阶段 3: 高级功能
- 图谱搜索和过滤
- 自定义样式主题
- 导出图谱为图片
- 图谱动画演示

### 阶段 4: Speckle 集成
- 从 Speckle 模型提取语义
- 自动生成图数据
- 双向数据同步
