# Layout State Management

This directory contains the core layout state management infrastructure for the Arch-Graph three-pane layout system.

## Files

- **LayoutStateProvider.tsx**: React Context provider for global layout state management
- **LayoutStateExample.tsx**: Example component demonstrating usage (for testing/verification)

## Features Implemented

### 1. State Management
- ✅ Divider position management with constraints (20%-80%)
- ✅ Pane state management (normal, maximized, minimized)
- ✅ Element selection tracking
- ✅ Element highlighting with custom styles
- ✅ Hover preview state

### 2. State Operations
- ✅ `setDividerPosition(position)` - Set divider position with automatic clamping
- ✅ `maximizePane(pane)` - Maximize a pane (model or graph)
- ✅ `minimizePane(pane)` - Minimize a pane with mutual exclusion
- ✅ `restorePane(pane)` - Restore panes to previous state
- ✅ `resetLayout()` - Reset to default layout
- ✅ `selectElement(elementId, source)` - Select an element
- ✅ `highlightElements(elementIds, style)` - Highlight multiple elements
- ✅ `clearHighlights()` - Clear all selections and highlights
- ✅ `setHoveredElement(elementId)` - Set hover preview

### 3. Local Storage Persistence
- ✅ Automatic save on state changes
- ✅ Automatic load on mount
- ✅ Error handling with fallback to defaults
- ✅ Stores: divider position, pane states, timestamp

### 4. Event System
- ✅ Custom events emitted for selection changes
- ✅ Event details include: type, source, elementIds, timestamp
- ✅ Enables extensibility for future features

## Usage

### Basic Setup

```tsx
import { LayoutStateProvider } from './contexts/LayoutStateProvider';
import App from './App';

function Root() {
  return (
    <LayoutStateProvider>
      <App />
    </LayoutStateProvider>
  );
}
```

### Using the Hook

```tsx
import { useLayoutState } from './contexts/LayoutStateProvider';

function MyComponent() {
  const {
    dividerPosition,
    paneStates,
    selectedElements,
    setDividerPosition,
    maximizePane,
    selectElement,
  } = useLayoutState();

  return (
    <div>
      <p>Divider at {dividerPosition * 100}%</p>
      <button onClick={() => maximizePane('model')}>
        Maximize Model
      </button>
    </div>
  );
}
```

### Listening to Events

```tsx
useEffect(() => {
  const handleSelectionChange = (event: CustomEvent) => {
    console.log('Selection changed:', event.detail);
  };

  window.addEventListener('layout:selection-change', handleSelectionChange);
  return () => {
    window.removeEventListener('layout:selection-change', handleSelectionChange);
  };
}, []);
```

## Constraints and Validation

### Divider Position
- Minimum: 20% (0.2)
- Maximum: 80% (0.8)
- Automatically clamped to valid range

### Pane States
- Cannot minimize both panes simultaneously
- Maximizing one pane automatically minimizes the other
- Previous divider position stored for restore operations

### Local Storage
- Key: `arch-graph-layout-preferences`
- Graceful degradation if localStorage is unavailable
- Errors logged to console for debugging

## Type Definitions

All types are defined in `types.ts`:

```typescript
export type PaneState = 'normal' | 'maximized' | 'minimized';
export type PaneType = 'model' | 'graph';
export type SelectionSource = 'model' | 'graph' | 'control';

export interface HighlightStyle {
  color: string;
  category: 'space' | 'element' | 'system' | 'pipe';
  intensity: 'preview' | 'selected' | 'result';
}

export interface LayoutState {
  dividerPosition: number;
  paneStates: {
    model: PaneState;
    graph: PaneState;
  };
  selectedElements: Set<string>;
  highlightedElements: Map<string, HighlightStyle>;
  hoveredElement: string | null;
  previousDividerPosition: number;
}
```

## Testing

To manually test the implementation:

1. Wrap your app with `LayoutStateProvider`
2. Import and render `LayoutStateExample` component
3. Use the debug panel to test all operations
4. Check browser console for event logs
5. Verify localStorage persistence by refreshing the page

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 1.18**: State persistence to browser local storage ✅
- **Requirement 1.19**: State restoration on application load ✅

## Next Steps

This state management infrastructure is ready to be integrated with:
- SplitPaneContainer (Task 2)
- ModelViewer component (Task 5)
- GraphViewer component (Task 6)
- ControlPanel enhancements (Task 8)
