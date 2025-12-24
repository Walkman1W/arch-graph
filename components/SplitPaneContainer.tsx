import React, { useState, useRef, useEffect } from 'react';

interface SplitPaneContainerProps {
  topPane: React.ReactNode;
  bottomPane: React.ReactNode;
  defaultSplitRatio?: number;
  minPaneHeight?: number;
  maxPaneHeight?: number;
  onResize?: (ratio: number) => void;
}

const SplitPaneContainer: React.FC<SplitPaneContainerProps> = ({
  topPane,
  bottomPane,
  defaultSplitRatio = 0.6,
  minPaneHeight = 0.2,
  maxPaneHeight = 0.8,
  onResize,
}) => {
  const [splitRatio, setSplitRatio] = useState(defaultSplitRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startRatio = useRef(0);

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startRatio.current = splitRatio;
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.offsetHeight;
    const deltaY = e.clientY - startY.current;
    const deltaRatio = deltaY / containerHeight;
    let newRatio = startRatio.current + deltaRatio;

    // 应用约束
    newRatio = Math.max(minPaneHeight, Math.min(maxPaneHeight, newRatio));
    setSplitRatio(newRatio);

    if (onResize) {
      onResize(newRatio);
    }
  };

  // 处理鼠标抬起事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理双击事件
  const handleDoubleClick = () => {
    setSplitRatio(defaultSplitRatio);
    if (onResize) {
      onResize(defaultSplitRatio);
    }
  };

  // 添加事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full w-full overflow-hidden"
    >
      {/* 上面板 */}
      <div 
        className="flex-1 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${splitRatio * 100}%` }}
      >
        {topPane}
      </div>

      {/* 分隔条 */}
      <div
        className={`h-2 bg-gray-200 cursor-row-resize hover:bg-gray-400 transition-colors duration-200 ${isDragging ? 'bg-blue-500' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />

      {/* 下面板 */}
      <div 
        className="flex-1 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${(1 - splitRatio) * 100}%` }}
      >
        {bottomPane}
      </div>
    </div>
  );
};

export default SplitPaneContainer;