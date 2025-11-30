import React from 'react';
import { useLayout } from './LayoutStateProvider';

interface SplitPaneContainerProps {
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const SplitPaneContainer: React.FC<SplitPaneContainerProps> = ({ 
  topPanel, 
  bottomPanel, 
  rightPanel 
}) => {
  const {
    dividerPosition,
    maximizedPane,
    minimizedPanes,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane
  } = useLayout();

  // 检查面板是否可见
  const isPanelVisible = (panel: 'top' | 'bottom' | 'right') => {
    return !minimizedPanes.includes(panel) && maximizedPane !== 'none' && maximizedPane !== panel;
  };

  // 检查面板是否处于最大化状态
  const isPanelMaximized = (panel: 'top' | 'bottom' | 'right') => {
    return maximizedPane === panel;
  };

  // 计算面板样式
  const getPanelStyle = (panel: 'top' | 'bottom' | 'right') => {
    if (isPanelMaximized(panel)) {
      return { display: 'block' };
    } else if (isPanelVisible(panel)) {
      return { display: 'none' };
    } else {
      return { display: 'block' };
    }
  };

  // 计算左侧面板高度
  const getLeftPanelHeight = () => {
    if (isPanelMaximized('top')) {
      return '100%';
    } else if (isPanelMaximized('bottom')) {
      return '0%';
    } else if (minimizedPanes.includes('top')) {
      return '0%';
    } else if (minimizedPanes.includes('bottom')) {
      return '100%';
    } else {
      return `${dividerPosition * 100}%`;
    }
  };

  // 计算右侧面板宽度
  const getRightPanelWidth = () => {
    if (isPanelMaximized('right')) {
      return '100%';
    } else if (isPanelVisible('right')) {
      return '0%';
    } else {
      return '30%';
    }
  };

  return (
    <div className="flex h-screen">
      {/* 左侧面板容器 */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{ width: isPanelMaximized('right') ? '0%' : '70%' }}
      >
        {/* 顶部面板 */}
        <div 
          className="overflow-hidden relative"
          style={{ height: getLeftPanelHeight() }}
        >
          {topPanel}
          {!isPanelMaximized('top') && !minimizedPanes.includes('top') && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 cursor-row-resize"
              style={{ transform: 'translateY(50%)' }}
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = e.currentTarget.parentElement!.getBoundingClientRect().height;
                const containerHeight = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect().height;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaY = moveEvent.clientY - startY;
                  const newHeight = startHeight + deltaY;
                  const newPosition = newHeight / containerHeight;
                  setDividerPosition(newPosition);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}
          <button 
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
            onClick={() => minimizedPanes.includes('top') ? restorePane('top') : minimizePane('top')}
          >
            {minimizedPanes.includes('top') ? '显示' : '隐藏'}
          </button>
          <button 
            className="absolute top-2 right-12 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
            onClick={() => maximizedPane === 'top' ? maximizePane('none') : maximizePane('top')}
          >
            {maximizedPane === 'top' ? '还原' : '最大化'}
          </button>
        </div>

        {/* 底部面板 */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ display: minimizedPanes.includes('bottom') || isPanelMaximized('top') ? 'none' : 'block' }}
        >
          {bottomPanel}
          <button 
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
            onClick={() => minimizedPanes.includes('bottom') ? restorePane('bottom') : minimizePane('bottom')}
          >
            {minimizedPanes.includes('bottom') ? '显示' : '隐藏'}
          </button>
          <button 
            className="absolute bottom-2 right-12 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
            onClick={() => maximizedPane === 'bottom' ? maximizePane('none') : maximizePane('bottom')}
          >
            {maximizedPane === 'bottom' ? '还原' : '最大化'}
          </button>
        </div>
      </div>

      {/* 右侧面板 */}
      <div 
        className="overflow-hidden relative bg-gray-100"
        style={{ 
          width: getRightPanelWidth(),
          display: minimizedPanes.includes('right') ? 'none' : 'block'
        }}
      >
        {rightPanel}
        <button 
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          onClick={() => minimizedPanes.includes('right') ? restorePane('right') : minimizePane('right')}
        >
          {minimizedPanes.includes('right') ? '显示' : '隐藏'}
        </button>
        <button 
          className="absolute top-2 right-12 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          onClick={() => maximizedPane === 'right' ? maximizePane('none') : maximizePane('right')}
        >
          {maximizedPane === 'right' ? '还原' : '最大化'}
        </button>
      </div>
    </div>
  );
};

export default SplitPaneContainer;