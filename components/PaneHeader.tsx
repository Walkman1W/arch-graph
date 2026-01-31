import React from 'react';
import { PaneType, PaneState } from '../types';
import { useLanguage } from '../contexts/LanguageProvider';

interface PaneHeaderProps {
  title: string;
  paneType: PaneType;
  paneState: PaneState;
  onMaximize: () => void;
  onMinimize: () => void;
  onRestore: () => void;
}

export const PaneHeader: React.FC<PaneHeaderProps> = ({
  title,
  paneType,
  paneState,
  onMaximize,
  onMinimize,
  onRestore,
}) => {
  const { t } = useLanguage();
  
  // Determine which buttons to show based on current state
  const showMaximizeButton = paneState === 'normal';
  const showRestoreButton = paneState === 'maximized' || paneState === 'minimized';
  const showMinimizeButton = paneState === 'normal';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>

      {/* Control Buttons */}
      <div className="flex items-center gap-1">
        {/* Minimize Button */}
        {showMinimizeButton && (
          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
            title={t('common.minimize')}
            aria-label={`${t('common.minimize')} ${title}`}
          >
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        )}

        {/* Maximize Button */}
        {showMaximizeButton && (
          <button
            onClick={onMaximize}
            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
            title={t('common.maximize')}
            aria-label={`${t('common.maximize')} ${title}`}
          >
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        )}

        {/* Restore Button */}
        {showRestoreButton && (
          <button
            onClick={onRestore}
            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
            title={t('common.restore')}
            aria-label={`${t('common.restore')} ${title}`}
          >
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h4m0 0V4m0 4L3 3m17 5h-4m0 0V4m0 4l5-5M4 16h4m0 0v4m0-4l-5 5m17-5h-4m0 0v4m0-4l5 5"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
