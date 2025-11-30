import React, { useState } from 'react';
import ModelViewer, { BIMElement } from './ModelViewer';
import { HighlightStyle } from '../types';

// Mock BIM elements for demonstration
const mockElements: BIMElement[] = [
  {
    id: 'elem-001',
    name: 'Wall-001',
    type: 'Wall',
    spaceId: 'space-101',
    geometry: {
      position: [0, 0, 0],
      boundingBox: {
        min: [0, 0, 0],
        max: [10, 3, 0.2],
      },
    },
    properties: {
      material: 'Concrete',
      thickness: 200,
    },
  },
  {
    id: 'elem-002',
    name: 'Door-001',
    type: 'Door',
    spaceId: 'space-101',
    geometry: {
      position: [5, 0, 0],
      boundingBox: {
        min: [4.5, 0, 0],
        max: [5.5, 2.1, 0.1],
      },
    },
    properties: {
      width: 900,
      height: 2100,
    },
  },
  {
    id: 'elem-003',
    name: 'Window-001',
    type: 'Window',
    spaceId: 'space-101',
    geometry: {
      position: [2, 1.5, 0],
      boundingBox: {
        min: [1.5, 1, 0],
        max: [2.5, 2, 0.1],
      },
    },
    properties: {
      width: 1000,
      height: 1000,
    },
  },
];

const ModelViewerExample: React.FC = () => {
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [highlightedElements, setHighlightedElements] = useState<Map<string, HighlightStyle>>(new Map());
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const handleElementClick = (elementId: string) => {
    console.log('Element clicked:', elementId);
    
    // Toggle selection
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementId)) {
      newSelected.delete(elementId);
    } else {
      newSelected.add(elementId);
    }
    setSelectedElements(newSelected);

    // Add highlight
    const newHighlighted = new Map(highlightedElements);
    if (newSelected.has(elementId)) {
      newHighlighted.set(elementId, {
        color: '#3B82F6',
        category: 'element',
        intensity: 'selected',
      });
    } else {
      newHighlighted.delete(elementId);
    }
    setHighlightedElements(newHighlighted);
  };

  const handleElementHover = (elementId: string | null) => {
    console.log('Element hovered:', elementId);
    setHoveredElement(elementId);

    // Add preview highlight
    if (elementId && !selectedElements.has(elementId)) {
      const newHighlighted = new Map(highlightedElements);
      newHighlighted.set(elementId, {
        color: '#60A5FA',
        category: 'element',
        intensity: 'preview',
      });
      setHighlightedElements(newHighlighted);
    }
  };

  const handleClearSelection = () => {
    setSelectedElements(new Set());
    setHighlightedElements(new Map());
    setHoveredElement(null);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 mb-2">ModelViewer Component Example</h1>
        <div className="flex gap-2">
          <button
            onClick={handleClearSelection}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={() => handleElementClick('elem-001')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Wall
          </button>
          <button
            onClick={() => handleElementClick('elem-002')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Select Door
          </button>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Selected: {selectedElements.size} elements | Highlighted: {highlightedElements.size} elements
        </div>
      </div>

      <div className="flex-1 p-4">
        <ModelViewer
          elements={mockElements}
          selectedElements={selectedElements}
          highlightedElements={highlightedElements}
          hoveredElement={hoveredElement}
          onElementClick={handleElementClick}
          onElementHover={handleElementHover}
          paneState="normal"
        />
      </div>
    </div>
  );
};

export default ModelViewerExample;
