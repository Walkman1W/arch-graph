import React from 'react';
import { useLayoutState, useLayoutActions } from './LayoutStateProvider';
import SpeckleViewer from './SpeckleViewer';
import GraphViewer from './GraphViewer';

const SplitPaneContainer: React.FC = () => {
  const { dividerPosition, isTopPaneMaximized, isBottomPaneMaximized } = useLayoutState();
  const { setDividerPosition, maximizePane, minimizePane } = useLayoutActions();

  // 计算上下面板的高度
  const topPaneHeight = isTopPaneMaximized ? '100%' : `${dividerPosition}%`;
  const bottomPaneHeight = isBottomPaneMaximized ? '100%' : `${100 - dividerPosition}%`;

  // 分割线拖动处理
  const handleDividerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const containerHeight = container.offsetHeight;
    const startY = e.clientY;
    const startPosition = dividerPosition;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPosition = startPosition + (deltaY / containerHeight) * 100;
      setDividerPosition(Math.max(10, Math.min(90, newPosition))); // 限制在10%-90%之间
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* 顶部面板：3D模型 */}
      <div 
        className={`relative overflow-hidden transition-all duration-300 ${isBottomPaneMaximized ? 'hidden' : 'block'}`}
        style={{ height: topPaneHeight }}
      >
        <SpeckleViewer 
          embedUrl="https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D"
        />
        
        {/* 最大化/最小化按钮 */}
        <button 
          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors"
          onClick={() => isTopPaneMaximized ? minimizePane('top') : maximizePane('top')}
        >
          {isTopPaneMaximized ? '🗗' : '🗖'}
        </button>
      </div>

      {/* 分割线 */}
      {!isTopPaneMaximized && !isBottomPaneMaximized && (
        <div 
          className="h-1 bg-slate-200 cursor-row-resize hover:bg-slate-400 transition-colors"
          onMouseDown={handleDividerDrag}
        />
      )}

      {/* 底部面板：图谱可视化 */}
      <div 
        className={`relative overflow-hidden transition-all duration-300 ${isTopPaneMaximized ? 'hidden' : 'block'}`}
        style={{ height: bottomPaneHeight }}
      >
        <GraphViewer />
        
        {/* 最大化/最小化按钮 */}
        <button 
          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors"
          onClick={() => isBottomPaneMaximized ? minimizePane('bottom') : maximizePane('bottom')}
        >
          {isBottomPaneMaximized ? '🗗' : '🗖'}
        </button>
      </div>
    </div>
  );
};

export default SplitPaneContainer;
