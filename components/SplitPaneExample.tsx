import React from 'react';
import { SplitPaneContainer } from './SplitPaneContainer';
import { LayoutStateProvider } from '../contexts/LayoutStateProvider';

/**
 * Example component demonstrating SplitPaneContainer usage
 * This can be used for manual testing and verification
 */
export const SplitPaneExample: React.FC = () => {
  return (
    <LayoutStateProvider>
      <div className="h-screen w-full">
        <SplitPaneContainer
          topPane={
            <div className="h-full bg-blue-100 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Top Pane (Model Viewer)</h2>
                <p className="text-blue-700">This represents the 3D Model Viewer</p>
                <p className="text-sm text-blue-600 mt-4">Try dragging the divider below!</p>
              </div>
            </div>
          }
          bottomPane={
            <div className="h-full bg-green-100 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-900 mb-2">Bottom Pane (Graph Viewer)</h2>
                <p className="text-green-700">This represents the Graph Visualization</p>
                <p className="text-sm text-green-600 mt-4">Double-click the divider to reset!</p>
              </div>
            </div>
          }
        />
      </div>
    </LayoutStateProvider>
  );
};
