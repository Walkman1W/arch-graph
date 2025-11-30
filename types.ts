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

// 布局状态相关类型定义
export enum PanelState {
  NORMAL = 'NORMAL',
  MAXIMIZED = 'MAXIMIZED',
  MINIMIZED = 'MINIMIZED'
}

export enum PanelId {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

export interface HighlightStyle {
  color: string;
  opacity: number;
  borderColor?: string;
  borderWidth?: number;
  scale?: number;
}

export interface LayoutState {
  // 分隔条位置 (0.2 到 0.8 之间)
  dividerPosition: number;
  
  // 面板状态
  topPanelState: PanelState;
  bottomPanelState: PanelState;
  
  // 选中和高亮的元素
  selectedElements: string[];
  highlightedElements: string[];
  hoveredElement: string | null;
  
  // 高亮样式配置
  highlightStyles: {
    selected: HighlightStyle;
    highlighted: HighlightStyle;
    hovered: HighlightStyle;
  };
  
  // 同步状态
  syncEnabled: boolean;
  lastSyncTime: number | null;
}

export interface LayoutActions {
  // 分隔条操作
  setDividerPosition: (position: number) => void;
  resetDividerPosition: () => void;
  
  // 面板状态操作
  maximizePane: (panelId: PanelId) => void;
  minimizePane: (panelId: PanelId) => void;
  restorePane: (panelId: PanelId) => void;
  restoreAllPanes: () => void;
  
  // 元素选择操作
  selectElement: (elementId: string, source?: 'model' | 'graph') => void;
  deselectElement: (elementId: string) => void;
  selectMultipleElements: (elementIds: string[], source?: 'model' | 'graph') => void;
  clearSelection: () => void;
  
  // 元素高亮操作
  highlightElement: (elementId: string) => void;
  unhighlightElement: (elementId: string) => void;
  highlightMultipleElements: (elementIds: string[]) => void;
  clearHighlight: () => void;
  
  // 悬停操作
  setHoveredElement: (elementId: string | null) => void;
  
  // 同步控制
  setSyncEnabled: (enabled: boolean) => void;
  
  // 批量操作
  setState: (partialState: Partial<LayoutState>) => void;
}

export interface LayoutContextType {
  state: LayoutState;
  actions: LayoutActions;
}
