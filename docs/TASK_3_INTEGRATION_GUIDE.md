# 任务 3 集成指南：面板最大化/最小化功能

## 快速测试

要快速测试最大化/最小化功能，可以临时修改 `index.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { MaximizeMinimizeExample } from './components/MaximizeMinimizeExample';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MaximizeMinimizeExample />
  </React.StrictMode>
);
```

然后运行：

```bash
npm run dev
```

## 功能测试清单

### 基本功能

- [ ] 点击模型查看器的最大化按钮，模型面板应扩展到 100%
- [ ] 点击图谱查看器的最大化按钮，图谱面板应扩展到 100%
- [ ] 最大化后，最大化按钮应变为恢复按钮
- [ ] 点击恢复按钮，面板应返回到之前的比例

### 最小化功能

- [ ] 点击模型查看器的最小化按钮，面板应折叠为工具栏（48px）
- [ ] 点击图谱查看器的最小化按钮，面板应折叠为工具栏（48px）
- [ ] 最小化后，应显示恢复按钮
- [ ] 点击恢复按钮，面板应返回到之前的比例

### 互斥逻辑

- [ ] 当一个面板最小化时，尝试最小化另一个面板应该被阻止
- [ ] 控制台应显示警告信息："Cannot minimize both panes simultaneously"

### 动画效果

- [ ] 所有状态变化应有平滑的动画过渡（300ms）
- [ ] 高度变化应该流畅，无跳跃

### 状态持久化

- [ ] 调整面板状态后刷新页面，状态应该被保留
- [ ] 检查 localStorage 中的 'arch-graph-layout-preferences' 键

### 无障碍功能

- [ ] 所有按钮应该可以通过 Tab 键导航
- [ ] 按钮应该有清晰的悬停效果
- [ ] 按钮应该有适当的 aria-label

## 集成到现有应用

要将此功能集成到现有的 App.tsx：

```tsx
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';
import SpeckleViewer from './components/SpeckleViewer';
// 导入你的 GraphViewer 组件

function App() {
  return (
    <LayoutStateProvider>
      <div className="flex flex-col h-screen">
        <DashboardHeader />
        
        <div className="flex-1 flex">
          {/* 左侧：分屏容器 */}
          <div className="flex-1">
            <SplitPaneContainer
              topPaneTitle="3D 模型查看器"
              bottomPaneTitle="图谱可视化"
              topPane={
                <SpeckleViewer embedUrl="your-speckle-url" />
              }
              bottomPane={
                <YourGraphViewer />
              }
            />
          </div>
          
          {/* 右侧：对话面板 */}
          <ControlPanel />
        </div>
      </div>
    </LayoutStateProvider>
  );
}
```

## 已知限制

1. 当前实现假设 SplitPaneContainer 占据其父容器的全部高度
2. 最小化状态下的工具栏高度固定为 48px
3. 动画持续时间固定为 300ms

## 下一步

完成测试后，可以继续执行：
- 任务 4：更新 App.tsx 以集成三分屏布局
- 任务 5：增强 ModelViewer 组件的选择和高亮支持
