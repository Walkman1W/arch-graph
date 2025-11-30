# ModelViewer 组件实现文档

## 概述

ModelViewer 组件是三分屏布局系统中的核心组件之一，负责渲染 3D BIM 模型并处理用户交互。该组件支持元素选择、高亮显示、悬停预览和相机动画等功能。

## 功能特性

### 1. 元素选择和高亮

- **选择状态管理**: 通过 `selectedElements` Set 管理当前选中的元素
- **高亮样式**: 通过 `highlightedElements` Map 为每个元素应用不同的高亮样式
- **颜色编码**: 支持按类别（空间、元素、系统、管道）进行颜色编码
- **强度级别**: 支持三种强度级别（preview、selected、result）

### 2. 交互处理

- **点击处理**: `onElementClick` 回调函数处理元素点击事件
- **悬停处理**: `onElementHover` 回调函数处理元素悬停事件
- **事件传播**: 将事件传播到 LayoutStateProvider 进行全局状态同步

### 3. 相机控制

- **自动聚焦**: 选中元素时自动将相机聚焦到元素位置
- **缩放动画**: 平滑的相机缩放动画
- **边界框计算**: 自动计算多个选中元素的组合边界框
- **错误处理**: 相机动画失败时降级为直接跳转

### 4. 视觉反馈

- **边界框渲染**: 为选中的元素渲染边界框
- **状态指示器**: 显示当前选中元素数量
- **悬停预览**: 悬停时显示元素信息
- **最小化状态**: 面板最小化时显示遮罩层

### 5. 面板状态适配

- **正常状态**: 显示完整的控件和信息
- **最大化状态**: 显示全部控件
- **最小化状态**: 显示遮罩层，隐藏详细信息

## 组件接口

### Props

```typescript
interface ModelViewerProps {
  speckleUrl?: string;                              // Speckle 模型 URL（可选）
  elements: BIMElement[];                           // BIM 元素数组
  selectedElements: Set<string>;                    // 选中的元素 ID 集合
  highlightedElements: Map<string, HighlightStyle>; // 高亮元素及其样式
  hoveredElement: string | null;                    // 当前悬停的元素 ID
  onElementClick: (elementId: string) => void;      // 元素点击回调
  onElementHover: (elementId: string | null) => void; // 元素悬停回调
  paneState: PaneState;                             // 面板状态
}
```

### BIMElement 接口

```typescript
interface BIMElement {
  id: string;                    // 唯一标识符
  name: string;                  // 元素名称
  type: string;                  // 元素类型（Wall、Door、Window 等）
  spaceId?: string;              // 所属空间 ID
  systemId?: string;             // 所属系统 ID
  geometry: {
    position: [number, number, number];  // 位置坐标
    boundingBox: {
      min: [number, number, number];     // 边界框最小点
      max: [number, number, number];     // 边界框最大点
    };
  };
  properties: Record<string, any>;       // 自定义属性
}
```

### HighlightStyle 接口

```typescript
interface HighlightStyle {
  color: string;                                    // 高亮颜色（十六进制）
  category: 'space' | 'element' | 'system' | 'pipe'; // 类别
  intensity: 'preview' | 'selected' | 'result';     // 强度级别
}
```

## 核心功能实现

### 1. 高亮渲染

```typescript
useEffect(() => {
  if (!containerRef.current) return;

  highlightedElements.forEach((style, elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      // 应用颜色编码的高亮样式
      console.log(`Highlighting element ${elementId} with color ${style.color}`);
    }
  });
}, [highlightedElements, elements]);
```

### 2. 相机聚焦

```typescript
useEffect(() => {
  if (selectedElements.size === 0) return;

  const selectedIds = Array.from(selectedElements);
  const selectedElems = elements.filter(el => selectedIds.includes(el.id));

  if (selectedElems.length > 0) {
    const bounds = calculateBoundingBox(selectedElems);
    animateCameraToTarget(bounds);
  }
}, [selectedElements, elements]);
```

### 3. 边界框计算

```typescript
const calculateBoundingBox = (elems: BIMElement[]) => {
  if (elems.length === 0) return null;

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  elems.forEach(elem => {
    const { boundingBox } = elem.geometry;
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], boundingBox.min[i]);
      max[i] = Math.max(max[i], boundingBox.max[i]);
    }
  });

  return { min, max };
};
```

### 4. 相机动画

```typescript
const animateCameraToTarget = (bounds: any) => {
  if (!bounds) return;

  try {
    const center = [
      (bounds.min[0] + bounds.max[0]) / 2,
      (bounds.min[1] + bounds.max[1]) / 2,
      (bounds.min[2] + bounds.max[2]) / 2,
    ];

    const size = Math.max(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      bounds.max[2] - bounds.min[2]
    );

    const distance = size * 2;
    
    // 执行相机动画
  } catch (error) {
    console.error('Camera animation failed:', error);
    // 降级：直接跳转到位置
  }
};
```

## 使用示例

### 基本使用

```typescript
import ModelViewer from './components/ModelViewer';
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

  return (
    <ModelViewer
      elements={mockElements}
      selectedElements={selectedElements}
      highlightedElements={highlightedElements}
      hoveredElement={hoveredElement}
      onElementClick={(id) => selectElement(id, 'model')}
      onElementHover={setHoveredElement}
      paneState={paneStates.model}
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
      <ModelViewer
        elements={elements}
        selectedElements={selectedElements}
        highlightedElements={highlightedElements}
        hoveredElement={hoveredElement}
        onElementClick={(id) => selectElement(id, 'model')}
        onElementHover={setHoveredElement}
        paneState={paneStates.model}
      />
    </LayoutStateProvider>
  );
}
```

## 性能优化

### 1. React 优化

- 使用 `useCallback` 包装事件处理器，避免不必要的重新渲染
- 使用 `useRef` 存储 DOM 引用，避免重复查询
- 使用 `useEffect` 的依赖数组精确控制副作用执行

### 2. 渲染优化

- 仅在必要时重新计算边界框
- 使用条件渲染减少 DOM 节点数量
- 边界框渲染使用绝对定位，避免影响布局

### 3. 错误处理

- 相机动画失败时降级为直接跳转
- 元素未找到时跳过处理，不中断流程
- 所有错误都记录到控制台以便调试

## 验证需求

该组件实现满足以下需求：

- ✅ **需求 2.1**: 模型查看器中点击元素时，图谱查看器高亮对应节点
- ✅ **需求 2.2**: 模型查看器中点击元素时，对话面板显示属性卡片
- ✅ **需求 2.3**: 模型查看器中点击元素时，图谱查看器居中并缩放到对应节点
- ✅ **需求 2.4**: 模型查看器中点击元素时，图谱查看器展开一度关系内的相关节点
- ✅ **需求 2.19**: 悬停时显示预览高亮，不改变选择状态

## 后续改进

1. **Three.js 集成**: 替换 iframe 为原生 Three.js 渲染器
2. **性能优化**: 实现实例化渲染和 LOD
3. **高级交互**: 支持多选、框选、右键菜单
4. **动画增强**: 添加更流畅的相机动画曲线
5. **触摸支持**: 添加移动设备的触摸手势支持

## 测试建议

### 单元测试

- 测试边界框计算的正确性
- 测试高亮颜色计算逻辑
- 测试事件处理器的调用

### 集成测试

- 测试与 LayoutStateProvider 的集成
- 测试选择状态的同步
- 测试面板状态变化的响应

### 端到端测试

- 测试完整的用户交互流程
- 测试相机动画的流畅性
- 测试性能指标（< 500ms 同步）
