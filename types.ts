export enum BIMOperation {
  ISOLATE = 'ISOLATE',
  HIDE = 'HIDE',
  COLOR_CODE = 'COLOR_CODE',
  SELECT = 'SELECT',
  RESET = 'RESET',
  UNKNOWN = 'UNKNOWN',
  ROTATE_LEFT = 'ROTATE_LEFT',
  ROTATE_RIGHT = 'ROTATE_RIGHT'
}

export interface BIMActionPayload {
  operation: BIMOperation;
  category: string | null;
  level: string | null;
  material: string | null;
}

export interface BIMSuggestion {
  label: string;
  payload: BIMActionPayload;
}

export interface BIMQueryResponse extends BIMActionPayload {
  keywords: string[];
  reasoning: string;
  suggestions?: BIMSuggestion[];
}

export interface MockBIMElement {
  id: string;
  category: string;
  level: string;
  name: string;
  material: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestions?: BIMSuggestion[];
}

export type GestureType = 'NONE' | 'ROTATE_LEFT' | 'ROTATE_RIGHT' | 'WAVE';

// 布局状态类型
export interface LayoutState {
  // 分屏位置（0-1之间的值，表示上下分屏的比例）
  dividerPosition: number;
  // 面板最大化状态
  maximizedPane: 'none' | 'top' | 'bottom' | 'right';
  // 面板最小化状态
  minimizedPanes: string[];
  // 高亮样式
  highlightStyle: HighlightStyle;
  // 主题模式
  theme: 'light' | 'dark';
}

// 布局操作类型
export interface LayoutActions {
  // 设置分屏位置
  setDividerPosition: (position: number) => void;
  // 最大化面板
  maximizePane: (pane: 'none' | 'top' | 'bottom' | 'right') => void;
  // 最小化面板
  minimizePane: (pane: 'top' | 'bottom' | 'right') => void;
  // 恢复面板
  restorePane: (pane: 'top' | 'bottom' | 'right') => void;
  // 设置高亮样式
  setHighlightStyle: (style: HighlightStyle) => void;
  // 切换主题
  toggleTheme: () => void;
}

// 高亮样式类型
export interface HighlightStyle {
  color: string;
  opacity: number;
  thickness: number;
}
