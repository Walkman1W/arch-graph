# 面板最大化/最小化功能验证文档

## 实现概述

本文档描述了任务 3 的实现：面板最大化/最小化功能。

## 已实现的功能

### 1. PaneHeader 组件 (`components/PaneHeader.tsx`)

创建了一个可重用的面板标题组件，包含：

- **标题显示**：显示面板名称
- **最大化按钮**：当面板处于正常状态时显示
- **最小化按钮**：当面板处于正常状态时显示
- **恢复按钮**：当面板处于最大化或最小化状态时显示

#### 按钮状态管理

根据当前面板状态 (`PaneState`) 动态显示不同的按钮：

- `normal` 状态：显示最大化和最小化按钮
- `maximized` 状态：显示恢复按钮
- `minimized` 状态：显示恢复按钮

#### 无障碍支持

- 所有按钮都有 `title` 和 `aria-label` 属性
- 使用语义化的 SVG 图标
- 支持键盘导航

### 2. 更新的 SplitPaneContainer 组件

#### 新增属性

- `topPaneTitle`: 上面板标题（默认：'模型查看器'）
- `bottomPaneTitle`: 下面板标题（默认：'图谱查看器'）

#### 集成 PaneHeader

- 为上下两个面板都添加了 PaneHeader 组件
- 连接了 LayoutStateProvider 的状态管理函数
- 实现了平滑的动画过渡（300ms）

#### 面板高度计算

根据面板状态动态计算高度：

- `maximized`: 100% 高度
- `minimized`: 48px（工具栏高度）
- `normal`: 根据 dividerPosition 计算

#### 内容显示逻辑

- 当面板最小化时，只显示 PaneHeader，隐藏内容
- 当面板正常或最大化时，显示完整内容

### 3. 状态管理（已在任务 1 中实现）

LayoutStateProvider 已经实现了以下功能：

- `maximizePane(pane)`: 最大化指定面板，自动折叠另一个面板
- `minimizePane(pane)`: 最小化指定面板，防止两个面板同时最小化
- `restorePane(pane)`: 恢复面板到之前的状态
- `previousDividerPosition`: 存储之前的分隔条位置用于恢复

#### 互斥逻辑

在 `minimizePane` 函数中实现：

```typescript
// 防止两个面板同时被最小化
if (prev.paneStates[otherPane] === 'minimized') {
  console.warn('Cannot minimize both panes simultaneously');
  return prev;
}
```

#### 状态持久化

- 所有布局状态（包括面板状态）自动保存到 localStorage
- 应用加载时自动恢复保存的状态

## 验证需求对照

### 需求 1.11 ✅
> 当显示模型查看器或图谱查看器时，系统应在面板标题中显示最大化和最小化按钮

**实现**：PaneHeader 组件在正常状态下显示最大化和最小化按钮

### 需求 1.12 ✅
> 当用户点击任一面板的最大化按钮时，系统应将该面板扩展至占据左侧区域 100% 的高度，并将另一个面板折叠为工具栏状态

**实现**：`maximizePane` 函数将目标面板设为 'maximized'，另一个设为 'minimized'

### 需求 1.13 ✅
> 当面板被最大化时，系统应将最大化按钮更改为恢复按钮

**实现**：PaneHeader 根据 `paneState === 'maximized'` 显示恢复按钮

### 需求 1.14 ✅
> 当用户点击恢复按钮时，系统应将两个面板恢复到之前的高度比例，并带有动画效果

**实现**：
- `restorePane` 函数恢复 `previousDividerPosition`
- CSS transition 提供 300ms 动画效果

### 需求 1.15 ✅
> 当用户点击面板的最小化按钮时，系统应将该面板折叠为工具栏图标状态，仅显示基本控件

**实现**：
- `minimizePane` 函数设置面板状态为 'minimized'
- 最小化时高度为 48px，只显示 PaneHeader

### 需求 1.16 ✅
> 系统应防止两个面板同时被最小化

**实现**：`minimizePane` 函数中的互斥检查

### 需求 1.17 ✅
> 当面板被最小化时，系统应在折叠的工具栏中显示恢复图标按钮

**实现**：PaneHeader 在 `paneState === 'minimized'` 时显示恢复按钮

## 测试示例

创建了 `MaximizeMinimizeExample.tsx` 组件用于测试：

```bash
# 要测试此功能，可以临时修改 index.tsx：
# import { MaximizeMinimizeExample } from './components/MaximizeMinimizeExample';
# root.render(<MaximizeMinimizeExample />);
```

## 使用方法

```tsx
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import { SplitPaneContainer } from './components/SplitPaneContainer';

function App() {
  return (
    <LayoutStateProvider>
      <SplitPaneContainer
        topPaneTitle="3D 模型查看器"
        bottomPaneTitle="图谱可视化"
        topPane={<YourModelViewer />}
        bottomPane={<YourGraphViewer />}
      />
    </LayoutStateProvider>
  );
}
```

## 技术细节

### 动画效果

使用 Tailwind CSS 的 transition 类：
- `transition-all duration-300 ease-in-out`
- 平滑的高度变化动画

### 图标设计

使用 Heroicons 风格的 SVG 图标：
- 最小化：水平线
- 最大化：扩展箭头
- 恢复：收缩箭头

### 样式一致性

- 使用 Tailwind 的 slate 色系
- 悬停效果：`hover:bg-slate-200`
- 圆角按钮：`rounded`

## 下一步

任务 3 已完成。可以继续执行任务 4：更新 App.tsx 以集成三分屏布局。
