import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LayoutState, LayoutActions, HighlightStyle } from '../types';

// 创建布局上下文
const LayoutContext = createContext<(LayoutState & LayoutActions) | undefined>(undefined);

// 默认高亮样式
const defaultHighlightStyle: HighlightStyle = {
  color: '#ff0000',
  opacity: 0.7,
  thickness: 2
};

// 默认布局状态
const defaultLayoutState: LayoutState = {
  dividerPosition: 0.5,
  maximizedPane: 'none',
  minimizedPanes: [],
  highlightStyle: defaultHighlightStyle,
  theme: 'light'
};

// 本地存储键
const STORAGE_KEY = 'archGraphLayoutState';

// 布局状态提供者组件
export const LayoutStateProvider = ({ children }: { children: ReactNode }) => {
  // 状态初始化：先从本地存储加载，否则使用默认值
  const [layoutState, setLayoutState] = useState<LayoutState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : defaultLayoutState;
  });

  // 当布局状态变化时保存到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutState));
  }, [layoutState]);

  // 设置分屏位置
  const setDividerPosition = (position: number) => {
    setLayoutState(prev => ({
      ...prev,
      dividerPosition: Math.max(0.1, Math.min(0.9, position)) // 限制在0.1-0.9之间
    }));
  };

  // 最大化面板
  const maximizePane = (pane: 'none' | 'top' | 'bottom' | 'right') => {
    setLayoutState(prev => ({
      ...prev,
      maximizedPane: pane
    }));
  };

  // 最小化面板
  const minimizePane = (pane: 'top' | 'bottom' | 'right') => {
    setLayoutState(prev => ({
      ...prev,
      minimizedPanes: [...prev.minimizedPanes, pane]
    }));
  };

  // 恢复面板
  const restorePane = (pane: 'top' | 'bottom' | 'right') => {
    setLayoutState(prev => ({
      ...prev,
      minimizedPanes: prev.minimizedPanes.filter(p => p !== pane)
    }));
  };

  // 设置高亮样式
  const setHighlightStyle = (style: HighlightStyle) => {
    setLayoutState(prev => ({
      ...prev,
      highlightStyle: {
        ...prev.highlightStyle,
        ...style
      }
    }));
  };

  // 切换主题
  const toggleTheme = () => {
    setLayoutState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // 组合状态和操作方法
  const value = {
    ...layoutState,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane,
    setHighlightStyle,
    toggleTheme
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

// 自定义钩子：获取布局状态和操作方法
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutStateProvider');
  }
  return context;
};

export default LayoutStateProvider;