import React, { useMemo } from 'react';
import { GraphNode, GraphEdge, GraphData, getNeighbors, getConnectedEdges } from '../services/mockGraphData';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  graphData: GraphData;
  onClose: () => void;
  onExpandNeighbors?: (nodeId: string) => void;
  onLocateInModel?: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string) => void;
}

// Node type labels (Chinese)
const nodeTypeLabels: Record<string, string> = {
  Space: '空间',
  MEPElement: '构件',
  MEPSystem: '系统',
  Storey: '楼层',
  RouteNode: '路径点',
};

// Edge type labels (Chinese)
const edgeTypeLabels: Record<string, string> = {
  ON_LEVEL: '所属楼层',
  ADJACENT_TO: '相邻',
  CONNECTS_TO: '连通',
  CROSSES: '穿越',
  BELONGS_TO_SYSTEM: '属于系统',
  SERVES: '服务',
  IN_BUILDING: '属于建筑',
  IN_ZONE: '属于区域',
};

// Node type colors
const nodeTypeColors: Record<string, string> = {
  Space: '#3B82F6',
  MEPElement: '#10B981',
  MEPSystem: '#F59E0B',
  Storey: '#6B7280',
  RouteNode: '#8B5CF6',
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  graphData,
  onClose,
  onExpandNeighbors,
  onLocateInModel,
  onNodeSelect,
}) => {
  // Get neighbors and connected edges
  const neighbors = useMemo(() => {
    if (!node) return [];
    return getNeighbors(graphData, node.id);
  }, [node, graphData]);

  const connectedEdges = useMemo(() => {
    if (!node) return [];
    return getConnectedEdges(graphData, node.id);
  }, [node, graphData]);


  // Group edges by type
  const edgesByType = useMemo((): Array<[string, GraphEdge[]]> => {
    const grouped: Record<string, GraphEdge[]> = {};
    connectedEdges.forEach(edge => {
      if (!grouped[edge.type]) {
        grouped[edge.type] = [];
      }
      grouped[edge.type].push(edge);
    });
    return Object.entries(grouped);
  }, [connectedEdges]);

  if (!node) {
    return (
      <div className="p-4 text-center text-slate-400">
        <div className="text-sm">点击图谱节点查看详情</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: nodeTypeColors[node.type] || '#94A3B8' }}
          />
          <span className="font-medium text-slate-800 text-sm">{node.label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          title="关闭"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Info */}
        <section>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">基本信息</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">类型</span>
              <span className="text-slate-800 font-medium">{nodeTypeLabels[node.type] || node.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ID</span>
              <span className="text-slate-600 font-mono text-xs">{node.id}</span>
            </div>
            {node.properties.levelCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">楼层</span>
                <span className="text-slate-800">{node.properties.levelCode}</span>
              </div>
            )}
            {node.properties.category && (
              <div className="flex justify-between">
                <span className="text-slate-500">类别</span>
                <span className="text-slate-800">{node.properties.category}</span>
              </div>
            )}
            {node.properties.systemCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">系统编码</span>
                <span className="text-slate-600 font-mono text-xs">{node.properties.systemCode}</span>
              </div>
            )}
          </div>
        </section>

        {/* Tags */}
        {node.properties.tags && node.properties.tags.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">标签</h4>
            <div className="flex flex-wrap gap-1">
              {node.properties.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Relationships */}
        <section>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            关系 ({connectedEdges.length})
          </h4>
          <div className="space-y-2">
            {edgesByType.map(([type, edges]) => (
              <div key={type} className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs font-medium text-slate-600 mb-1">
                  {edgeTypeLabels[type] || type} ({edges.length})
                </div>
                <div className="space-y-1">
                  {edges.slice(0, 5).map(edge => {
                    const targetId = edge.source === node.id ? edge.target : edge.source;
                    const targetNode = graphData.nodes.find(n => n.id === targetId);
                    return (
                      <div
                        key={edge.id}
                        className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5"
                        onClick={() => onNodeSelect?.(targetId)}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: nodeTypeColors[targetNode?.type || ''] || '#94A3B8' }}
                        />
                        <span className="text-slate-700 truncate">
                          {targetNode?.label || targetId}
                        </span>
                      </div>
                    );
                  })}
                  {edges.length > 5 && (
                    <div className="text-xs text-slate-400 pl-3">
                      +{edges.length - 5} 更多
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Neighbors */}
        <section>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            邻居节点 ({neighbors.length})
          </h4>
          <div className="space-y-1">
            {neighbors.slice(0, 8).map(neighbor => (
              <div
                key={neighbor.id}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 rounded px-2 py-1"
                onClick={() => onNodeSelect?.(neighbor.id)}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: nodeTypeColors[neighbor.type] || '#94A3B8' }}
                />
                <span className="text-slate-700 truncate flex-1">{neighbor.label}</span>
                <span className="text-slate-400 text-[10px]">{nodeTypeLabels[neighbor.type]}</span>
              </div>
            ))}
            {neighbors.length > 8 && (
              <div className="text-xs text-slate-400 text-center py-1">
                +{neighbors.length - 8} 更多邻居
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 space-y-2">
        {onExpandNeighbors && (
          <button
            onClick={() => onExpandNeighbors(node.id)}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            展开邻居节点
          </button>
        )}
        {onLocateInModel && (
          <button
            onClick={() => onLocateInModel(node.id)}
            className="w-full px-3 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            在模型中定位
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeDetailPanel;
