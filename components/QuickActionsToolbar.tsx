import React from 'react';
import { BIMQueryResponse, BIMOperation } from '../types';

interface QuickActionsToolbarProps {
  onCommand: (response: BIMQueryResponse) => void;
}

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({ onCommand }) => {
  const quickActions = [
    {
      label: 'Structure',
      icon: '🏗️',
      command: {
        operation: BIMOperation.ISOLATE as any,
        category: 'Columns',
        level: null,
        material: null,
        keywords: ['structure', 'columns', 'beams'],
        reasoning: 'Showing structural elements',
        suggestions: []
      }
    },
    {
      label: 'Envelope',
      icon: '🏢',
      command: {
        operation: BIMOperation.ISOLATE as any,
        category: 'Walls',
        level: null,
        material: null,
        keywords: ['envelope', 'walls', 'facade'],
        reasoning: 'Showing building envelope',
        suggestions: []
      }
    },
    {
      label: 'Level 1',
      icon: '📊',
      command: {
        operation: BIMOperation.ISOLATE as any,
        category: null,
        level: 'Level 1',
        material: null,
        keywords: ['level 1', 'ground floor'],
        reasoning: 'Showing Level 1 elements',
        suggestions: []
      }
    },
    {
      label: 'Concrete',
      icon: '🧱',
      command: {
        operation: BIMOperation.COLOR_CODE as any,
        category: null,
        level: null,
        material: 'Concrete',
        keywords: ['concrete', 'material'],
        reasoning: 'Highlighting concrete elements',
        suggestions: []
      }
    },
    {
      label: 'Reset',
      icon: '🔄',
      command: {
        operation: BIMOperation.RESET as any,
        category: null,
        level: null,
        material: null,
        keywords: ['reset', 'all'],
        reasoning: 'Reset view to show all elements',
        suggestions: []
      }
    }
  ];

  const handleActionClick = (command: BIMQueryResponse) => {
    onCommand(command);
  };

  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-2">
        <div className="flex flex-col gap-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.command)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
              title={action.label}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="hidden group-hover:inline whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsToolbar;