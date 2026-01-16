import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LayoutStateProvider, useLayoutState } from '../../contexts/LayoutStateProvider';
import { HighlightStyle } from '../../types';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutStateProvider>{children}</LayoutStateProvider>
);

describe('模型到图谱同步 - 属性 8', () => {
  it('对于任意在模型查看器中点击的元素，图谱查看器中对应的节点应被高亮并居中', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const elementId = 'element-123';
    const highlightStyle: HighlightStyle = {
      color: '#3b82f6',
      category: 'element',
      intensity: 'selected'
    };

    act(() => {
      result.current.selectElement(elementId, 'model');
      result.current.highlightElements([elementId], highlightStyle);
    });

    expect(result.current.selectedElements.has(elementId)).toBe(true);
    expect(result.current.highlightedElements.get(elementId)).toEqual(highlightStyle);
  });

  it('图谱查看器应接收到高亮信号', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const graphHighlightHandler = vi.fn();
    window.addEventListener('graph:highlight-nodes', graphHighlightHandler);

    const elementId = 'element-123';
    const highlightStyle: HighlightStyle = {
      color: '#3b82f6',
      category: 'element',
      intensity: 'selected'
    };

    act(() => {
      result.current.selectElement(elementId, 'model');
      result.current.highlightElements([elementId], highlightStyle);
    });

    expect(graphHighlightHandler).toHaveBeenCalledTimes(1);
    const eventDetail = graphHighlightHandler.mock.calls[0][0].detail;
    expect(eventDetail.nodeIds).toContain(elementId);
    expect(eventDetail.highlightStyle).toEqual(highlightStyle);

    window.removeEventListener('graph:highlight-nodes', graphHighlightHandler);
  });

  it('图谱查看器应接收到居中信号', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const graphCenterHandler = vi.fn();
    window.addEventListener('graph:center-nodes', graphCenterHandler);

    const elementId = 'element-123';

    act(() => {
      result.current.selectElement(elementId, 'model');
    });

    expect(graphCenterHandler).toHaveBeenCalledTimes(1);
    const eventDetail = graphCenterHandler.mock.calls[0][0].detail;
    expect(eventDetail.nodeIds).toContain(elementId);
    expect(eventDetail.animate).toBe(true);

    window.removeEventListener('graph:center-nodes', graphCenterHandler);
  });

  it('点击元素时应触发自定义事件', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const eventHandler = vi.fn();
    window.addEventListener('layout:selection-change', eventHandler);

    const elementId = 'element-456';

    act(() => {
      result.current.selectElement(elementId, 'model');
    });

    expect(eventHandler).toHaveBeenCalledTimes(1);
    const eventDetail = eventHandler.mock.calls[0][0].detail;
    expect(eventDetail.type).toBe('select');
    expect(eventDetail.source).toBe('model');
    expect(eventDetail.elementIds).toEqual([elementId]);
    expect(eventDetail.timestamp).toBeGreaterThan(0);

    window.removeEventListener('layout:selection-change', eventHandler);
  });

  it('多个元素点击时应正确更新选择状态', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const elementIds = ['element-1', 'element-2', 'element-3'];
    const highlightStyle: HighlightStyle = {
      color: '#10b981',
      category: 'space',
      intensity: 'selected'
    };

    act(() => {
      elementIds.forEach(id => {
        result.current.selectElement(id, 'model');
      });
      result.current.highlightElements(elementIds, highlightStyle);
    });

    expect(result.current.selectedElements.size).toBe(3);
    elementIds.forEach(id => {
      expect(result.current.selectedElements.has(id)).toBe(true);
      expect(result.current.highlightedElements.get(id)).toEqual(highlightStyle);
    });
  });

  it('高亮样式应正确应用颜色编码', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const testCases = [
      { id: 'space-1', category: 'space' as const, color: '#3b82f6' },
      { id: 'element-1', category: 'element' as const, color: '#10b981' },
      { id: 'system-1', category: 'system' as const, color: '#f59e0b' },
      { id: 'pipe-1', category: 'pipe' as const, color: '#8b5cf6' },
    ];

    act(() => {
      testCases.forEach(({ id, category, color }) => {
        const style: HighlightStyle = {
          color,
          category,
          intensity: 'selected'
        };
        result.current.highlightElements([id], style);
      });
    });

    testCases.forEach(({ id, category, color }) => {
      const style = result.current.highlightedElements.get(id);
      expect(style).toBeDefined();
      expect(style?.category).toBe(category);
      expect(style?.color).toBe(color);
    });
  });

  it('悬停预览不应改变选择状态', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const selectedId = 'element-selected';
    const hoveredId = 'element-hovered';

    act(() => {
      result.current.selectElement(selectedId, 'model');
      result.current.setHoveredElement(hoveredId);
    });

    expect(result.current.selectedElements.has(selectedId)).toBe(true);
    expect(result.current.selectedElements.has(hoveredId)).toBe(false);
    expect(result.current.hoveredElement).toBe(hoveredId);
  });

  it('清除高亮应重置所有状态', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const elementIds = ['element-1', 'element-2'];
    const highlightStyle: HighlightStyle = {
      color: '#3b82f6',
      category: 'element',
      intensity: 'selected'
    };

    act(() => {
      elementIds.forEach(id => result.current.selectElement(id, 'model'));
      result.current.highlightElements(elementIds, highlightStyle);
      result.current.setHoveredElement('element-hover');
    });

    expect(result.current.selectedElements.size).toBe(2);
    expect(result.current.highlightedElements.size).toBe(2);
    expect(result.current.hoveredElement).toBe('element-hover');

    act(() => {
      result.current.clearHighlights();
    });

    expect(result.current.selectedElements.size).toBe(0);
    expect(result.current.highlightedElements.size).toBe(0);
    expect(result.current.hoveredElement).toBe(null);
  });

  it('清除高亮时应触发自定义事件', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const eventHandler = vi.fn();
    window.addEventListener('layout:selection-change', eventHandler);

    act(() => {
      result.current.selectElement('element-1', 'model');
      result.current.clearHighlights();
    });

    expect(eventHandler).toHaveBeenCalledTimes(2);
    
    const clearEventDetail = eventHandler.mock.calls[1][0].detail;
    expect(clearEventDetail.type).toBe('clear');
    expect(clearEventDetail.source).toBe('control');
    expect(clearEventDetail.elementIds).toEqual([]);

    window.removeEventListener('layout:selection-change', eventHandler);
  });

  it('高亮强度应正确应用透明度', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const intensities: Array<'preview' | 'selected' | 'result'> = ['preview', 'selected', 'result'];
    const elementId = 'element-test';

    act(() => {
      intensities.forEach((intensity, index) => {
        const style: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity
        };
        result.current.highlightElements([`${elementId}-${index}`], style);
      });
    });

    intensities.forEach((intensity, index) => {
      const style = result.current.highlightedElements.get(`${elementId}-${index}`);
      expect(style?.intensity).toBe(intensity);
    });
  });
});

describe('同步性能 - 属性 15', () => {
  it('选择操作应在 500ms 内完成', async () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const startTime = performance.now();
    
    await act(async () => {
      result.current.selectElement('element-1', 'model');
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500);
  });

  it('高亮操作应在 500ms 内完成', async () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const elementIds = Array.from({ length: 100 }, (_, i) => `element-${i}`);
    const highlightStyle: HighlightStyle = {
      color: '#3b82f6',
      category: 'element',
      intensity: 'selected'
    };

    const startTime = performance.now();
    
    await act(async () => {
      result.current.highlightElements(elementIds, highlightStyle);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500);
  });

  it('清除操作应在 500ms 内完成', async () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });

    const elementIds = Array.from({ length: 100 }, (_, i) => `element-${i}`);
    const highlightStyle: HighlightStyle = {
      color: '#3b82f6',
      category: 'element',
      intensity: 'selected'
    };

    act(() => {
      elementIds.forEach(id => result.current.selectElement(id, 'model'));
      result.current.highlightElements(elementIds, highlightStyle);
    });

    const startTime = performance.now();
    
    await act(async () => {
      result.current.clearHighlights();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500);
  });
});

describe('事件发射完整性 - 属性 18', () => {
  it('每次选择变化都应发出自定义事件', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const eventHandler = vi.fn();
    window.addEventListener('layout:selection-change', eventHandler);

    const elementIds = ['element-1', 'element-2', 'element-3'];

    act(() => {
      elementIds.forEach(id => {
        result.current.selectElement(id, 'model');
      });
    });

    expect(eventHandler).toHaveBeenCalledTimes(3);

    eventHandler.mock.calls.forEach((call, index) => {
      const eventDetail = call[0].detail;
      expect(eventDetail.type).toBe('select');
      expect(eventDetail.source).toBe('model');
      expect(eventDetail.elementIds).toEqual([elementIds[index]]);
      expect(eventDetail.timestamp).toBeGreaterThan(0);
    });

    window.removeEventListener('layout:selection-change', eventHandler);
  });

  it('事件应包含正确的元素 ID 和源信息', () => {
    const { result } = renderHook(() => useLayoutState(), { wrapper });
    
    const eventHandler = vi.fn();
    window.addEventListener('layout:selection-change', eventHandler);

    const testCases = [
      { source: 'model' as const, elementId: 'element-1' },
      { source: 'graph' as const, elementId: 'node-1' },
      { source: 'control' as const, elementId: 'result-1' },
    ];

    act(() => {
      testCases.forEach(({ source, elementId }) => {
        result.current.selectElement(elementId, source);
      });
    });

    expect(eventHandler).toHaveBeenCalledTimes(3);

    testCases.forEach(({ source, elementId }, index) => {
      const eventDetail = eventHandler.mock.calls[index][0].detail;
      expect(eventDetail.source).toBe(source);
      expect(eventDetail.elementIds).toEqual([elementId]);
    });

    window.removeEventListener('layout:selection-change', eventHandler);
  });
});
