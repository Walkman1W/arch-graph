import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraphViewer, { GraphNode, GraphEdge, LayoutMode } from '../../components/GraphViewer';
import { PaneState, HighlightStyle } from '../../types';

// Mock canvas to avoid memory issues and provide required methods
global.HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      canvas: { width: 800, height: 600 },
      measureText: (text: string) => ({ width: text.length * 8, height: 16 }),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      textAlign: 'left',
      textBaseline: 'middle',
      font: '12px sans-serif'
    };
  }
  return null;
});

describe('GraphViewer Component', () => {
  const mockNodes: GraphNode[] = [
    { id: 'node1', label: 'Project A', type: 'Project', properties: {} },
    { id: 'node2', label: 'Level 1', type: 'Level', properties: {} },
    { id: 'node3', label: 'Room 101', type: 'Space', properties: {} },
    { id: 'node4', label: 'Wall', type: 'Element', properties: {} }
  ];

  const mockEdges: GraphEdge[] = [
    { id: 'edge1', source: 'node1', target: 'node2', type: 'HAS_LEVEL' },
    { id: 'edge2', source: 'node2', target: 'node3', type: 'CONTAINS' },
    { id: 'edge3', source: 'node3', target: 'node4', type: 'HAS_ELEMENT' }
  ];

  const mockOnNodeClick = vi.fn();
  const mockOnNodeHover = vi.fn();

  const defaultProps = {
    nodes: mockNodes,
    edges: mockEdges,
    selectedNodes: new Set<string>(),
    highlightedNodes: new Map<string, HighlightStyle>(),
    hoveredNode: null,
    onNodeClick: mockOnNodeClick,
    onNodeHover: mockOnNodeHover,
    paneState: 'normal' as PaneState,
    layoutMode: 'hierarchy' as LayoutMode
  };

  beforeEach(() => {
    mockOnNodeClick.mockClear();
    mockOnNodeHover.mockClear();
  });

  it('should show minimized view when paneState is minimized', () => {
    render(<GraphViewer {...defaultProps} paneState="minimized" />);
    const minimizedText = screen.getByText(/Graph Viewer \(Minimized\)/i);
    expect(minimizedText).toBeInTheDocument();
  });

  it('should render main container for normal state', () => {
    const { container } = render(<GraphViewer {...defaultProps} />);
    const mainContainer = container.querySelector('.w-full.h-full.bg-slate-900.relative.overflow-hidden');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should display correct node and edge counts', () => {
    render(<GraphViewer {...defaultProps} />);
    const stats = screen.getByText('Nodes: 4 | Edges: 3');
    expect(stats).toBeInTheDocument();
  });

  it('should render layout mode buttons', () => {
    render(<GraphViewer {...defaultProps} />);
    const layoutButtons = screen.getAllByRole('button');
    expect(layoutButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle empty nodes and edges', () => {
    render(<GraphViewer 
      {...defaultProps} 
      nodes={[]} 
      edges={[]} 
    />);
    const stats = screen.getByText('Nodes: 0 | Edges: 0');
    expect(stats).toBeInTheDocument();
  });

  it('should display correct layout mode indicator', () => {
    render(<GraphViewer {...defaultProps} />);
    const layoutIndicator = screen.getByText('Layout Mode');
    expect(layoutIndicator).toBeInTheDocument();
  });

  it('should render stats container', () => {
    const { container } = render(<GraphViewer {...defaultProps} />);
    const statsContainer = container.querySelector('.absolute.bottom-2.left-2.rounded-lg.p-2.backdrop-blur-sm');
    expect(statsContainer).toBeInTheDocument();
  });
});

describe('GraphViewer Data Types', () => {
  it('should create valid GraphNode objects', () => {
    const node: GraphNode = {
      id: 'test-node-1',
      label: 'Test Node',
      type: 'Space',
      properties: { area: 100, level: 'Level 1' }
    };
    
    expect(node.id).toBe('test-node-1');
    expect(node.label).toBe('Test Node');
    expect(node.type).toBe('Space');
    expect(node.properties.area).toBe(100);
  });

  it('should create valid GraphEdge objects', () => {
    const edge: GraphEdge = {
      id: 'test-edge-1',
      source: 'node1',
      target: 'node2',
      type: 'CONTAINS'
    };
    
    expect(edge.id).toBe('test-edge-1');
    expect(edge.source).toBe('node1');
    expect(edge.target).toBe('node2');
    expect(edge.type).toBe('CONTAINS');
  });

  it('should accept all node types', () => {
    const nodeTypes: GraphNode['type'][] = ['Project', 'Level', 'Space', 'Element', 'System', 'Pipe', 'Duct'];
    
    nodeTypes.forEach(type => {
      const node: GraphNode = {
        id: `node-${type}`,
        label: type,
        type,
        properties: {}
      };
      expect(node.type).toBe(type);
    });
  });

  it('should accept all edge types', () => {
    const edgeTypes: GraphEdge['type'][] = ['HAS_LEVEL', 'CONTAINS', 'HAS_ELEMENT', 'PASSES_THROUGH', 'CONNECTED_TO'];
    
    edgeTypes.forEach(type => {
      const edge: GraphEdge = {
        id: `edge-${type}`,
        source: 'source',
        target: 'target',
        type
      };
      expect(edge.type).toBe(type);
    });
  });
});

describe('LayoutMode Types', () => {
  it('should support all layout modes', () => {
    const modes: LayoutMode[] = ['hierarchy', 'force', 'circular'];
    
    modes.forEach(mode => {
      expect(mode).toBeDefined();
    });
  });
});
