import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { LayoutStateProvider, useLayoutState } from '../contexts/LayoutStateProvider';
import { HighlightStyle, SelectionSource } from '../types';
import fc from 'fast-check';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = mockLocalStorage as any;

const defaultHighlightStyle: HighlightStyle = {
  color: '#00ff00',
  category: 'element',
  intensity: 'selected',
};

describe('LayoutStateProvider - Property-based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should maintain invariant: selecting element from model adds it to selectedElements', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementId) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.selectElement(elementId, 'model' as SelectionSource);
          });

          expect(result.current.selectedElements.has(elementId)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: selecting multiple elements from graph all appear in selectedElements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (elementIds) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            elementIds.forEach(id => {
              result.current.selectElement(id, 'graph' as SelectionSource);
            });
          });

          elementIds.forEach(id => {
            expect(result.current.selectedElements.has(id)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: hovering an element sets hoveredElement', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementId) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.setHoveredElement(elementId);
          });

          expect(result.current.hoveredElement).toBe(elementId);

          act(() => {
            result.current.setHoveredElement(null);
          });

          expect(result.current.hoveredElement).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: highlighting elements adds them to highlightedElements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (elementIds) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.highlightElements(elementIds, defaultHighlightStyle);
          });

          elementIds.forEach(id => {
            expect(result.current.highlightedElements.has(id)).toBe(true);
            expect(result.current.highlightedElements.get(id)).toEqual(defaultHighlightStyle);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: clearHighlights removes all selections and highlights', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (elementIds) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            elementIds.forEach(id => {
              result.current.selectElement(id, 'model' as SelectionSource);
            });
            result.current.highlightElements(elementIds, defaultHighlightStyle);
            result.current.setHoveredElement(elementIds[0]);
          });

          expect(result.current.selectedElements.size).toBeGreaterThan(0);
          expect(result.current.highlightedElements.size).toBeGreaterThan(0);
          expect(result.current.hoveredElement).toBeDefined();

          act(() => {
            result.current.clearHighlights();
          });

          expect(result.current.selectedElements.size).toBe(0);
          expect(result.current.highlightedElements.size).toBe(0);
          expect(result.current.hoveredElement).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: setDividerPosition clamps between min and max values', () => {
    fc.assert(
      fc.property(
        fc.float(),
        (position) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.setDividerPosition(position);
          });

          expect(result.current.dividerPosition).toBeGreaterThanOrEqual(0.2);
          expect(result.current.dividerPosition).toBeLessThanOrEqual(0.8);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: maximizePane sets one to maximized and other to minimized', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('model', 'graph'),
        (paneType) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.maximizePane(paneType);
          });

          if (paneType === 'model') {
            expect(result.current.paneStates.model).toBe('maximized');
            expect(result.current.paneStates.graph).toBe('minimized');
          } else {
            expect(result.current.paneStates.graph).toBe('maximized');
            expect(result.current.paneStates.model).toBe('minimized');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain invariant: restorePane returns both to normal state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('model', 'graph'),
        (paneType) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.maximizePane(paneType);
          });

          act(() => {
            result.current.restorePane(paneType);
          });

          expect(result.current.paneStates.model).toBe('normal');
          expect(result.current.paneStates.graph).toBe('normal');
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('LayoutStateProvider - Model-to-Graph Synchronization Property', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('Property 8: Model-to-Graph Synchronization - Clicking in model triggers event and updates state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementId) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });
          const eventSpy = vi.fn();

          window.addEventListener('layout:selection-change', eventSpy);

          try {
            act(() => {
              result.current.selectElement(elementId, 'model' as SelectionSource);
            });

            // Invariant 1: Element is in selectedElements
            expect(result.current.selectedElements.has(elementId)).toBe(true);

            // Invariant 2: Custom event was dispatched
            expect(eventSpy).toHaveBeenCalledTimes(1);
            expect(eventSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                detail: expect.objectContaining({
                  type: 'select',
                  source: 'model',
                  elementIds: [elementId],
                }),
              })
            );

            // Invariant 3: Event can be listened by graph viewer
            const event = eventSpy.mock.calls[0][0];
            expect(event.detail).toBeDefined();
            expect(event.detail.type).toBe('select');
            expect(event.detail.source).toBe('model');
            expect(event.detail.elementIds).toContain(elementId);
          } finally {
            window.removeEventListener('layout:selection-change', eventSpy);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Model-to-Graph Synchronization - Multiple selections are cumulative', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        (elementIds) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            elementIds.forEach(id => {
              result.current.selectElement(id, 'model' as SelectionSource);
            });
          });

          // Invariant: All selected elements are present in selectedElements
          elementIds.forEach(id => {
            expect(result.current.selectedElements.has(id)).toBe(true);
          });

          // Invariant: No extra elements are selected
          expect(result.current.selectedElements.size).toBe(elementIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Model-to-Graph Synchronization - Hover preview updates hoveredElement', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementId) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          act(() => {
            result.current.setHoveredElement(elementId);
          });

          // Invariant: Hovered element is set
          expect(result.current.hoveredElement).toBe(elementId);

          act(() => {
            result.current.setHoveredElement(null);
          });

          // Invariant: Hovered element is cleared
          expect(result.current.hoveredElement).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Model-to-Graph Synchronization - ClearHighlights restores initial state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementId) => {
          const wrapper = ({ children }: { children: React.ReactNode }) => (
            <LayoutStateProvider>{children}</LayoutStateProvider>
          );

          const { result } = renderHook(() => useLayoutState(), { wrapper });

          // Get initial state
          const initialSelectedSize = result.current.selectedElements.size;
          const initialHighlightedSize = result.current.highlightedElements.size;
          const initialHovered = result.current.hoveredElement;

          act(() => {
            result.current.selectElement(elementId, 'model' as SelectionSource);
            result.current.highlightElements([elementId], defaultHighlightStyle);
            result.current.setHoveredElement(elementId);
          });

          act(() => {
            result.current.clearHighlights();
          });

          // Invariant: State is restored to initial
          expect(result.current.selectedElements.size).toBe(initialSelectedSize);
          expect(result.current.highlightedElements.size).toBe(initialHighlightedSize);
          expect(result.current.hoveredElement).toBe(initialHovered);
        }
      ),
      { numRuns: 100 }
    );
  });
});
