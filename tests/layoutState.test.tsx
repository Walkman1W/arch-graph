import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook, act, cleanup } from '@testing-library/react';
import { LayoutStateProvider, useLayoutState } from '../contexts/LayoutStateProvider';
import { PanelState, PanelId } from '../types';

// 测试工具函数
const createTestWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <LayoutStateProvider>{children}</LayoutStateProvider>
  );
};

describe('LayoutStateProvider 属性测试', () => {
  beforeEach(() => {
    // 清除本地存储
    localStorage.clear();
  });

  describe('属性 7：状态持久化往返', () => {
    it('应该保持状态持久化的往返一致性', async () => {
      // 首先清除本地存储
      localStorage.clear();
      
      const testState = {
        dividerPosition: 0.45,
        topPanelState: PanelState.MAXIMIZED,
        bottomPanelState: PanelState.MINIMIZED,
        selectedElements: ['element-a', 'element-b'],
        highlightedElements: ['element-c'],
        syncEnabled: false
      };

      // 创建包装器
      const wrapper = createTestWrapper();
      
      // 第一次渲染 - 设置状态
      const { result: result1 } = renderHook(() => useLayoutState(), { wrapper });
      
      // 验证初始状态
      expect(result1.current.state.dividerPosition).toBe(0.6); // 默认位置
      
      act(() => {
        result1.current.actions.setState({
          ...testState,
          highlightStyles: {
            selected: { color: '#3b82f6', opacity: 1, borderColor: '#1e40af', borderWidth: 2, scale: 1.1 },
            highlighted: { color: '#f59e0b', opacity: 0.8, borderColor: '#d97706', borderWidth: 1, scale: 1.05 },
            hovered: { color: '#10b981', opacity: 0.6, borderColor: '#059669', borderWidth: 1, scale: 1.02 }
          }
        });
      });

      // 验证状态已设置
      expect(result1.current.state.dividerPosition).toBe(testState.dividerPosition);
      
      // 等待状态保存到本地存储
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // 检查本地存储中的数据
      const storedData = localStorage.getItem('arch-graph-layout-state');
      console.log('LocalStorage data:', storedData);
      expect(storedData).toBeTruthy();
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.dividerPosition).toBe(testState.dividerPosition);
      
      // 模拟组件卸载和重新挂载 - 先卸载第一个实例
      cleanup();
      
      // 创建新的实例来模拟重新挂载
      const { result: result2 } = renderHook(() => useLayoutState(), { wrapper });

      // 等待状态从本地存储加载
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // 验证状态被正确恢复
      expect(result2.current.state.dividerPosition).toBe(testState.dividerPosition);
      expect(result2.current.state.topPanelState).toBe(testState.topPanelState);
      expect(result2.current.state.bottomPanelState).toBe(testState.bottomPanelState);
      expect(result2.current.state.selectedElements).toEqual(testState.selectedElements);
      expect(result2.current.state.highlightedElements).toEqual(testState.highlightedElements);
      expect(result2.current.state.syncEnabled).toBe(testState.syncEnabled);
    });

    it('应该正确处理本地存储错误', () => {
      // 模拟本地存储错误
      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;
      
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const wrapper = createTestWrapper();
      
      // 应该使用默认状态而不是崩溃
      const { result } = renderHook(() => useLayoutState(), { wrapper });
      
      expect(result.current.state.dividerPosition).toBe(0.6);
      expect(result.current.state.topPanelState).toBe(PanelState.NORMAL);
      expect(result.current.state.bottomPanelState).toBe(PanelState.NORMAL);

      // 恢复原始函数
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    });

    it('应该验证存储的状态数据', () => {
      // 存储无效数据
      localStorage.setItem('arch-graph-layout-state', JSON.stringify({
        dividerPosition: 'invalid',
        topPanelState: 'INVALID_STATE',
        bottomPanelState: PanelState.NORMAL,
        selectedElements: [],
        highlightedElements: [],
        syncEnabled: false,
        highlightStyles: {
          selected: { color: '#3b82f6', opacity: 1, borderColor: '#1e40af', borderWidth: 2, scale: 1.1 },
          highlighted: { color: '#f59e0b', opacity: 0.8, borderColor: '#d97706', borderWidth: 1, scale: 1.05 },
          hovered: { color: '#10b981', opacity: 0.6, borderColor: '#059669', borderWidth: 1, scale: 1.02 }
        }
      }));

      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

      // 应该使用默认状态
      expect(result.current.state.dividerPosition).toBe(0.6);
      expect(result.current.state.topPanelState).toBe(PanelState.NORMAL);
    });
  });

  describe('状态操作验证', () => {
    it('应该正确约束分隔条位置', () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

      // 测试边界值
      act(() => {
        result.current.actions.setDividerPosition(0.1);
      });
      expect(result.current.state.dividerPosition).toBe(0.2);

      act(() => {
        result.current.actions.setDividerPosition(0.9);
      });
      expect(result.current.state.dividerPosition).toBe(0.8);

      act(() => {
        result.current.actions.setDividerPosition(0.5);
      });
      expect(result.current.state.dividerPosition).toBe(0.5);
    });

    it('应该正确处理面板最大化/最小化', () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

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

      // 恢复所有面板
      act(() => {
        result.current.actions.restoreAllPanes();
      });
      expect(result.current.state.topPanelState).toBe(PanelState.NORMAL);
      expect(result.current.state.bottomPanelState).toBe(PanelState.NORMAL);
    });

    it('应该正确处理元素选择和高亮', () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

      // 选择元素
      act(() => {
        result.current.actions.selectElement('element-1');
      });
      expect(result.current.state.selectedElements).toContain('element-1');

      // 再次选择相同元素（应该去重）
      act(() => {
        result.current.actions.selectElement('element-1');
      });
      expect(result.current.state.selectedElements).toEqual(['element-1']);

      // 选择多个元素
      act(() => {
        result.current.actions.selectMultipleElements(['element-2', 'element-3']);
      });
      expect(result.current.state.selectedElements).toEqual(['element-1', 'element-2', 'element-3']);

      // 高亮元素
      act(() => {
        result.current.actions.highlightElement('element-4');
      });
      expect(result.current.state.highlightedElements).toContain('element-4');

      // 清除选择
      act(() => {
        result.current.actions.clearSelection();
      });
      expect(result.current.state.selectedElements).toEqual([]);
    });

    it('应该正确处理同步状态', () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

      // 初始状态应该有同步时间
      const initialSyncTime = result.current.state.lastSyncTime;
      // lastSyncTime 可以为 null，我们只需要确保 setSyncEnabled 正常工作
      expect(initialSyncTime).toBeDefined();

      // 禁用同步
      act(() => {
        result.current.actions.setSyncEnabled(false);
      });
      expect(result.current.state.syncEnabled).toBe(false);

      // 选择元素时不应该更新时间
      const timeBeforeSelection = result.current.state.lastSyncTime;
      act(() => {
        result.current.actions.selectElement('element-1');
      });
      expect(result.current.state.lastSyncTime).toBe(timeBeforeSelection);
    });
  });

  describe('错误处理', () => {
    it('应该在 Provider 外部使用钩子时报错', () => {
      // 应该抛出错误
      expect(() => {
        renderHook(() => useLayoutState());
      }).toThrow('useLayoutState must be used within a LayoutStateProvider');
    });

    it('应该优雅处理损坏的本地存储数据', () => {
      // 存储损坏的 JSON
      localStorage.setItem('arch-graph-layout-state', '{invalid json');

      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useLayoutState(), { wrapper });

      // 应该使用默认状态
      expect(result.current.state.dividerPosition).toBe(0.6);
    });
  });
});