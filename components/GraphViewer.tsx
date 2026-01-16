import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GraphNode, GraphEdge, PaneState, HighlightStyle, NodePosition } from '../types';

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodes: Set<string>;
  highlightedNodes: Map<string, HighlightStyle>;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  paneState: PaneState;
}

const NODE_RADIUS = 30;
const NODE_SPACING = 100;

const colorMap: Record<string, string> = {
  Project: '#3b82f6',
  Level: '#8b5cf6',
  Space: '#10b981',
  Element: '#f59e0b',
  System: '#ef4444',
  Pipe: '#ec4899',
  Duct: '#06b6d4',
};

const getLevelY = (levelIndex: number): number => {
  return 100 - levelIndex * 200;
};

const getSpaceX = (spaceIndex: number, totalSpaces: number): number => {
  const range = (totalSpaces - 1) * NODE_SPACING;
  return -range / 2 + spaceIndex * NODE_SPACING;
};

export const GraphViewer: React.FC<GraphViewerProps> = ({
  nodes,
  edges,
  selectedNodes,
  highlightedNodes,
  hoveredNode,
  onNodeClick,
  onNodeHover,
  paneState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodePositionsRef = useRef<Map<string, NodePosition>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedNodeForCenter, setSelectedNodeForCenter] = useState<string | null>(null);

  useEffect(() => {
    const positions = new Map<string, NodePosition>();
    const levels = nodes.filter(n => n.type === 'Level');
    const spaces = nodes.filter(n => n.type === 'Space');
    const elements = nodes.filter(n => n.type === 'Element');

    levels.forEach((level, index) => {
      positions.set(level.id, { x: 0, y: getLevelY(index) });
    });

    spaces.forEach((space, index) => {
      const spaceEdges = edges.filter(e => e.target === space.id);
      let levelY = 100;
      if (spaceEdges.length > 0) {
        const levelPosition = positions.get(spaceEdges[0].source);
        if (levelPosition) {
          levelY = levelPosition.y;
        }
      }
      positions.set(space.id, { 
        x: getSpaceX(index, spaces.length), 
        y: levelY - 150 
      });
    });

    elements.forEach((element, index) => {
      const elementEdges = edges.filter(e => e.target === element.id);
      let spaceX = getSpaceX(index % Math.ceil(elements.length / 3), Math.ceil(elements.length / 3));
      let spaceY = -250;
      if (elementEdges.length > 0) {
        const spacePosition = positions.get(elementEdges[0].source);
        if (spacePosition) {
          spaceX = spacePosition.x + (index % 3 - 1) * 80;
          spaceY = spacePosition.y - 100;
        }
      }
      positions.set(element.id, { x: spaceX, y: spaceY });
    });

    nodePositionsRef.current = positions;
  }, [nodes, edges]);

  useEffect(() => {
    if (selectedNodes.size > 0 && selectedNodeForCenter === null) {
      const firstSelected = Array.from(selectedNodes)[0];
      setSelectedNodeForCenter(firstSelected);
    } else if (selectedNodes.size === 0) {
      setSelectedNodeForCenter(null);
    }
  }, [selectedNodes]);

  useEffect(() => {
    if (selectedNodeForCenter && nodePositionsRef.current.has(selectedNodeForCenter)) {
      const pos = nodePositionsRef.current.get(selectedNodeForCenter)!;
      const duration = 500;
      const startTime = Date.now();
      const startX = viewBox.x;
      const startY = viewBox.y;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        setViewBox({
          x: startX + (pos.x - startX) * eased,
          y: startY + (pos.y - startY) * eased,
          scale: 1,
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
      setSelectedNodeForCenter(null);
    }
  }, [selectedNodeForCenter]);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(viewBox.scale, viewBox.scale);
      ctx.translate(-viewBox.x, -viewBox.y);

      edges.forEach(edge => {
        const sourcePos = nodePositionsRef.current.get(edge.source);
        const targetPos = nodePositionsRef.current.get(edge.target);

        if (!sourcePos || !targetPos) return;

        const isSelected = selectedNodes.has(edge.source) || selectedNodes.has(edge.target);
        const isHighlighted = highlightedNodes.has(edge.source) || highlightedNodes.has(edge.target);
        const isHovered = hoveredNode === edge.source || hoveredNode === edge.target;

        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        if (isSelected) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
        } else if (isHovered) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
        } else if (isHighlighted) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
        }
        
        ctx.stroke();
      });

      nodes.forEach(node => {
        const pos = nodePositionsRef.current.get(node.id);
        if (!pos) return;

        const isSelected = selectedNodes.has(node.id);
        const isHighlighted = highlightedNodes.has(node.id);
        const isHovered = hoveredNode === node.id;
        const baseColor = colorMap[node.type] || '#6b7280';

        let fillColor = baseColor;
        let strokeColor = '#fff';
        let strokeWidth = 2;

        if (isSelected) {
          fillColor = '#ef4444';
          strokeWidth = 4;
          strokeColor = '#fff';
        } else if (isHovered) {
          fillColor = '#f59e0b';
          strokeWidth = 3;
          strokeColor = '#fff';
        } else if (isHighlighted) {
          const highlightStyle = highlightedNodes.get(node.id);
          if (highlightStyle) {
            fillColor = colorMap[highlightStyle.category] || baseColor;
          }
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, pos.x, pos.y);

        const typeLabel = node.type.charAt(0);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(typeLabel, pos.x, pos.y + NODE_RADIUS - 10);
      });

      ctx.restore();
    };

    draw();
  }, [nodes, edges, selectedNodes, highlightedNodes, hoveredNode, viewBox]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const worldX = (x - centerX) / viewBox.scale + viewBox.x;
    const worldY = (y - centerY) / viewBox.scale + viewBox.y;

    let hovered = null;
    nodePositionsRef.current.forEach((pos, nodeId) => {
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) {
        hovered = nodeId;
      }
    });

    onNodeHover(hovered);
  }, [viewBox, onNodeHover]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const worldX = (x - centerX) / viewBox.scale + viewBox.x;
    const worldY = (y - centerY) / viewBox.scale + viewBox.y;

    let clicked = null;
    nodePositionsRef.current.forEach((pos, nodeId) => {
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) {
        clicked = nodeId;
      }
    });

    if (clicked) {
      onNodeClick(clicked);
    }
  }, [viewBox, onNodeClick]);

  const isMinimized = paneState === 'minimized';
  const isMaximized = paneState === 'maximized';

  if (isMinimized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
        <div className="text-slate-400 text-sm font-medium">Graph Viewer - Minimized</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner ${
        isMaximized ? '' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="absolute inset-0 cursor-crosshair"
      />

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10">
        <span className="text-xs font-semibold text-slate-700">
          {nodes.length} Nodes | {edges.length} Edges
        </span>
      </div>

      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200 z-10">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Hovering</p>
          <p className="text-sm font-semibold text-slate-800">
            {nodes.find(n => n.id === hoveredNode)?.label || hoveredNode}
          </p>
        </div>
      )}

      {selectedNodes.size > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200 z-10">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Selected</p>
          <p className="text-sm font-semibold text-slate-800">
            {Array.from(selectedNodes)
              .map(id => nodes.find(n => n.id === id)?.label || id)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
