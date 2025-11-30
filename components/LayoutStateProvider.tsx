import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LayoutState, LayoutActions, HighlightStyle } from '../types';

// 创建布局状态上下文
const LayoutStateContext = createContext<LayoutState | undefined>(undefined);
const LayoutActionsContext = createContext<LayoutActions | undefined>(undefined);

// 初始布局状态
const initialLayoutState: LayoutState = {
  dividerPosition: 50, // 分割线初始位置（百分比）
  isTopPaneMaximized: false,
  isBottomPaneMaximized: false,
  highlightStyle: {
    color: '#FF0000',
    opacity: 0.8,
    lineWidth: 2
  }
};

// 从本地存储加载布局状态
const loadLayoutState = (): LayoutState => {
  try {
    const savedState = localStorage.getItem('layoutState');
    return savedState ? JSON.parse(savedState) : initialLayoutState;
  } catch (error) {
    console.error('Failed to load layout state from localStorage:', error);
    return initialLayoutState;
  }
};

// 保存布局状态到本地存储
const saveLayoutState = (state: LayoutState) => {
  try {
    localStorage.setItem('layoutState', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save layout state to localStorage:', error);
  }
};

// 布局状态提供者组件
export const LayoutStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从本地存储加载初始布局状态
  const [layoutState, setLayoutState] = useState<LayoutState>(loadLayoutState);

  // 当布局状态变化时保存到本地存储
  useEffect(() => {
    saveLayoutState(layoutState);
  }, [layoutState]);

  // 实现状态操作函数
  const setDividerPosition = (position: number) => {
    if (position >= 0 && position <= 100) {
      setLayoutState(prev => ({
        ...prev,
        dividerPosition: position,
        isTopPaneMaximized: false,
        isBottomPaneMaximized: false
      }));
    }
  };

  const maximizePane = (pane: 'top' | 'bottom') => {
    setLayoutState(prev => ({
      ...prev,
      isTopPaneMaximized: pane === 'top',
      isBottomPaneMaximized: pane === 'bottom'
    }));
  };

  const minimizePane = (pane: 'top' | 'bottom') => {
    setLayoutState(prev => ({
      ...prev,
      isTopPaneMaximized: prev.isTopPaneMaximized && pane !== 'top',
      isBottomPaneMaximized: prev.isBottomPaneMaximized && pane !== 'bottom'
    }));
  };

  const resetLayout = () => {
    setLayoutState(initialLayoutState);
  };

  const setHighlightStyle = (style: HighlightStyle) => {
    setLayoutState(prev => ({
      ...prev,
      highlightStyle: { ...prev.highlightStyle, ...style }
    }));
  };

  // 状态操作对象
  const layoutActions: LayoutActions = {
    setDividerPosition,
    maximizePane,
    minimizePane,
    resetLayout,
    setHighlightStyle
  };

  return (
    <LayoutStateContext.Provider value={layoutState}>
      <LayoutActionsContext.Provider value={layoutActions}>
        {children}
      </LayoutActionsContext.Provider>
    </LayoutStateContext.Provider>
  );
};

// 自定义钩子：获取布局状态
export const useLayoutState = () => {
  const context = useContext(LayoutStateContext);
  if (context === undefined) {
    throw new Error('useLayoutState must be used within a LayoutStateProvider');
  }
  return context;
};

// 自定义钩子：获取布局操作
export const useLayoutActions = () => {
  const context = useContext(LayoutActionsContext);
  if (context === undefined) {
    throw new Error('useLayoutActions must be used within a LayoutStateProvider');
  }
  return context;
};
