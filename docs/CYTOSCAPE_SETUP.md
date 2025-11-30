# Cytoscape.js 安装和配置指南

## 概述

GraphViewer 组件依赖 Cytoscape.js 库来渲染图谱。本文档提供详细的安装和配置步骤。

## 方法 1: NPM 安装（推荐）

### 1. 安装核心库

```bash
npm install cytoscape
```

### 2. 安装 TypeScript 类型定义

```bash
npm install --save-dev @types/cytoscape
```

### 3. 在组件中导入

```typescript
import cytoscape from 'cytoscape';

// 在组件中使用
const cy = cytoscape({
  container: containerRef.current,
  // ... 配置
});
```

### 4. 更新 GraphViewer.tsx

将当前的全局访问方式：
```typescript
if (typeof window !== 'undefined' && (window as any).cytoscape) {
  const cy = (window as any).cytoscape({
    // ...
  });
}
```

改为直接导入：
```typescript
import cytoscape from 'cytoscape';

const cy = cytoscape({
  // ...
});
```

## 方法 2: CDN 引入（快速测试）

### 1. 在 index.html 中添加

在 `<head>` 标签中添加：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Arch-Graph</title>
    
    <!-- Cytoscape.js CDN -->
    <script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

### 2. 验证加载

在浏览器控制台中检查：
```javascript
console.log(typeof cytoscape); // 应该输出 "function"
```

## 可选扩展

### 1. 高级布局算法

#### Cola 布局（力导向优化）

```bash
npm install cytoscape-cola
```

使用：
```typescript
import cola from 'cytoscape-cola';
cytoscape.use(cola);

cy.layout({
  name: 'cola',
  animate: true,
  // ... 配置
}).run();
```

#### Dagre 布局（有向图）

```bash
npm install cytoscape-dagre
```

使用：
```typescript
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre);

cy.layout({
  name: 'dagre',
  rankDir: 'TB', // 从上到下
  // ... 配置
}).run();
```

### 2. 导出功能

#### PNG/JPG 导出

```bash
npm install cytoscape-svg
```

使用：
```typescript
// 导出为 PNG
const png = cy.png({
  output: 'blob',
  full: true,
  scale: 2,
});

// 下载
const link = document.createElement('a');
link.download = 'graph.png';
link.href = URL.createObjectURL(png);
link.click();
```

### 3. 上下文菜单

```bash
npm install cytoscape-context-menus
```

使用：
```typescript
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';

cytoscape.use(contextMenus);

cy.contextMenus({
  menuItems: [
    {
      id: 'expand',
      content: 'Expand Node',
      selector: 'node',
      onClickFunction: (event) => {
        const node = event.target;
        expandNode(node.id());
      },
    },
  ],
});
```

## 配置验证

### 1. 创建测试页面

创建 `components/CytoscapeTest.tsx`：

```typescript
import React, { useEffect, useRef } from 'react';

const CytoscapeTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 检查 Cytoscape 是否可用
    if (typeof window !== 'undefined' && (window as any).cytoscape) {
      const cy = (window as any).cytoscape({
        container: containerRef.current,
        elements: [
          { data: { id: 'a', label: 'Node A' } },
          { data: { id: 'b', label: 'Node B' } },
          { data: { id: 'ab', source: 'a', target: 'b' } },
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#3B82F6',
              'label': 'data(label)',
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#CBD5E1',
              'target-arrow-color': '#CBD5E1',
              'target-arrow-shape': 'triangle',
            },
          },
        ],
        layout: {
          name: 'grid',
        },
      });

      console.log('Cytoscape initialized successfully!', cy);
    } else {
      console.error('Cytoscape not found!');
    }
  }, []);

  return (
    <div className="w-full h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Cytoscape Test</h1>
      <div
        ref={containerRef}
        className="w-full h-96 border border-slate-300 rounded-lg"
      />
    </div>
  );
};

export default CytoscapeTest;
```

### 2. 在 App.tsx 中测试

```typescript
import CytoscapeTest from './components/CytoscapeTest';

function App() {
  return <CytoscapeTest />;
}
```

### 3. 检查控制台

如果看到 "Cytoscape initialized successfully!"，说明配置成功。

## 常见问题

### Q: 报错 "cytoscape is not defined"

**原因**: Cytoscape.js 未正确加载

**解决方案**:
1. 检查 CDN 链接是否正确
2. 确保 script 标签在 `<head>` 中
3. 检查网络连接

### Q: TypeScript 报错 "Property 'cytoscape' does not exist on type 'Window'"

**解决方案**: 添加类型声明

创建 `src/types/cytoscape.d.ts`：
```typescript
declare global {
  interface Window {
    cytoscape: any;
  }
}

export {};
```

### Q: 布局不显示或节点重叠

**原因**: 容器尺寸问题

**解决方案**:
1. 确保容器有明确的宽度和高度
2. 使用 `cy.resize()` 在容器尺寸变化时调用
3. 检查 CSS 样式是否正确

### Q: 性能问题（大型图谱）

**解决方案**:
1. 限制初始显示的节点数量
2. 禁用动画：`animate: false`
3. 使用更简单的布局算法
4. 实现虚拟化或分页

## 推荐配置

### 开发环境

```json
{
  "dependencies": {
    "cytoscape": "^3.28.1"
  },
  "devDependencies": {
    "@types/cytoscape": "^3.19.16"
  }
}
```

### 生产环境

使用 NPM 安装而非 CDN，以获得：
- 更好的类型支持
- 更小的打包体积（tree-shaking）
- 离线支持
- 版本控制

## 下一步

1. ✅ 安装 Cytoscape.js
2. ✅ 验证安装成功
3. ✅ 测试 GraphViewer 组件
4. 🔄 集成到三分屏布局
5. 🔄 实现模型-图谱同步
6. 🔄 添加高级功能（搜索、过滤等）

## 参考资源

- [Cytoscape.js 官方文档](https://js.cytoscape.org/)
- [Cytoscape.js GitHub](https://github.com/cytoscape/cytoscape.js)
- [布局算法演示](https://js.cytoscape.org/#layouts)
- [样式配置指南](https://js.cytoscape.org/#style)
