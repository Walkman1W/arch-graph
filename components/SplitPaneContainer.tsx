import React, { useRef, useEffect } from 'react';
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
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startRatio = useRef(0);

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startY.current = e.clientY;
    startRatio.current = dividerPosition;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理双击事件，重置为60%/40%比例
  const handleDoubleClick = () => {
    setDividerPosition(0.6);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.clientY - startY.current;
    const deltaRatio = deltaY / containerHeight;
    const newRatio = startRatio.current - deltaRatio;
    setDividerPosition(newRatio);
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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