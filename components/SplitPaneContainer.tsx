import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLayoutState } from '../contexts/LayoutStateProvider';

interface SplitPaneContainerProps {
  topPane: React.ReactNode;
  bottomPane: React.ReactNode;
}

const SplitPaneContainer: React.FC<SplitPaneContainerProps> = ({
  topPane,
  bottomPane,
}) => {
  const { dividerPosition, setDividerPosition } = useLayoutState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startRatio = useRef(0);

  // 处理鼠标按下事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsDragging(true);
    startY.current = e.clientY;
    startRatio.current = dividerPosition;
  }, [dividerPosition]);

  // 处理鼠标移动事件
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.clientY - startY.current;
    const deltaRatio = deltaY / containerHeight;
    const newRatio = startRatio.current - deltaRatio;
    setDividerPosition(newRatio);
  }, [isDragging, setDividerPosition]);

  // 处理鼠标释放事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 处理双击事件，重置为60%/40%比例
  const handleDoubleClick = useCallback(() => {
    setDividerPosition(0.6);
  }, [setDividerPosition]);

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div 
        className="flex-1 overflow-hidden transition-all duration-300" 
        style={{ height: `${dividerPosition * 100}%` }}
      >
        {topPane}
      </div>
      <div 
        className="h-2 bg-gray-300 cursor-row-resize hover:bg-gray-400 transition-colors duration-200 relative"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>
      <div 
        className="flex-1 overflow-hidden transition-all duration-300" 
        style={{ height: `${(1 - dividerPosition) * 100}%` }}
      >
        {bottomPane}
      </div>
    </div>
  );
};

export default SplitPaneContainer;