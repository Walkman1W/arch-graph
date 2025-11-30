# GraphViewer 快速开始

## 5 分钟快速上手

### 1. 安装依赖（二选一）

#### 方式 A: NPM（推荐）
```bash
npm install cytoscape
npm install --save-dev @types/cytoscape
```

#### 方式 B: CDN（快速测试）
在 `index.html` 的 `<head>` 中添加：
```html
<script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
```

### 2. 准备数据

```typescript
const nodes = [
  { id: 'n1', label: 'Node 1', type: 'Project', properties: {} },
  { id: 'n2', label: 'Node 2', type: 'Level', properties: {} },
];

const edges = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'HAS_LEVEL' },
];
```

### 3. 使用组件

```typescript
import GraphViewer from './components/GraphViewer';

<GraphViewer
  nodes={nodes}
  edges={edges}
  selectedNodes={new Set()}
  highlightedNodes={new Map()}
  hoveredNode={null}
  onNodeClick={(id) => console.log('Clicked:', id)}
  onNodeHover={(id) => console.log('Hovered:', id)}
  paneState="normal"
  layoutMode="hierarchy"
/>
```

### 4. 验证

打开浏览器，应该看到图谱渲染成功！

## 节点类型速查

| 类型 | 颜色 | 用途 |
|------|------|------|
| Project | 紫色 | 项目根节点 |
| Level | 蓝色 | 楼层 |
| Space | 绿色 | 空间/房间 |
| Element | 橙色 | 构件 |
| System | 红色 | 系统 |

## 布局模式

- `hierarchy` - 层次布局（树形结构）
- `force` - 力导向布局（复杂网络）
- `circular` - 圆形布局（环形结构）

## 常见问题

**Q: 看不到图谱？**
- 检查容器是否有高度
- 检查 Cytoscape.js 是否加载
- 打开控制台查看错误

**Q: 节点重叠？**
- 尝试切换布局模式
- 调整 `spacingFactor` 参数

**Q: 性能慢？**
- 限制节点数量（< 500）
- 禁用动画：`animate: false`
- 使用更简单的布局

## 完整示例

查看 `components/GraphViewerExample.tsx` 获取完整示例代码。

## 更多文档

- 详细实现：`GRAPHVIEWER_IMPLEMENTATION.md`
- 安装指南：`docs/CYTOSCAPE_SETUP.md`
- 任务总结：`docs/TASK_6_SUMMARY.md`
