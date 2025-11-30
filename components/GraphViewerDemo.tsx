/**
 * GraphViewer Demo Component
 * 
 * Demonstrates the enhanced GraphViewer with mock data scenarios
 */
import React, { useState, useCallback, useMemo } from 'react';
import GraphViewer, { LayoutMode } from './GraphViewer';
import { 
  generateScenario, 
  getAvailableScenarios, 
  ScenarioType,
  GraphData,
  GraphNode,
  GraphEdge
} from '../services/mockGraphData';
import { HighlightStyle } from '../types';

const GraphViewerDemo: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('simple-building');
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [highlightedNodes, setHighlightedNodes] = useState<Map<string, HighlightStyle>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');

  // Generate graph data for current scenario
  const graphData = useMemo(() => {
    return generateScenario(currentScenario);
  }, [currentScenario]);

  // Available scenarios
  const scenarios = getAvailableScenarios();

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setSelectedNodes(new Set());
    setHighlightedNodes(new Map());
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string, node: GraphNode) => {
    console.log('Node clicked:', nodeId, node);
    
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((edgeId: string, edge: GraphEdge) => {
    console.log('Edge clicked:', edgeId, edge);
    
    // Highlight source and target nodes
    setHighlightedNodes(new Map([
      [edge.source, { color: '#F59E0B', category: 'element', intensity: 'result' }],
      [edge.target, { color: '#F59E0B', category: 'element', intensity: 'result' }],
    ]));
  }, []);

  // Handle node hover
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedNodes(new Set());
    setHighlightedNodes(new Map());
  }, []);

  // Select all nodes of a type
  const handleSelectByType = useCallback((type: string) => {
    const nodeIds = graphData.nodes
      .filter(n => n.type === type)
      .map(n => n.id);
    setSelectedNodes(new Set(nodeIds));
  }, [graphData]);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-800">图谱可视化演示</h1>
          
          {/* Scenario selector */}
          <select
            value={currentScenario}
            onChange={(e) => handleScenarioChange(e.target.value as ScenarioType)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick select buttons */}
          <div className="flex items-center gap-1 mr-4">
            <span className="text-xs text-slate-500 mr-2">快速选择:</span>
            {['Space', 'MEPElement', 'MEPSystem', 'Storey'].map(type => (
              <button
                key={type}
                onClick={() => handleSelectByType(type)}
                className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {type === 'Space' ? '空间' : 
                 type === 'MEPElement' ? '构件' : 
                 type === 'MEPSystem' ? '系统' : '楼层'}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={handleClearSelection}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            清除选择
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 text-xs text-slate-600">
        <span>场景: <strong>{scenarios.find(s => s.id === currentScenario)?.name}</strong></span>
        <span>节点: <strong>{graphData.metadata.nodeCount}</strong></span>
        <span>关系: <strong>{graphData.metadata.edgeCount}</strong></span>
        <span>关系类型: <strong>{graphData.metadata.relationshipTypes.join(', ')}</strong></span>
      </div>

      {/* Graph viewer */}
      <div className="flex-1 p-4">
        <GraphViewer
          data={graphData}
          selectedNodes={selectedNodes}
          highlightedNodes={highlightedNodes}
          hoveredNode={hoveredNode}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onNodeHover={handleNodeHover}
          layoutMode={layoutMode}
          paneState="normal"
          showZoomControls={true}
          showLegend={true}
          showLayoutControls={true}
        />
      </div>
    </div>
  );
};

export default GraphViewerDemo;
