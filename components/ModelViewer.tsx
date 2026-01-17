import React, { useRef, useEffect, useCallback } from 'react';
import { PaneState, HighlightStyle } from '../types';
import { useLanguage } from '../contexts/LanguageProvider';

// BIM Element interface
export interface BIMElement {
  id: string;
  name: string;
  type: string;
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
  speckleUrl?: string;
  elements: BIMElement[];
  selectedElements: Set<string>;
  highlightedElements: Map<string, HighlightStyle>;
  hoveredElement: string | null;
  onElementClick: (elementId: string) => void;
  onElementHover: (elementId: string | null) => void;
  paneState: PaneState;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  speckleUrl,
  elements,
  selectedElements,
  highlightedElements,
  hoveredElement,
  onElementClick,
  onElementHover,
  paneState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { t } = useLanguage();

  // Handle element click
  const handleElementClick = useCallback((elementId: string) => {
    onElementClick(elementId);
  }, [onElementClick]);

  // Handle element hover
  const handleElementHover = useCallback((elementId: string | null) => {
    onElementHover(elementId);
  }, [onElementHover]);

  // Apply highlights when highlightedElements change
  useEffect(() => {
    if (!containerRef.current) return;

    // Apply highlight styles to elements
    highlightedElements.forEach((style, elementId) => {
      const element = elements.find(el => el.id === elementId);
      if (element) {
        // Apply color-coded highlighting based on style
        console.log(`Highlighting element ${elementId} with color ${style.color}`);
      }
    });
  }, [highlightedElements, elements]);

  // Focus camera on selected elements
  useEffect(() => {
    if (selectedElements.size === 0) return;

    const selectedIds = Array.from(selectedElements);
    const selectedElems = elements.filter(el => selectedIds.includes(el.id));

    if (selectedElems.length > 0) {
      // Calculate bounding box for all selected elements
      const bounds = calculateBoundingBox(selectedElems);
      
      // Animate camera to focus on bounds
      animateCameraToTarget(bounds);
    }
  }, [selectedElements, elements]);

  // Handle pane state changes
  useEffect(() => {
    if (paneState === 'minimized') {
      // Hide controls when minimized
      console.log('ModelViewer minimized - hiding controls');
    } else if (paneState === 'maximized') {
      // Show full controls when maximized
      console.log('ModelViewer maximized - showing full controls');
    }
  }, [paneState]);

  // Calculate combined bounding box for multiple elements
  const calculateBoundingBox = (elems: BIMElement[]) => {
    if (elems.length === 0) return null;

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    elems.forEach(elem => {
      const { boundingBox } = elem.geometry;
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], boundingBox.min[i]);
        max[i] = Math.max(max[i], boundingBox.max[i]);
      }
    });

    return { min, max };
  };

  // Animate camera to target bounding box
  const animateCameraToTarget = (bounds: any) => {
    if (!bounds) return;

    try {
      // Camera animation logic
      console.log('Animating camera to bounds:', bounds);
      
      // Calculate center point
      const center = [
        (bounds.min[0] + bounds.max[0]) / 2,
        (bounds.min[1] + bounds.max[1]) / 2,
        (bounds.min[2] + bounds.max[2]) / 2,
      ];

      // Calculate distance based on bounding box size
      const size = Math.max(
        bounds.max[0] - bounds.min[0],
        bounds.max[1] - bounds.min[1],
        bounds.max[2] - bounds.min[2]
      );

      const distance = size * 2;

      console.log(`Camera target: center=${center}, distance=${distance}`);
    } catch (error) {
      console.error('Camera animation failed:', error);
      // Fallback: jump to position without animation
    }
  };

  // Render bounding boxes for selected elements
  const renderBoundingBoxes = () => {
    if (selectedElements.size === 0) return null;

    return Array.from(selectedElements).map(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (!element) return null;

      const { boundingBox } = element.geometry;
      
      return (
        <div
          key={`bbox-${elementId}`}
          className="absolute pointer-events-none border-2 border-blue-500"
          style={{
            // Position based on bounding box (simplified for 2D overlay)
            left: `${boundingBox.min[0]}px`,
            top: `${boundingBox.min[1]}px`,
            width: `${boundingBox.max[0] - boundingBox.min[0]}px`,
            height: `${boundingBox.max[1] - boundingBox.min[1]}px`,
          }}
        />
      );
    });
  };

  // Get highlight color for an element
  const getHighlightColor = (elementId: string): string | null => {
    const style = highlightedElements.get(elementId);
    if (!style) return null;

    // Return color based on intensity
    switch (style.intensity) {
      case 'preview':
        return `${style.color}40`; // 25% opacity
      case 'selected':
        return `${style.color}CC`; // 80% opacity
      case 'result':
        return style.color; // Full opacity
      default:
        return style.color;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner"
    >
      {/* Speckle Viewer iframe */}
      {speckleUrl && (
        <iframe
          ref={iframeRef}
          title="Speckle Viewer"
          src={speckleUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Placeholder when no Speckle URL */}
      {!speckleUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 text-lg mb-2">{t('modelViewer.title')}</div>
            <div className="text-slate-300 text-sm">{t('modelViewer.noModel')}</div>
          </div>
        </div>
      )}

      {/* Bounding boxes overlay */}
      {renderBoundingBoxes()}

      {/* Status badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${selectedElements.size > 0 ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
        <span className="text-xs font-semibold text-slate-700">
          {selectedElements.size > 0 ? `${selectedElements.size} ${t('modelViewer.selected')}` : t('modelViewer.liveModel')}
        </span>
      </div>

      {/* Selection info */}
      {selectedElements.size > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-slate-200 z-10">
          <div className="text-xs text-slate-600">
            {Array.from(selectedElements).map(id => {
              const element = elements.find(el => el.id === id);
              return element ? (
                <div key={id} className="mb-1">
                  <span className="font-semibold">{element.name}</span>
                  <span className="text-slate-400 ml-2">{element.type}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Hover preview */}
      {hoveredElement && !selectedElements.has(hoveredElement) && (
        <div className="absolute top-16 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 z-10">
          <div className="text-xs text-slate-600">
            {elements.find(el => el.id === hoveredElement)?.name || hoveredElement}
          </div>
        </div>
      )}

      {/* Minimized state indicator */}
      {paneState === 'minimized' && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-white text-sm">{t('modelViewer.minimized')}</div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
