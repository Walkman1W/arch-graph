/**
 * Example component demonstrating LayoutStateProvider usage
 * This file can be used for manual testing and verification
 */
import React from 'react';
import { useLayoutState } from './LayoutStateProvider';

export const LayoutStateExample: React.FC = () => {
  const {
    dividerPosition,
    paneStates,
    selectedElements,
    highlightedElements,
    hoveredElement,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane,
    resetLayout,
    selectElement,
    highlightElements,
    clearHighlights,
    setHoveredElement,
  } = useLayoutState();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Layout State Debug Panel</h2>
      
      {/* Current State Display */}
      <div className="mb-4 p-3 bg-slate-50 rounded">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <p className="text-sm">Divider Position: {(dividerPosition * 100).toFixed(0)}%</p>
        <p className="text-sm">Model Pane: {paneStates.model}</p>
        <p className="text-sm">Graph Pane: {paneStates.graph}</p>
        <p className="text-sm">Selected Elements: {selectedElements.size}</p>
        <p className="text-sm">Highlighted Elements: {highlightedElements.size}</p>
        <p className="text-sm">Hovered Element: {hoveredElement || 'none'}</p>
      </div>

      {/* Divider Controls */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Divider Position:</h3>
        <input
          type="range"
          min="0.2"
          max="0.8"
          step="0.05"
          value={dividerPosition}
          onChange={(e) => setDividerPosition(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Pane Controls */}
      <div className="mb-4 space-y-2">
        <h3 className="font-semibold mb-2">Pane Controls:</h3>
        <div className="flex gap-2">
          <button
            onClick={() => maximizePane('model')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Maximize Model
          </button>
          <button
            onClick={() => maximizePane('graph')}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Maximize Graph
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => minimizePane('model')}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
          >
            Minimize Model
          </button>
          <button
            onClick={() => minimizePane('graph')}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
          >
            Minimize Graph
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => restorePane('model')}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
          >
            Restore Panes
          </button>
          <button
            onClick={() => resetLayout()}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Reset Layout
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="mb-4 space-y-2">
        <h3 className="font-semibold mb-2">Selection Controls:</h3>
        <div className="flex gap-2">
          <button
            onClick={() => selectElement('element-1', 'model')}
            className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
          >
            Select Element 1
          </button>
          <button
            onClick={() => selectElement('element-2', 'graph')}
            className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
          >
            Select Element 2
          </button>
          <button
            onClick={() => clearHighlights()}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Highlight Controls */}
      <div className="mb-4 space-y-2">
        <h3 className="font-semibold mb-2">Highlight Controls:</h3>
        <div className="flex gap-2">
          <button
            onClick={() => highlightElements(['element-3', 'element-4'], {
              color: '#3b82f6',
              category: 'element',
              intensity: 'selected',
            })}
            className="px-3 py-1 bg-cyan-500 text-white rounded text-sm"
          >
            Highlight Elements
          </button>
          <button
            onClick={() => setHoveredElement('element-5')}
            className="px-3 py-1 bg-teal-500 text-white rounded text-sm"
          >
            Hover Element 5
          </button>
          <button
            onClick={() => setHoveredElement(null)}
            className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
          >
            Clear Hover
          </button>
        </div>
      </div>
    </div>
  );
};
