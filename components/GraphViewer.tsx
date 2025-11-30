import React, { useEffect, useRef } from 'react';
import { useLayoutState } from './LayoutStateProvider';
import { MockBIMElement } from '../types';

// 模拟图谱数据生成函数
interface GraphNode {
  id: string;
  label: string;
  group: string;
  level: string;
  material: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const generateMockGraphData = (elements: MockBIMElement[]): GraphData => {
  // 简化的图谱数据结构
  return {
    nodes: elements.map(element => ({
      id: element.id,
      label: element.name,
      group: element.category,
      level: element.level,
      material: element.material
    })),
    links: Array.from({ length: elements.length * 2 }, () => {
      const sourceIndex = Math.floor(Math.random() * elements.length);
      let targetIndex = Math.floor(Math.random() * elements.length);
      
      // 确保源节点和目标节点不同
      while (targetIndex === sourceIndex) {
        targetIndex = Math.floor(Math.random() * elements.length);
      }
      
      return {
        source: elements[sourceIndex].id,
        target: elements[targetIndex].id,
        value: Math.random() * 10
      };
    })
  };
};

const GraphViewer: React.FC = () => {
  const { highlightStyle } = useLayoutState();
  const graphRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<any>(null);

  // 模拟BIM元素数据
  const mockElements: MockBIMElement[] = Array.from({ length: 50 }, (_, i) => ({
    id: `el-${i}`,
    category: ['Walls', 'Columns', 'Slabs', 'Windows', 'Doors'][Math.floor(Math.random() * 5)],
    level: ['Foundation', 'Level 1', 'Level 2', 'Roof'][Math.floor(Math.random() * 4)],
    name: `Element ${i + 1}`,
    material: ['Concrete', 'Brick', 'Glass', 'Steel'][Math.floor(Math.random() * 4)]
  }));

  // 生成图谱数据
  const graphData: GraphData = generateMockGraphData(mockElements);

  // 初始化图谱
  useEffect(() => {
    if (!graphRef.current || !svgRef.current) return;

    const width = graphRef.current.clientWidth;
    const height = graphRef.current.clientHeight;
    const svg = svgRef.current;

    // 设置SVG尺寸
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // 清除现有内容
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 创建D3力导向图模拟
    const simulation = (window as any).d3.forceSimulation(graphData.nodes)
      .force('link', (window as any).d3.forceLink(graphData.links).id((d: GraphNode) => d.id).distance(100))
      .force('charge', (window as any).d3.forceManyBody().strength(-300))
      .force('center', (window as any).d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    simulationRef.current = simulation;

    // 创建节点和链接
    const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linkGroup.setAttribute('class', 'links');
    svg.appendChild(linkGroup);

    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');
    svg.appendChild(nodeGroup);

    // 渲染函数
    function ticked() {
      // 清除现有元素
      while (linkGroup.firstChild) linkGroup.removeChild(linkGroup.firstChild);
      while (nodeGroup.firstChild) nodeGroup.removeChild(nodeGroup.firstChild);

      // 渲染链接
      graphData.links.forEach(link => {
        const sourceNode = graphData.nodes.find(n => n.id === link.source);
        const targetNode = graphData.nodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', sourceNode.x?.toString() || '0');
          line.setAttribute('y1', sourceNode.y?.toString() || '0');
          line.setAttribute('x2', targetNode.x?.toString() || '0');
          line.setAttribute('y2', targetNode.y?.toString() || '0');
          line.setAttribute('stroke', '#999');
          line.setAttribute('stroke-opacity', '0.6');
          line.setAttribute('stroke-width', (Math.sqrt(link.value)).toString());
          linkGroup.appendChild(line);
        }
      });

      // 渲染节点
      graphData.nodes.forEach(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x?.toString() || '0');
        circle.setAttribute('cy', node.y?.toString() || '0');
        circle.setAttribute('r', '10');
        circle.setAttribute('fill', getColorByCategory(node.group));
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('data-id', node.id);
        
        // 添加悬停效果
        circle.addEventListener('mouseover', () => {
          circle.setAttribute('r', '12');
          circle.setAttribute('stroke', highlightStyle.color);
          circle.setAttribute('stroke-width', highlightStyle.lineWidth.toString());
        });
        
        circle.addEventListener('mouseout', () => {
          circle.setAttribute('r', '10');
          circle.setAttribute('stroke', '#fff');
          circle.setAttribute('stroke-width', '2');
        });
        
        nodeGroup.appendChild(circle);

        // 节点标签
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', ((node.x || 0) + 15).toString());
        text.setAttribute('y', node.y?.toString() || '0');
        text.setAttribute('font-size', '12px');
        text.setAttribute('fill', '#333');
        text.textContent = node.label;
        nodeGroup.appendChild(text);
      });
    }

    // 清理函数
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [highlightStyle]);

  // 窗口大小变化时重新渲染图谱
  useEffect(() => {
    const handleResize = () => {
      if (simulationRef.current) {
        simulationRef.current.alpha(1).restart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据元素类别返回颜色
  const getColorByCategory = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Walls': '#FF6B6B',
      'Columns': '#4ECDC4',
      'Slabs': '#45B7D1',
      'Windows': '#96CEB4',
      'Doors': '#FFEAA7'
    };
    return colorMap[category] || '#999';
  };

  return (
    <div ref={graphRef} className="w-full h-full bg-white overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default GraphViewer;
