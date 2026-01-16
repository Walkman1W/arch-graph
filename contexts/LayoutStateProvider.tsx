import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  LayoutState, 
  LayoutActions, 
  LayoutPreferences, 
  PaneType, 
  PaneState,
  SelectionSource,
  HighlightStyle 
} from '../types';

// Default layout state
const DEFAULT_DIVIDER_POSITION = 0.6;
const MIN_PANE_HEIGHT = 0.2;
const MAX_PANE_HEIGHT = 0.8;
const LOCAL_STORAGE_KEY = 'arch-graph-layout-preferences';

const defaultLayoutState: LayoutState = {
  dividerPosition: DEFAULT_DIVIDER_POSITION,
  paneStates: {
    model: 'normal',
    graph: 'normal',
  },
  selectedElements: new Set<string>(),
  highlightedElements: new Map<string, HighlightStyle>(),
  hoveredElement: null,
  previousDividerPosition: DEFAULT_DIVIDER_POSITION,
};

// Context type combining state and actions
interface LayoutContextType extends LayoutState, LayoutActions {}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Custom hook to use layout context
export const useLayoutState = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutState must be used within a LayoutStateProvider');
  }
  return context;
};

interface LayoutStateProviderProps {
  children: ReactNode;
}

export const LayoutStateProvider: React.FC<LayoutStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<LayoutState>(() => {
    // Load from local storage on mount
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const preferences: LayoutPreferences = JSON.parse(stored);
        return {
          ...defaultLayoutState,
          dividerPosition: preferences.dividerPosition,
          paneStates: preferences.paneStates,
          previousDividerPosition: preferences.dividerPosition,
        };
      }
    } catch (error) {
      console.warn('Failed to load layout preferences from local storage:', error);
    }
    return defaultLayoutState;
  });

  // Save to local storage whenever layout state changes
  useEffect(() => {
    try {
      const preferences: LayoutPreferences = {
        dividerPosition: state.dividerPosition,
        paneStates: state.paneStates,
        timestamp: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save layout preferences to local storage:', error);
    }
  }, [state.dividerPosition, state.paneStates]);

  // Set divider position with constraints
  const setDividerPosition = useCallback((position: number) => {
    const clampedPosition = Math.max(MIN_PANE_HEIGHT, Math.min(MAX_PANE_HEIGHT, position));
    setState(prev => ({
      ...prev,
      dividerPosition: clampedPosition,
    }));
  }, []);

  // Maximize a pane
  const maximizePane = useCallback((pane: PaneType) => {
    setState(prev => {
      // Store current divider position for restore
      const newState = {
        ...prev,
        previousDividerPosition: prev.dividerPosition,
        paneStates: {
          model: pane === 'model' ? 'maximized' as PaneState : 'minimized' as PaneState,
          graph: pane === 'graph' ? 'maximized' as PaneState : 'minimized' as PaneState,
        },
      };
      return newState;
    });
  }, []);

  // Minimize a pane
  const minimizePane = useCallback((pane: PaneType) => {
    setState(prev => {
      const otherPane: PaneType = pane === 'model' ? 'graph' : 'model';
      
      // Prevent both panes from being minimized
      if (prev.paneStates[otherPane] === 'minimized') {
        console.warn('Cannot minimize both panes simultaneously');
        return prev;
      }

      return {
        ...prev,
        previousDividerPosition: prev.dividerPosition,
        paneStates: {
          ...prev.paneStates,
          [pane]: 'minimized',
          [otherPane]: prev.paneStates[otherPane] === 'minimized' ? 'normal' : prev.paneStates[otherPane],
        },
      };
    });
  }, []);

  // Restore a pane to normal state
  const restorePane = useCallback((pane: PaneType) => {
    setState(prev => ({
      ...prev,
      dividerPosition: prev.previousDividerPosition,
      paneStates: {
        model: 'normal',
        graph: 'normal',
      },
    }));
  }, []);

  // Reset layout to default
  const resetLayout = useCallback(() => {
    setState({
      ...defaultLayoutState,
      selectedElements: new Set<string>(),
      highlightedElements: new Map<string, HighlightStyle>(),
    });
  }, []);

  // Select an element
  const selectElement = useCallback((elementId: string, source: SelectionSource) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedElements);
      newSelected.add(elementId);
      
      // Emit custom event for extensibility
      const event = new CustomEvent('layout:selection-change', {
        detail: {
          type: 'select',
          source,
          elementIds: [elementId],
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);

      // Emit graph center signal when selecting from model
      if (source === 'model') {
        const centerEvent = new CustomEvent('graph:center-nodes', {
          detail: {
            nodeIds: [elementId],
            animate: true,
          },
        });
        window.dispatchEvent(centerEvent);
      }

      return {
        ...prev,
        selectedElements: newSelected,
      };
    });
  }, []);

  // Highlight elements with a specific style
  const highlightElements = useCallback((elementIds: string[], style: HighlightStyle) => {
    setState(prev => {
      const newHighlighted = new Map(prev.highlightedElements);
      elementIds.forEach(id => {
        newHighlighted.set(id, style);
      });

      // Emit graph highlight signal
      const highlightEvent = new CustomEvent('graph:highlight-nodes', {
        detail: {
          nodeIds: elementIds,
          highlightStyle: style,
        },
      });
      window.dispatchEvent(highlightEvent);

      return {
        ...prev,
        highlightedElements: newHighlighted,
      };
    });
  }, []);

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedElements: new Set<string>(),
      highlightedElements: new Map<string, HighlightStyle>(),
      hoveredElement: null,
    }));

    // Emit clear event
    const event = new CustomEvent('layout:selection-change', {
      detail: {
        type: 'clear',
        source: 'control',
        elementIds: [],
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  }, []);

  // Set hovered element for preview
  const setHoveredElement = useCallback((elementId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredElement: elementId,
    }));
  }, []);

  const contextValue: LayoutContextType = {
    ...state,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane,
    resetLayout,
    selectElement,
    highlightElements,
    clearHighlights,
    setHoveredElement,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};
