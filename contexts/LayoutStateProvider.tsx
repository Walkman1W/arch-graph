import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  LayoutState, 
  LayoutActions, 
  LayoutContextType, 
  PanelState, 
  PanelId,
  HighlightStyle 
} from '../types';

// 默认状态
const DEFAULT_DIVIDER_POSITION = 0.6;
const MIN_DIVIDER_POSITION = 0.2;
const MAX_DIVIDER_POSITION = 0.8;

const defaultHighlightStyles = {
  selected: {
    color: '#3b82f6', // blue-500
    opacity: 1,
    borderColor: '#1e40af', // blue-800
    borderWidth: 2,
    scale: 1.1
  },
  highlighted: {
    color: '#f59e0b', // amber-500
    opacity: 0.8,
    borderColor: '#d97706', // amber-600
    borderWidth: 1,
    scale: 1.05
  },
  hovered: {
    color: '#10b981', // emerald-500
    opacity: 0.6,
    borderColor: '#059669', // emerald-600
    borderWidth: 1,
    scale: 1.02
  }
};

const initialState: LayoutState = {
  dividerPosition: DEFAULT_DIVIDER_POSITION,
  topPanelState: PanelState.NORMAL,
  bottomPanelState: PanelState.NORMAL,
  selectedElements: [],
  highlightedElements: [],
  hoveredElement: null,
  highlightStyles: defaultHighlightStyles,
  syncEnabled: true,
  lastSyncTime: null
};

// 本地存储键
const LAYOUT_STATE_KEY = 'arch-graph-layout-state';

// 状态操作类型
type LayoutAction = 
  | { type: 'SET_DIVIDER_POSITION'; position: number }
  | { type: 'RESET_DIVIDER_POSITION' }
  | { type: 'MAXIMIZE_PANE'; panelId: PanelId }
  | { type: 'MINIMIZE_PANE'; panelId: PanelId }
  | { type: 'RESTORE_PANE'; panelId: PanelId }
  | { type: 'RESTORE_ALL_PANES' }
  | { type: 'SELECT_ELEMENT'; elementId: string; source?: 'model' | 'graph' }
  | { type: 'DESELECT_ELEMENT'; elementId: string }
  | { type: 'SELECT_MULTIPLE_ELEMENTS'; elementIds: string[]; source?: 'model' | 'graph' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'HIGHLIGHT_ELEMENT'; elementId: string }
  | { type: 'UNHIGHLIGHT_ELEMENT'; elementId: string }
  | { type: 'HIGHLIGHT_MULTIPLE_ELEMENTS'; elementIds: string[] }
  | { type: 'CLEAR_HIGHLIGHT' }
  | { type: 'SET_HOVERED_ELEMENT'; elementId: string | null }
  | { type: 'SET_SYNC_ENABLED'; enabled: boolean }
  | { type: 'SET_STATE'; partialState: Partial<LayoutState> }
  | { type: 'LOAD_FROM_STORAGE'; state: LayoutState };

// 工具函数：约束分隔条位置
const constrainDividerPosition = (position: number): number => {
  return Math.max(MIN_DIVIDER_POSITION, Math.min(MAX_DIVIDER_POSITION, position));
};

// Reducer 函数
const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'SET_DIVIDER_POSITION':
      return {
        ...state,
        dividerPosition: constrainDividerPosition(action.position)
      };

    case 'RESET_DIVIDER_POSITION':
      return {
        ...state,
        dividerPosition: DEFAULT_DIVIDER_POSITION
      };

    case 'MAXIMIZE_PANE': {
      const isTopPanel = action.panelId === PanelId.TOP;
      return {
        ...state,
        topPanelState: isTopPanel ? PanelState.MAXIMIZED : PanelState.MINIMIZED,
        bottomPanelState: isTopPanel ? PanelState.MINIMIZED : PanelState.MAXIMIZED
      };
    }

    case 'MINIMIZE_PANE': {
      const isTopPanel = action.panelId === PanelId.TOP;
      return {
        ...state,
        topPanelState: isTopPanel ? PanelState.MINIMIZED : PanelState.NORMAL,
        bottomPanelState: isTopPanel ? PanelState.NORMAL : PanelState.MINIMIZED
      };
    }

    case 'RESTORE_PANE': {
      const isTopPanel = action.panelId === PanelId.TOP;
      const otherPanelState = isTopPanel ? state.bottomPanelState : state.topPanelState;
      
      // 如果另一个面板是最小化的，恢复为普通状态
      const newOtherPanelState = otherPanelState === PanelState.MINIMIZED 
        ? PanelState.NORMAL 
        : otherPanelState;
      
      return {
        ...state,
        topPanelState: isTopPanel ? PanelState.NORMAL : newOtherPanelState,
        bottomPanelState: isTopPanel ? newOtherPanelState : PanelState.NORMAL
      };
    }

    case 'RESTORE_ALL_PANES':
      return {
        ...state,
        topPanelState: PanelState.NORMAL,
        bottomPanelState: PanelState.NORMAL,
        dividerPosition: DEFAULT_DIVIDER_POSITION
      };

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElements: state.selectedElements.includes(action.elementId)
          ? state.selectedElements
          : [...state.selectedElements, action.elementId],
        lastSyncTime: state.syncEnabled ? Date.now() : state.lastSyncTime
      };

    case 'DESELECT_ELEMENT':
      return {
        ...state,
        selectedElements: state.selectedElements.filter(id => id !== action.elementId),
        lastSyncTime: state.syncEnabled ? Date.now() : state.lastSyncTime
      };

    case 'SELECT_MULTIPLE_ELEMENTS':
      return {
        ...state,
        selectedElements: [...new Set([...state.selectedElements, ...action.elementIds])],
        lastSyncTime: state.syncEnabled ? Date.now() : state.lastSyncTime
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedElements: [],
        lastSyncTime: state.syncEnabled ? Date.now() : state.lastSyncTime
      };

    case 'HIGHLIGHT_ELEMENT':
      return {
        ...state,
        highlightedElements: state.highlightedElements.includes(action.elementId)
          ? state.highlightedElements
          : [...state.highlightedElements, action.elementId]
      };

    case 'UNHIGHLIGHT_ELEMENT':
      return {
        ...state,
        highlightedElements: state.highlightedElements.filter(id => id !== action.elementId)
      };

    case 'HIGHLIGHT_MULTIPLE_ELEMENTS':
      return {
        ...state,
        highlightedElements: [...new Set([...state.highlightedElements, ...action.elementIds])]
      };

    case 'CLEAR_HIGHLIGHT':
      return {
        ...state,
        highlightedElements: []
      };

    case 'SET_HOVERED_ELEMENT':
      return {
        ...state,
        hoveredElement: action.elementId
      };

    case 'SET_SYNC_ENABLED':
      return {
        ...state,
        syncEnabled: action.enabled
      };

    case 'SET_STATE':
      return {
        ...state,
        ...action.partialState
      };

    case 'LOAD_FROM_STORAGE':
      return action.state;

    default:
      return state;
  }
};

// Context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// 本地存储持久化钩子
const useLayoutPersistence = () => {
  const loadFromStorage = useCallback((): LayoutState | null => {
    try {
      const stored = localStorage.getItem(LAYOUT_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 验证必要字段
        if (parsed && typeof parsed.dividerPosition === 'number') {
          return {
            ...parsed,
            // 确保面板状态有效
            topPanelState: Object.values(PanelState).includes(parsed.topPanelState) 
              ? parsed.topPanelState 
              : initialState.topPanelState,
            bottomPanelState: Object.values(PanelState).includes(parsed.bottomPanelState)
              ? parsed.bottomPanelState
              : initialState.bottomPanelState,
            // 为缺失的字段提供默认值
            hoveredElement: parsed.hoveredElement || null,
            lastSyncTime: parsed.lastSyncTime || null,
            highlightStyles: parsed.highlightStyles || initialState.highlightStyles
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load layout state from localStorage:', error);
    }
    return null;
  }, []);

  const saveToStorage = useCallback((state: LayoutState) => {
    try {
      const stateToSave = {
        dividerPosition: state.dividerPosition,
        topPanelState: state.topPanelState,
        bottomPanelState: state.bottomPanelState,
        selectedElements: state.selectedElements,
        highlightedElements: state.highlightedElements,
        highlightStyles: state.highlightStyles,
        syncEnabled: state.syncEnabled
      };
      localStorage.setItem(LAYOUT_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save layout state to localStorage:', error);
    }
  }, []);

  return { loadFromStorage, saveToStorage };
};

// Provider 组件
export const LayoutStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  const { loadFromStorage, saveToStorage } = useLayoutPersistence();

  // 挂载时从本地存储加载状态
  useEffect(() => {
    const storedState = loadFromStorage();
    if (storedState) {
      dispatch({ type: 'LOAD_FROM_STORAGE', state: storedState });
    }
  }, [loadFromStorage]);

  // 状态变化时保存到本地存储（避免初始加载时保存）
  useEffect(() => {
    const storedState = loadFromStorage();
    if (storedState && JSON.stringify(storedState) === JSON.stringify(state)) {
      // 这是初始加载，不要保存
      return;
    }
    saveToStorage(state);
  }, [state, saveToStorage, loadFromStorage]);

  // 创建 actions
  const actions: LayoutActions = {
    setDividerPosition: useCallback((position: number) => {
      dispatch({ type: 'SET_DIVIDER_POSITION', position });
    }, []),

    resetDividerPosition: useCallback(() => {
      dispatch({ type: 'RESET_DIVIDER_POSITION' });
    }, []),

    maximizePane: useCallback((panelId: PanelId) => {
      dispatch({ type: 'MAXIMIZE_PANE', panelId });
    }, []),

    minimizePane: useCallback((panelId: PanelId) => {
      dispatch({ type: 'MINIMIZE_PANE', panelId });
    }, []),

    restorePane: useCallback((panelId: PanelId) => {
      dispatch({ type: 'RESTORE_PANE', panelId });
    }, []),

    restoreAllPanes: useCallback(() => {
      dispatch({ type: 'RESTORE_ALL_PANES' });
    }, []),

    selectElement: useCallback((elementId: string, source?: 'model' | 'graph') => {
      dispatch({ type: 'SELECT_ELEMENT', elementId, source });
    }, []),

    deselectElement: useCallback((elementId: string) => {
      dispatch({ type: 'DESELECT_ELEMENT', elementId });
    }, []),

    selectMultipleElements: useCallback((elementIds: string[], source?: 'model' | 'graph') => {
      dispatch({ type: 'SELECT_MULTIPLE_ELEMENTS', elementIds, source });
    }, []),

    clearSelection: useCallback(() => {
      dispatch({ type: 'CLEAR_SELECTION' });
    }, []),

    highlightElement: useCallback((elementId: string) => {
      dispatch({ type: 'HIGHLIGHT_ELEMENT', elementId });
    }, []),

    unhighlightElement: useCallback((elementId: string) => {
      dispatch({ type: 'UNHIGHLIGHT_ELEMENT', elementId });
    }, []),

    highlightMultipleElements: useCallback((elementIds: string[]) => {
      dispatch({ type: 'HIGHLIGHT_MULTIPLE_ELEMENTS', elementIds });
    }, []),

    clearHighlight: useCallback(() => {
      dispatch({ type: 'CLEAR_HIGHLIGHT' });
    }, []),

    setHoveredElement: useCallback((elementId: string | null) => {
      dispatch({ type: 'SET_HOVERED_ELEMENT', elementId });
    }, []),

    setSyncEnabled: useCallback((enabled: boolean) => {
      dispatch({ type: 'SET_SYNC_ENABLED', enabled });
    }, []),

    setState: useCallback((partialState: Partial<LayoutState>) => {
      dispatch({ type: 'SET_STATE', partialState });
    }, [])
  };

  const contextValue: LayoutContextType = {
    state,
    actions
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

// 自定义钩子
export const useLayoutState = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutState must be used within a LayoutStateProvider');
  }
  return context;
};

export default LayoutStateProvider;