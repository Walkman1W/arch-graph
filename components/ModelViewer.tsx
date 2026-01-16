import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLayoutState } from '../contexts/LayoutStateProvider';
import { HighlightStyle, PaneState } from '../types';

interface BIMElement {
  id: string;
  name: string;
  type: string;
  category: string;
  spaceId?: string;
  systemId?: string;
  geometry: {
    position: [number, number, number];
    boundingBox: {
      min: [number, number, number];
      max: [number, number, number];
    };
  };
  properties: Record<string, any>;
}

interface ModelViewerProps {
  embedUrl?: string;
  elements?: BIMElement[];
  paneState?: PaneState;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  embedUrl = "https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D",
  elements = [],
  paneState = 'normal'
}) => {
  const { 
    selectedElements, 
    highlightedElements, 
    hoveredElement,
    selectElement, 
    setHoveredElement 
  } = useLayoutState();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<BIMElement | null>(null);

  const handleIframeLoad = useCallback(() => {
    setIsIframeLoaded(true);
  }, []);

  const handleElementClick = useCallback((elementId: string) => {
    selectElement(elementId, 'model');
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElementInfo(element);
    }
  }, [selectElement, elements]);

  const handleElementHover = useCallback((elementId: string | null) => {
    setHoveredElement(elementId);
  }, [setHoveredElement]);

  const getHighlightColor = useCallback((style: HighlightStyle): string => {
    const colorMap: Record<string, string> = {
      space: '#3b82f6',
      element: '#10b981',
      system: '#f59e0b',
      pipe: '#8b5cf6',
    };
    const baseColor = colorMap[style.category] || '#6b7280';
    
    if (style.intensity === 'preview') {
      return baseColor + '40';
    } else if (style.intensity === 'selected') {
      return baseColor;
    } else {
      return baseColor + '80';
    }
  }, []);

  const renderBoundingBox = useCallback((element: BIMElement) => {
    if (!containerRef.current || paneState === 'minimized') return null;

    const { boundingBox } = element.geometry;
    const size: [number, number, number] = [
      boundingBox.max[0] - boundingBox.min[0],
      boundingBox.max[1] - boundingBox.min[1],
      boundingBox.max[2] - boundingBox.min[2],
    ];
    const center: [number, number, number] = [
      (boundingBox.min[0] + boundingBox.max[0]) / 2,
      (boundingBox.min[1] + boundingBox.max[1]) / 2,
      (boundingBox.min[2] + boundingBox.max[2]) / 2,
    ];

    return (
      <div 
        className="absolute border-2 border-dashed animate-pulse pointer-events-none"
        style={{
          left: `${center[0] * 100}px`,
          top: `${center[1] * 100}px`,
          width: `${size[0] * 100}px`,
          height: `${size[1] * 100}px`,
          borderColor: selectedElements.has(element.id) ? '#3b82f6' : '#10b981',
          zIndex: 10,
        }}
      />
    );
  }, [selectedElements, paneState]);

  const simulateElementInteraction = useCallback((elementId: string, type: 'click' | 'hover') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (type === 'click') {
      handleElementClick(elementId);
    } else {
      handleElementHover(elementId);
    }
  }, [elements, handleElementClick, handleElementHover]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'speckle:element-selected') {
        handleElementClick(event.data.elementId);
      } else if (event.data.type === 'speckle:element-hovered') {
        handleElementHover(event.data.elementId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleElementClick, handleElementHover]);

  const selectedHighlightStyle = Array.from(selectedElements)
    .map(id => highlightedElements.get(id))
    .find(style => style !== undefined);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner"
    >
      <iframe 
        ref={iframeRef}
        title="Speckle Viewer" 
        src={embedUrl} 
        width="100%" 
        height="100%" 
        frameBorder="0"
        className="absolute inset-0 w-full h-full"
        onLoad={handleIframeLoad}
      />
      
      {isIframeLoaded && (
        <>
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 pointer-events-auto">
              <div className={`w-2 h-2 rounded-full ${selectedElements.size > 0 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span className="text-xs font-semibold text-slate-700">
                {selectedElements.size > 0 ? `${selectedElements.size} Selected` : 'Ready'}
              </span>
            </div>
            
            {selectedHighlightStyle && (
              <div 
                className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 pointer-events-auto"
                style={{ borderLeft: `4px solid ${getHighlightColor(selectedHighlightStyle)}` }}
              >
                <span className="text-xs font-semibold text-slate-700 capitalize">
                  {selectedHighlightStyle.category}
                </span>
              </div>
            )}
          </div>

          {paneState !== 'minimized' && (
            <>
              <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-xs">
                {selectedElementInfo && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3 pointer-events-auto">
                    <h3 className="text-sm font-bold text-slate-800 mb-1">{selectedElementInfo.name}</h3>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span>{selectedElementInfo.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span className="capitalize">{selectedElementInfo.category}</span>
                      </div>
                      {selectedElementInfo.spaceId && (
                        <div className="flex justify-between">
                          <span className="font-medium">Space:</span>
                          <span>{selectedElementInfo.spaceId}</span>
                        </div>
                      )}
                      {selectedElementInfo.systemId && (
                        <div className="flex justify-between">
                          <span className="font-medium">System:</span>
                          <span>{selectedElementInfo.systemId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
                {Array.from(selectedElements).slice(0, 3).map(elementId => {
                  const element = elements.find(el => el.id === elementId);
                  if (!element) return null;
                  return (
                    <div 
                      key={elementId}
                      className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2 pointer-events-auto flex items-center gap-2"
                      style={{ borderLeft: `3px solid ${getHighlightColor({
                        color: '',
                        category: element.category as any,
                        intensity: 'selected'
                      })}` }}
                    >
                      <span className="text-xs font-semibold text-slate-700">{element.name}</span>
                    </div>
                  );
                })}
                {selectedElements.size > 3 && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-3 py-2 pointer-events-auto">
                    <span className="text-xs font-semibold text-slate-700">
                      +{selectedElements.size - 3} more
                    </span>
                  </div>
                )}
              </div>

              {hoveredElement && (
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-300 px-4 py-3 pointer-events-none"
                  style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-700">Preview</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">{hoveredElement}</p>
                </div>
              )}
            </>
          )}

          {paneState === 'minimized' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="text-4xl mb-2">📐</div>
                <p className="text-sm font-semibold text-slate-600">Model Viewer</p>
                <p className="text-xs text-slate-500 mt-1">{selectedElements.size} selected</p>
              </div>
            </div>
          )}

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
              to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default ModelViewer;
