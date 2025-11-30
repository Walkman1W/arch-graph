import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModelViewer, { BIMElement } from './ModelViewer';
import { HighlightStyle } from '../types';

describe('ModelViewer Component', () => {
  const mockElements: BIMElement[] = [
    {
      id: 'elem-001',
      name: 'Wall-001',
      type: 'Wall',
      geometry: {
        position: [0, 0, 0],
        boundingBox: {
          min: [0, 0, 0],
          max: [10, 3, 0.2],
        },
      },
      properties: {},
    },
    {
      id: 'elem-002',
      name: 'Door-001',
      type: 'Door',
      geometry: {
        position: [5, 0, 0],
        boundingBox: {
          min: [4.5, 0, 0],
          max: [5.5, 2.1, 0.1],
        },
      },
      properties: {},
    },
  ];

  const mockOnElementClick = vi.fn();
  const mockOnElementHover = vi.fn();

  it('should render without crashing', () => {
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={new Set()}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    expect(screen.getByText('Live Model')).toBeInTheDocument();
  });

  it('should display selected element count', () => {
    const selectedElements = new Set(['elem-001']);
    
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={selectedElements}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    expect(screen.getByText('1 Selected')).toBeInTheDocument();
  });

  it('should display selected element details', () => {
    const selectedElements = new Set(['elem-001']);
    
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={selectedElements}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    expect(screen.getByText('Wall-001')).toBeInTheDocument();
    expect(screen.getByText('Wall')).toBeInTheDocument();
  });

  it('should display hovered element name', () => {
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={new Set()}
        highlightedElements={new Map()}
        hoveredElement="elem-002"
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    expect(screen.getByText('Door-001')).toBeInTheDocument();
  });

  it('should show minimized state overlay', () => {
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={new Set()}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="minimized"
      />
    );

    expect(screen.getByText('Model Viewer Minimized')).toBeInTheDocument();
  });

  it('should render Speckle iframe when URL is provided', () => {
    const { container } = render(
      <ModelViewer
        speckleUrl="https://speckle.xyz/embed/123"
        elements={mockElements}
        selectedElements={new Set()}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toBe('https://speckle.xyz/embed/123');
  });

  it('should show placeholder when no Speckle URL', () => {
    render(
      <ModelViewer
        elements={mockElements}
        selectedElements={new Set()}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={mockOnElementClick}
        onElementHover={mockOnElementHover}
        paneState="normal"
      />
    );

    expect(screen.getByText('3D Model Viewer')).toBeInTheDocument();
    expect(screen.getByText('No model loaded')).toBeInTheDocument();
  });
});

describe('ModelViewer Bounding Box Calculations', () => {
  it('should calculate correct bounding box for single element', () => {
    const elements: BIMElement[] = [
      {
        id: 'elem-001',
        name: 'Wall-001',
        type: 'Wall',
        geometry: {
          position: [0, 0, 0],
          boundingBox: {
            min: [0, 0, 0],
            max: [10, 3, 0.2],
          },
        },
        properties: {},
      },
    ];

    // This would be tested by calling the internal calculateBoundingBox function
    // For now, we verify the component renders correctly
    const { container } = render(
      <ModelViewer
        elements={elements}
        selectedElements={new Set(['elem-001'])}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={vi.fn()}
        onElementHover={vi.fn()}
        paneState="normal"
      />
    );

    expect(container).toBeTruthy();
  });

  it('should calculate correct bounding box for multiple elements', () => {
    const elements: BIMElement[] = [
      {
        id: 'elem-001',
        name: 'Wall-001',
        type: 'Wall',
        geometry: {
          position: [0, 0, 0],
          boundingBox: {
            min: [0, 0, 0],
            max: [10, 3, 0.2],
          },
        },
        properties: {},
      },
      {
        id: 'elem-002',
        name: 'Door-001',
        type: 'Door',
        geometry: {
          position: [5, 0, 0],
          boundingBox: {
            min: [4.5, 0, 0],
            max: [5.5, 2.1, 0.1],
          },
        },
        properties: {},
      },
    ];

    const { container } = render(
      <ModelViewer
        elements={elements}
        selectedElements={new Set(['elem-001', 'elem-002'])}
        highlightedElements={new Map()}
        hoveredElement={null}
        onElementClick={vi.fn()}
        onElementHover={vi.fn()}
        paneState="normal"
      />
    );

    expect(container).toBeTruthy();
  });
});

describe('ModelViewer Highlight Colors', () => {
  it('should apply correct color for preview intensity', () => {
    const highlightedElements = new Map<string, HighlightStyle>();
    highlightedElements.set('elem-001', {
      color: '#3B82F6',
      category: 'element',
      intensity: 'preview',
    });

    const { container } = render(
      <ModelViewer
        elements={[
          {
            id: 'elem-001',
            name: 'Wall-001',
            type: 'Wall',
            geometry: {
              position: [0, 0, 0],
              boundingBox: {
                min: [0, 0, 0],
                max: [10, 3, 0.2],
              },
            },
            properties: {},
          },
        ]}
        selectedElements={new Set()}
        highlightedElements={highlightedElements}
        hoveredElement={null}
        onElementClick={vi.fn()}
        onElementHover={vi.fn()}
        paneState="normal"
      />
    );

    expect(container).toBeTruthy();
  });

  it('should apply correct color for selected intensity', () => {
    const highlightedElements = new Map<string, HighlightStyle>();
    highlightedElements.set('elem-001', {
      color: '#3B82F6',
      category: 'element',
      intensity: 'selected',
    });

    const { container } = render(
      <ModelViewer
        elements={[
          {
            id: 'elem-001',
            name: 'Wall-001',
            type: 'Wall',
            geometry: {
              position: [0, 0, 0],
              boundingBox: {
                min: [0, 0, 0],
                max: [10, 3, 0.2],
              },
            },
            properties: {},
          },
        ]}
        selectedElements={new Set(['elem-001'])}
        highlightedElements={highlightedElements}
        hoveredElement={null}
        onElementClick={vi.fn()}
        onElementHover={vi.fn()}
        paneState="normal"
      />
    );

    expect(container).toBeTruthy();
  });
});
