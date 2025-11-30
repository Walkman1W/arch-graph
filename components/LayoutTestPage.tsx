import React from 'react';
import { useLayout } from './LayoutStateProvider';
import { HighlightStyle } from '../types';

const LayoutTestPage: React.FC = () => {
  const {
    dividerPosition,
    maximizedPane,
    minimizedPanes,
    highlightStyle,
    theme,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane,
    setHighlightStyle,
    toggleTheme
  } = useLayout();

  // 测试高亮样式
  const testHighlightStyle: HighlightStyle = {
    color: '#00ff00',
    opacity: 0.5,
    thickness: 3
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6">布局状态管理测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 主题切换 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">主题切换</h2>
          <p className="mb-2">当前主题: {theme}</p>
          <button 
            onClick={toggleTheme}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            切换主题
          </button>
        </div>

        {/* 分屏位置控制 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">分屏位置控制</h2>
          <p className="mb-2">当前分屏位置: {dividerPosition.toFixed(2)}</p>
          <input 
            type="range" 
            min="0.1" 
            max="0.9" 
            step="0.01" 
            value={dividerPosition}
            onChange={(e) => setDividerPosition(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 面板最大化控制 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">面板最大化控制</h2>
          <p className="mb-2">当前最大化面板: {maximizedPane}</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => maximizePane('top')}
              className={`px-3 py-1 rounded ${maximizedPane === 'top' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最大化顶部面板
            </button>
            <button 
              onClick={() => maximizePane('bottom')}
              className={`px-3 py-1 rounded ${maximizedPane === 'bottom' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最大化底部面板
            </button>
            <button 
              onClick={() => maximizePane('right')}
              className={`px-3 py-1 rounded ${maximizedPane === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最大化右侧面板
            </button>
            <button 
              onClick={() => maximizePane('none')}
              className={`px-3 py-1 rounded ${maximizedPane === 'none' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              取消最大化
            </button>
          </div>
        </div>

        {/* 面板最小化控制 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">面板最小化控制</h2>
          <p className="mb-2">当前最小化面板: {minimizedPanes.join(', ') || '无'}</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => minimizePane('top')}
              disabled={minimizedPanes.includes('top')}
              className={`px-3 py-1 rounded ${minimizedPanes.includes('top') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最小化顶部面板
            </button>
            <button 
              onClick={() => minimizePane('bottom')}
              disabled={minimizedPanes.includes('bottom')}
              className={`px-3 py-1 rounded ${minimizedPanes.includes('bottom') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最小化底部面板
            </button>
            <button 
              onClick={() => minimizePane('right')}
              disabled={minimizedPanes.includes('right')}
              className={`px-3 py-1 rounded ${minimizedPanes.includes('right') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              最小化右侧面板
            </button>
            <button 
              onClick={() => restorePane('top')}
              disabled={!minimizedPanes.includes('top')}
              className={`px-3 py-1 rounded ${!minimizedPanes.includes('top') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              恢复顶部面板
            </button>
            <button 
              onClick={() => restorePane('bottom')}
              disabled={!minimizedPanes.includes('bottom')}
              className={`px-3 py-1 rounded ${!minimizedPanes.includes('bottom') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              恢复底部面板
            </button>
            <button 
              onClick={() => restorePane('right')}
              disabled={!minimizedPanes.includes('right')}
              className={`px-3 py-1 rounded ${!minimizedPanes.includes('right') ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              恢复右侧面板
            </button>
          </div>
        </div>

        {/* 高亮样式控制 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">高亮样式控制</h2>
          <p className="mb-2">当前颜色: {highlightStyle.color}</p>
          <p className="mb-2">当前透明度: {highlightStyle.opacity}</p>
          <p className="mb-2">当前厚度: {highlightStyle.thickness}</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setHighlightStyle(testHighlightStyle)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              应用测试样式
            </button>
            <button 
              onClick={() => setHighlightStyle({ color: '#ff0000', opacity: 0.7, thickness: 2 })}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              重置默认样式
            </button>
          </div>
          <div 
            className="mt-4 h-16 rounded"
            style={{ 
              backgroundColor: highlightStyle.color, 
              opacity: highlightStyle.opacity, 
              border: `${highlightStyle.thickness}px solid black` 
            }}
          ></div>
        </div>

        {/* 本地存储测试 */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-3">本地存储测试</h2>
          <p className="mb-2">当前布局状态已自动保存到本地存储</p>
          <p className="mb-2">刷新页面后状态将自动恢复</p>
          <button 
            onClick={() => localStorage.removeItem('archGraphLayoutState')}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            清除本地存储
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutTestPage;
