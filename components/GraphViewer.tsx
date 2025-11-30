import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { useLayout } from './LayoutStateProvider';

interface GraphNode {
  id: string;
  label: string;
  type: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphViewerProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}

const GraphViewer: React.FC<GraphViewerProps> = ({ data, onNodeClick, onEdgeClick }) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null);
  const { highlightStyle } = useLayout();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cyRef.current) return;

    // 初始化Cytoscape实例
    const cy = cytoscape({
      container: cyRef.current,
      elements: [
        ...data.nodes.map(node => ({
          group: 'nodes',
          data: { id: node.id, label: node.label, type: node.type },
          style: {
            'background-color': '#1E88E5',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 12,
            'text-background-color': '#fff',
            'text-background-padding': 2,
            'text-background-opacity': 0.8,
            'border-width': 2,
            'border-color': '#fff'
          }
        })),
        ...data.edges.map(edge => ({
          group: 'edges',
          data: { id: edge.id, source: edge.source, target: edge.target, label: edge.label },
          style: {
            'width': 2,
            'line-color': '#757575',
            'target-arrow-color': '#757575',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': 10,
            'text-background-color': '#fff',
            'text-background-padding': 1,
            'text-background-opacity': 0.8
          }
        }))
      ],
      layout: {
        name: 'cose-bilkent',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      style: cytoscape.stylesheet()
        .selector('node')
        .style({
          'background-color': '#1E88E5',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 12,
          'text-background-color': '#fff',
          'text-background-padding': 2,
          'text-background-opacity': 0.8,
          'border-width': 2,
          'border-color': '#fff'
        })
        .selector('edge')
        .style({
          'width': 2,
          'line-color': '#757575',
          'target-arrow-color': '#757575',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 10,
          'text-background-color': '#fff',
          'text-background-padding': 1,
          'text-background-opacity': 0.8
        })
        .selector('.highlighted')
        .style({
          'border-width': highlightStyle.thickness,
          'border-color': highlightStyle.color,
          'border-opacity': highlightStyle.opacity,
          'line-color': highlightStyle.color,
          'line-opacity': highlightStyle.opacity,
          'target-arrow-color': highlightStyle.color,
          'target-arrow-opacity': highlightStyle.opacity
        }),
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 10,
      pan: { x: 0, y: 0 },
      boxSelectionEnabled: true,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false
    });

    cyInstance.current = cy;
    setIsLoading(false);

    // 处理节点点击
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      if (onNodeClick) {
        onNodeClick({
          id: node.id(),
          label: node.data('label'),
          type: node.data('type')
        });
      }
    });

    // 处理边点击
    cy.on('tap', 'edge', (event) => {
      const edge = event.target;
      if (onEdgeClick) {
        onEdgeClick({
          id: edge.id(),
          source: edge.data('source'),
          target: edge.data('target'),
          label: edge.data('label')
        });
      }
    });

    // 清理函数
    return () => {
      cyInstance.current?.destroy();
    };
  }, [data, highlightStyle, onNodeClick, onEdgeClick]);

  // 更新图谱数据
  useEffect(() => {
    if (!cyInstance.current) return;

    // 移除所有现有元素
    cyInstance.current.elements().remove();

    // 添加新元素
    cyInstance.current.add([
      ...data.nodes.map(node => ({
        group: 'nodes',
        data: { id: node.id, label: node.label, type: node.type }
      })),
      ...data.edges.map(edge => ({
        group: 'edges',
        data: { id: edge.id, source: edge.source, target: edge.target, label: edge.label }
      }))
    ]);

    // 重新布局
    cyInstance.current.layout({ name: 'cose-bilkent' }).run();
  }, [data]);

  // 高亮元素
  const highlightElements = (elementIds: string[]) => {
    if (!cyInstance.current) return;

    // 移除所有现有高亮
    cyInstance.current.elements().removeClass('highlighted');

    // 高亮指定元素
    elementIds.forEach(id => {
      const element = cyInstance.current!.getElementById(id);
      if (element) {
        element.addClass('highlighted');
      }
    });
  };

  // 清除高亮
  const clearHighlight = () => {
    cyInstance.current?.elements().removeClass('highlighted');
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div ref={cyRef} className="h-full w-full"></div>
    </div>
  );
};

export default GraphViewer;