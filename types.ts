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

// Layout State Types
export type PaneState = 'normal' | 'maximized' | 'minimized';
export type PaneType = 'model' | 'graph';
export type SelectionSource = 'model' | 'graph' | 'control';

export interface HighlightStyle {
  color: string;
  category: 'space' | 'element' | 'system' | 'pipe';
  intensity: 'preview' | 'selected' | 'result';
}

export interface LayoutState {
  // Divider position (ratio between 0-1)
  dividerPosition: number;
  
  // Pane states
  paneStates: {
    model: PaneState;
    graph: PaneState;
  };
  
  // Selected elements
  selectedElements: Set<string>;
  
  // Highlighted elements with their styles
  highlightedElements: Map<string, HighlightStyle>;
  
  // Hovered element for preview
  hoveredElement: string | null;
  
  // Previous divider position for restore operations
  previousDividerPosition: number;
}

export interface LayoutActions {
  setDividerPosition: (position: number) => void;
  maximizePane: (pane: PaneType) => void;
  minimizePane: (pane: PaneType) => void;
  restorePane: (pane: PaneType) => void;
  resetLayout: () => void;
  selectElement: (elementId: string, source: SelectionSource) => void;
  highlightElements: (elementIds: string[], style: HighlightStyle) => void;
  clearHighlights: () => void;
  setHoveredElement: (elementId: string | null) => void;
}

export interface LayoutPreferences {
  dividerPosition: number;
  paneStates: {
    model: PaneState;
    graph: PaneState;
  };
  timestamp: number;
}

// BIM Element Types
export interface BIMElement {
  id: string;
  name: string;
  type: string;
  spaceId?: string;
  systemId?: string;
  geometry: {
    position: [number, number, number];
    boundingBox: {
      min: [number, number, number];
      max: [number, number, number];
    };
  };
  properties: Record<string, any>;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  speckleUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface ProjectModalState {
  isOpen: boolean;
  isAdding: boolean;
  newProjectUrl: string;
  newProjectName: string;
}
