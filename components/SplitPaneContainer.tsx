import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useLayoutState } from '../contexts/LayoutStateProvider';
import { PaneHeader } from './PaneHeader';
import { useLanguage } from '../contexts/LanguageProvider';

interface SplitPaneContainerProps {
  topPane: React.ReactNode;
  bottomPane: React.ReactNode;
  topPaneTitle?: string;
  bottomPaneTitle?: string;
  defaultSplitRatio?: number;
  minPaneHeight?: number;
  maxPaneHeight?: number;
}

export const SplitPaneContainer: React.FC<SplitPaneContainerProps> = ({
  topPane,
  bottomPane,
  topPaneTitle = '模型查看器',
  bottomPaneTitle = '图谱查看器',
  defaultSplitRatio = 0.6,
  minPaneHeight = 0.2,
  maxPaneHeight = 0.8,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { 
    dividerPosition, 
    setDividerPosition, 
    paneStates,
    maximizePane,
    minimizePane,
    restorePane,
  } = useLayoutState();

  // Handle mouse down on divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const mouseY = e.clientY - containerRect.top;

      // Calculate new position as ratio
      let newPosition = mouseY / containerHeight;

      // Apply constraints
      newPosition = Math.max(minPaneHeight, Math.min(maxPaneHeight, newPosition));

      setDividerPosition(newPosition);
    },
    [isDragging, minPaneHeight, maxPaneHeight, setDividerPosition]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle double click to reset
  const handleDoubleClick = useCallback(() => {
    setDividerPosition(defaultSplitRatio);
  }, [defaultSplitRatio, setDividerPosition]);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate pane heights based on state
  const getTopPaneHeight = () => {
    if (paneStates.model === 'maximized') return '100%';
    if (paneStates.model === 'minimized') return '48px'; // Toolbar height
    return `${dividerPosition * 100}%`;
  };

  const getBottomPaneHeight = () => {
    if (paneStates.graph === 'maximized') return '100%';
    if (paneStates.graph === 'minimized') return '48px'; // Toolbar height
    return `${(1 - dividerPosition) * 100}%`;
  };

  const showDivider = paneStates.model === 'normal' && paneStates.graph === 'normal';

  // Handlers for top pane (model)
  const handleTopMaximize = useCallback(() => {
    maximizePane('model');
  }, [maximizePane]);

  const handleTopMinimize = useCallback(() => {
    minimizePane('model');
  }, [minimizePane]);

  const handleTopRestore = useCallback(() => {
    restorePane('model');
  }, [restorePane]);

  // Handlers for bottom pane (graph)
  const handleBottomMaximize = useCallback(() => {
    maximizePane('graph');
  }, [maximizePane]);

  const handleBottomMinimize = useCallback(() => {
    minimizePane('graph');
  }, [minimizePane]);

  const handleBottomRestore = useCallback(() => {
    restorePane('graph');
  }, [restorePane]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full relative overflow-hidden"
    >
      {/* Top Pane */}
      <div
        className="relative overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
        style={{
          height: getTopPaneHeight(),
        }}
      >
        {/* Top Pane Header */}
        <PaneHeader
          title={topPaneTitle || t('modelViewer.title')}
          paneType="model"
          paneState={paneStates.model}
          onMaximize={handleTopMaximize}
          onMinimize={handleTopMinimize}
          onRestore={handleTopRestore}
        />
        
        {/* Top Pane Content */}
        {paneStates.model !== 'minimized' && (
          <div className="flex-1 overflow-hidden">
            {topPane}
          </div>
        )}
      </div>

      {/* Divider */}
      {showDivider && (
        <div
          className={`
            relative h-2 bg-slate-300 hover:bg-slate-400 
            cursor-ns-resize flex items-center justify-center
            transition-colors duration-150 z-10
            ${isDragging ? 'bg-slate-500' : ''}
          `}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* Divider handle indicator */}
          <div className="w-12 h-1 bg-slate-500 rounded-full" />
        </div>
      )}

      {/* Bottom Pane */}
      <div
        className="relative overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
        style={{
          height: showDivider ? getBottomPaneHeight() : (paneStates.graph === 'maximized' ? '100%' : getBottomPaneHeight()),
        }}
      >
        {/* Bottom Pane Header */}
        <PaneHeader
          title={bottomPaneTitle || t('graphViewer.title')}
          paneType="graph"
          paneState={paneStates.graph}
          onMaximize={handleBottomMaximize}
          onMinimize={handleBottomMinimize}
          onRestore={handleBottomRestore}
        />
        
        {/* Bottom Pane Content */}
        {paneStates.graph !== 'minimized' && (
          <div className="flex-1 overflow-hidden">
            {bottomPane}
          </div>
        )}
      </div>
    </div>
  );
};
