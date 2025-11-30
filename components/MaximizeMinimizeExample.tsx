import React from 'react';
import { LayoutStateProvider } from '../contexts/LayoutStateProvider';
import { SplitPaneContainer } from './SplitPaneContainer';

/**
 * Example component demonstrating the maximize/minimize functionality
 * of the SplitPaneContainer with PaneHeader controls
 */
export const MaximizeMinimizeExample: React.FC = () => {
  return (
    <LayoutStateProvider>
      <div className="h-screen w-screen bg-slate-50">
        {/* Header */}
        <div className="h-16 bg-slate-800 text-white flex items-center px-6">
          <h1 className="text-xl font-bold">三分屏布局 - 最大化/最小化示例</h1>
        </div>

        {/* Main Content Area */}
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Left Side: Split Pane Container */}
          <div className="flex-1 border-r border-slate-200">
            <SplitPaneContainer
              topPaneTitle="3D 模型查看器"
              bottomPaneTitle="图谱可视化"
              topPane={
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">模型查看器</h2>
                    <p className="text-slate-600">使用标题栏按钮测试最大化/最小化功能</p>
                  </div>
                </div>
              }
              bottomPane={
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🕸️</div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">图谱查看器</h2>
                    <p className="text-slate-600">使用标题栏按钮测试最大化/最小化功能</p>
                  </div>
                </div>
              }
            />
          </div>

          {/* Right Side: Control Panel Placeholder */}
          <div className="w-96 bg-white border-l border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">对话面板</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  测试说明：
                </p>
                <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>点击最大化按钮扩展面板</li>
                  <li>点击最小化按钮折叠面板</li>
                  <li>点击恢复按钮返回正常状态</li>
                  <li>系统会阻止两个面板同时最小化</li>
                  <li>状态会自动保存到本地存储</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutStateProvider>
  );
};
