import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { LayoutStateProvider, useLayoutState } from '../contexts/LayoutStateProvider';
import { PanelState, PanelId } from '../types';

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LayoutStateProvider>{children}</LayoutStateProvider>
);

describe('LayoutStateProvider 集成测试', () => {
  beforeEach(() => {
    // 清除本地存储
    localStorage.clear();
  });

  it('应该提供完整的布局状态管理功能', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    // 验证初始状态
    expect(result.current.state.dividerPosition).toBe(0.6);
    expect(result.current.state.topPanelState).toBe(PanelState.NORMAL);
    expect(result.current.state.bottomPanelState).toBe(PanelState.NORMAL);
    expect(result.current.state.selectedElements).toEqual([]);
    expect(result.current.state.highlightedElements).toEqual([]);
    expect(result.current.state.hoveredElement).toBeNull();
    expect(result.current.state.syncEnabled).toBe(true);

    // 测试分隔条位置设置
    act(() => {
      result.current.actions.setDividerPosition(0.4);
    });
    expect(result.current.state.dividerPosition).toBe(0.4);

    // 测试分隔条位置重置
    act(() => {
      result.current.actions.resetDividerPosition();
    });
    expect(result.current.state.dividerPosition).toBe(0.6);

    // 测试面板最大化
    act(() => {
      result.current.actions.maximizePane(PanelId.TOP);
    });
    expect(result.current.state.topPanelState).toBe(PanelState.MAXIMIZED);
    expect(result.current.state.bottomPanelState).toBe(PanelState.MINIMIZED);

    // 测试面板恢复
    act(() => {
      result.current.actions.restorePane(PanelId.TOP);
    });
    expect(result.current.state.topPanelState).toBe(PanelState.NORMAL);
    expect(result.current.state.bottomPanelState).toBe(PanelState.NORMAL);

    // 测试元素选择
    act(() => {
      result.current.actions.selectElement('element-1');
    });
    expect(result.current.state.selectedElements).toContain('element-1');

    // 测试元素高亮
    act(() => {
      result.current.actions.highlightElement('element-2');
    });
    expect(result.current.state.highlightedElements).toContain('element-2');

    // 测试悬停状态
    act(() => {
      result.current.actions.setHoveredElement('element-3');
    });
    expect(result.current.state.hoveredElement).toBe('element-3');

    // 测试同步状态
    act(() => {
      result.current.actions.setSyncEnabled(false);
    });
    expect(result.current.state.syncEnabled).toBe(false);
  });

  it('应该正确处理本地存储持久化', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    // 修改一些状态
    act(() => {
      result.current.actions.setDividerPosition(0.3);
      result.current.actions.selectElement('test-element');
      result.current.actions.setSyncEnabled(false);
    });

    // 验证本地存储
    const storedData = localStorage.getItem('arch-graph-layout-state');
    expect(storedData).toBeTruthy();
    
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.dividerPosition).toBe(0.3);
    expect(parsedData.selectedElements).toContain('test-element');
    expect(parsedData.syncEnabled).toBe(false);
  });

  it('应该正确处理状态恢复', () => {
    // 预置一些数据到本地存储
    const testData = {
      dividerPosition: 0.45,
      topPanelState: PanelState.MAXIMIZED,
      bottomPanelState: PanelState.MINIMIZED,
      selectedElements: ['element-a', 'element-b'],
      highlightedElements: ['element-c'],
      syncEnabled: false
    };
    
    localStorage.setItem('arch-graph-layout-state', JSON.stringify(testData));

    // 创建新的 hook 实例
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    // 验证状态被正确恢复
    expect(result.current.state.dividerPosition).toBe(0.45);
    expect(result.current.state.topPanelState).toBe(PanelState.MAXIMIZED);
    expect(result.current.state.bottomPanelState).toBe(PanelState.MINIMIZED);
    expect(result.current.state.selectedElements).toEqual(['element-a', 'element-b']);
    expect(result.current.state.highlightedElements).toEqual(['element-c']);
    expect(result.current.state.syncEnabled).toBe(false);
  });

  it('应该正确处理状态批量更新', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.actions.setState({
        dividerPosition: 0.7,
        topPanelState: PanelState.MAXIMIZED,
        selectedElements: ['batch-element']
      });
    });

    expect(result.current.state.dividerPosition).toBe(0.7);
    expect(result.current.state.topPanelState).toBe(PanelState.MAXIMIZED);
    expect(result.current.state.selectedElements).toContain('batch-element');
  });

  it('应该正确处理错误边界', () => {
    // 测试在 Provider 外部使用钩子
    expect(() => {
      renderHook(() => useLayoutState());
    }).toThrow('useLayoutState must be used within a LayoutStateProvider');
  });

  it('应该正确处理面板状态互斥性', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    // 最大化上面板
    act(() => {
      result.current.actions.maximizePane(PanelId.TOP);
    });
    expect(result.current.state.topPanelState).toBe(PanelState.MAXIMIZED);
    expect(result.current.state.bottomPanelState).toBe(PanelState.MINIMIZED);

    // 最大化下面板
    act(() => {
      result.current.actions.maximizePane(PanelId.BOTTOM);
    });
    expect(result.current.state.topPanelState).toBe(PanelState.MINIMIZED);
    expect(result.current.state.bottomPanelState).toBe(PanelState.MAXIMIZED);

    // 最小化上面板
    act(() => {
      result.current.actions.minimizePane(PanelId.TOP);
    });
    expect(result.current.state.topPanelState).toBe(PanelState.MINIMIZED);
    expect(result.current.state.bottomPanelState).toBe(PanelState.NORMAL);
  });

  it('应该正确处理元素选择和高亮的去重', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    // 选择相同元素多次
    act(() => {
      result.current.actions.selectElement('duplicate-element');
      result.current.actions.selectElement('duplicate-element');
    });
    expect(result.current.state.selectedElements).toEqual(['duplicate-element']);

    // 高亮相同元素多次
    act(() => {
      result.current.actions.highlightElement('duplicate-highlight');
      result.current.actions.highlightElement('duplicate-highlight');
    });
    expect(result.current.state.highlightedElements).toEqual(['duplicate-highlight']);
  });

  it('应该正确处理同步时间戳', () => {
    const { result } = renderHook(() => useLayoutState(), {
      wrapper: TestWrapper
    });

    const initialTime = result.current.state.lastSyncTime;
    
    // 等待一小段时间
    act(() => {
      new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        result.current.actions.selectElement('sync-test');
      });
    });

    // 选择元素应该更新时间戳
    expect(result.current.state.lastSyncTime).toBeGreaterThanOrEqual(initialTime!);
  });
});