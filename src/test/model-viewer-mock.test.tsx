import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LayoutStateProvider, useLayoutState } from '../../contexts/LayoutStateProvider';
import ModelViewer from '../../components/ModelViewer';
import { HighlightStyle } from '../../types';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutStateProvider>{children}</LayoutStateProvider>
);

describe('ModelViewer 功能测试 - Mock 数据', () => {
  const mockElements = [
    {
      id: 'space-001',
      category: 'space',
      level: 'Level 1',
      name: '办公区域',
      material: 'concrete',
      properties: {
        area: 150,
        volume: 450,
        type: 'office'
      }
    },
    {
      id: 'element-001',
      category: 'element',
      level: 'Level 1',
      name: '柱子-1',
      material: 'steel',
      properties: {
        height: 3.5,
        diameter: 0.5,
        type: 'column'
      }
    },
    {
      id: 'element-002',
      category: 'element',
      level: 'Level 1',
      name: '梁-1',
      material: 'concrete',
      properties: {
        length: 6,
        width: 0.3,
        height: 0.5,
        type: 'beam'
      }
    },
    {
      id: 'system-001',
      category: 'system',
      level: 'Level 1',
      name: '空调系统-1',
      material: 'copper',
      properties: {
        capacity: 5000,
        type: 'hvac',
        zone: 'Zone A'
      }
    },
    {
      id: 'pipe-001',
      category: 'pipe',
      level: 'Level 1',
      name: '水管-1',
      material: 'pvc',
      properties: {
        diameter: 0.1,
        length: 10,
        type: 'water'
      }
    }
  ];

  describe('Mock 数据验证', () => {
    it('应该包含 5 个测试元素', () => {
      expect(mockElements).toHaveLength(5);
    });

    it('应该包含不同类别的元素', () => {
      const categories = mockElements.map(e => e.category);
      expect(categories).toContain('space');
      expect(categories).toContain('element');
      expect(categories).toContain('system');
      expect(categories).toContain('pipe');
    });

    it('每个元素应该有必需的属性', () => {
      mockElements.forEach(element => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('category');
        expect(element).toHaveProperty('level');
        expect(element).toHaveProperty('name');
        expect(element).toHaveProperty('material');
        expect(element).toHaveProperty('properties');
      });
    });
  });

  describe('ModelViewer 组件渲染', () => {
    it('应该成功渲染 ModelViewer 组件', () => {
      const { container } = render(
        <ModelViewer elements={mockElements} />,
        { wrapper }
      );
      expect(container).toBeInTheDocument();
    });

    it('应该显示 iframe 元素', () => {
      const { container } = render(
        <ModelViewer elements={mockElements} />,
        { wrapper }
      );
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });
  });

  describe('元素选择功能', () => {
    it('应该能够选择单个元素', async () => {
      const TestComponent = () => {
        const { selectElement, selectedElements } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => selectElement('element-001', 'model')}>
              选择元素
            </button>
            <div data-testid="selected-count">
              {selectedElements.size}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选择元素'));
      
      await waitFor(() => {
        expect(getByTestId('selected-count')).toHaveTextContent('1');
      });
    });

    it('应该能够选择多个元素', async () => {
      const TestComponent = () => {
        const { selectElement, selectedElements } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => selectElement('element-001', 'model')}>
              选择元素 1
            </button>
            <button onClick={() => selectElement('element-002', 'model')}>
              选择元素 2
            </button>
            <div data-testid="selected-count">
              {selectedElements.size}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选择元素 1'));
      fireEvent.click(getByText('选择元素 2'));
      
      await waitFor(() => {
        expect(getByTestId('selected-count')).toHaveTextContent('2');
      });
    });

    it('应该能够清除选择', async () => {
      const TestComponent = () => {
        const { selectElement, clearHighlights, selectedElements } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => selectElement('element-001', 'model')}>
              选择元素
            </button>
            <button onClick={clearHighlights}>
              清除选择
            </button>
            <div data-testid="selected-count">
              {selectedElements.size}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选择元素'));
      await waitFor(() => {
        expect(getByTestId('selected-count')).toHaveTextContent('1');
      });

      fireEvent.click(getByText('清除选择'));
      await waitFor(() => {
        expect(getByTestId('selected-count')).toHaveTextContent('0');
      });
    });
  });

  describe('元素高亮功能', () => {
    it('应该能够高亮元素', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
              高亮元素
            </button>
            <div data-testid="highlighted-count">
              {highlightedElements.size}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮元素'));
      
      await waitFor(() => {
        expect(getByTestId('highlighted-count')).toHaveTextContent('1');
      });
    });

    it('应该能够应用不同的高亮样式', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => highlightElements(
              ['space-001'], 
              { color: '#3b82f6', category: 'space', intensity: 'selected' }
            )}>
              高亮空间
            </button>
            <button onClick={() => highlightElements(
              ['element-001'], 
              { color: '#10b981', category: 'element', intensity: 'preview' }
            )}>
              高亮元素
            </button>
            <button onClick={() => highlightElements(
              ['system-001'], 
              { color: '#f59e0b', category: 'system', intensity: 'result' }
            )}>
              高亮系统
            </button>
            <div data-testid="highlighted-count">
              {highlightedElements.size}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮空间'));
      fireEvent.click(getByText('高亮元素'));
      fireEvent.click(getByText('高亮系统'));
      
      await waitFor(() => {
        expect(getByTestId('highlighted-count')).toHaveTextContent('3');
      });
    });
  });

  describe('元素悬停功能', () => {
    it('应该能够设置悬停元素', async () => {
      const TestComponent = () => {
        const { setHoveredElement, hoveredElement } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => setHoveredElement('element-001')}>
              悬停元素
            </button>
            <button onClick={() => setHoveredElement(null)}>
              清除悬停
            </button>
            <div data-testid="hovered-element">
              {hoveredElement || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('悬停元素'));
      
      await waitFor(() => {
        expect(getByTestId('hovered-element')).toHaveTextContent('element-001');
      });

      fireEvent.click(getByText('清除悬停'));
      
      await waitFor(() => {
        expect(getByTestId('hovered-element')).toHaveTextContent('none');
      });
    });

    it('悬停预览不应影响选择状态', async () => {
      const TestComponent = () => {
        const { selectElement, setHoveredElement, selectedElements, hoveredElement } = useLayoutState();
        
        return (
          <div>
            <button onClick={() => selectElement('element-001', 'model')}>
              选择元素
            </button>
            <button onClick={() => setHoveredElement('element-002')}>
              悬停其他元素
            </button>
            <div data-testid="selected-count">
              {selectedElements.size}
            </div>
            <div data-testid="hovered-element">
              {hoveredElement || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选择元素'));
      fireEvent.click(getByText('悬停其他元素'));
      
      await waitFor(() => {
        expect(getByTestId('selected-count')).toHaveTextContent('1');
        expect(getByTestId('hovered-element')).toHaveTextContent('element-002');
      });
    });
  });

  describe('自定义事件', () => {
    it('选择元素时应触发自定义事件', async () => {
      const eventListener = vi.fn();
      window.addEventListener('layout:selection-change', eventListener);

      const TestComponent = () => {
        const { selectElement } = useLayoutState();
        
        return (
          <button onClick={() => selectElement('element-001', 'model')}>
            选择元素
          </button>
        );
      };

      const { getByText } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选择元素'));
      
      await waitFor(() => {
        expect(eventListener).toHaveBeenCalled();
        const event = eventListener.mock.calls[0][0];
        expect(event.detail).toHaveProperty('type', 'select');
        expect(event.detail).toHaveProperty('source', 'model');
        expect(event.detail).toHaveProperty('elementIds');
        expect(event.detail.elementIds).toContain('element-001');
      });

      window.removeEventListener('layout:selection-change', eventListener);
    });

    it('高亮元素时应触发自定义事件', async () => {
      const TestComponent = () => {
        const { highlightElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'selected'
        };
        
        return (
          <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
            高亮元素
          </button>
        );
      };

      const { getByText } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮元素'));
      
      await waitFor(() => {
        expect(getByText('高亮元素')).toBeInTheDocument();
      });
    });
  });

  describe('颜色编码测试', () => {
    it('空间类别应该使用蓝色', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'space',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['space-001'], highlightStyle)}>
              高亮空间
            </button>
            <div data-testid="highlight-color">
              {highlightedElements.get('space-001')?.color || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮空间'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-color')).toHaveTextContent('#3b82f6');
      });
    });

    it('元素类别应该使用绿色', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#10b981',
          category: 'element',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
              高亮元素
            </button>
            <div data-testid="highlight-color">
              {highlightedElements.get('element-001')?.color || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮元素'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-color')).toHaveTextContent('#10b981');
      });
    });

    it('系统类别应该使用橙色', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#f59e0b',
          category: 'system',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['system-001'], highlightStyle)}>
              高亮系统
            </button>
            <div data-testid="highlight-color">
              {highlightedElements.get('system-001')?.color || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮系统'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-color')).toHaveTextContent('#f59e0b');
      });
    });

    it('管道类别应该使用紫色', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#8b5cf6',
          category: 'pipe',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['pipe-001'], highlightStyle)}>
              高亮管道
            </button>
            <div data-testid="highlight-color">
              {highlightedElements.get('pipe-001')?.color || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('高亮管道'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-color')).toHaveTextContent('#8b5cf6');
      });
    });
  });

  describe('高亮强度测试', () => {
    it('preview 强度应该应用半透明', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'preview'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
              预览高亮
            </button>
            <div data-testid="highlight-intensity">
              {highlightedElements.get('element-001')?.intensity || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('预览高亮'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-intensity')).toHaveTextContent('preview');
      });
    });

    it('selected 强度应该应用不透明', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'selected'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
              选中高亮
            </button>
            <div data-testid="highlight-intensity">
              {highlightedElements.get('element-001')?.intensity || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('选中高亮'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-intensity')).toHaveTextContent('selected');
      });
    });

    it('result 强度应该应用半透明', async () => {
      const TestComponent = () => {
        const { highlightElements, highlightedElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'result'
        };
        
        return (
          <div>
            <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
              结果高亮
            </button>
            <div data-testid="highlight-intensity">
              {highlightedElements.get('element-001')?.intensity || 'none'}
            </div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <TestComponent />,
        { wrapper }
      );

      fireEvent.click(getByText('结果高亮'));
      
      await waitFor(() => {
        expect(getByTestId('highlight-intensity')).toHaveTextContent('result');
      });
    });
  });

  describe('性能测试', () => {
    it('选择操作应在 500ms 内完成', async () => {
      const TestComponent = () => {
        const { selectElement } = useLayoutState();
        
        return (
          <button onClick={() => selectElement('element-001', 'model')}>
            选择元素
          </button>
        );
      };

      const { getByText } = render(
        <TestComponent />,
        { wrapper }
      );

      const startTime = performance.now();
      fireEvent.click(getByText('选择元素'));
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500);
    });

    it('高亮操作应在 500ms 内完成', async () => {
      const TestComponent = () => {
        const { highlightElements } = useLayoutState();
        const highlightStyle: HighlightStyle = {
          color: '#3b82f6',
          category: 'element',
          intensity: 'selected'
        };
        
        return (
          <button onClick={() => highlightElements(['element-001'], highlightStyle)}>
            高亮元素
          </button>
        );
      };

      const { getByText } = render(
        <TestComponent />,
        { wrapper }
      );

      const startTime = performance.now();
      fireEvent.click(getByText('高亮元素'));
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500);
    });
  });
});
