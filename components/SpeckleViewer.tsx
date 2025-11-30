import React, { memo, useRef, useEffect, useState } from 'react';

interface SpeckleViewerProps {
  embedUrl: string;
}

// Extract src URL from iframe tag if full iframe HTML is provided
const extractSrcFromIframe = (input: string): string => {
  if (!input) return '';
  
  // If it's already a URL (starts with http), return as is
  if (input.trim().startsWith('http')) {
    return input.trim();
  }
  
  // Try to extract src from iframe tag
  const srcMatch = input.match(/src=["']([^"']+)["']/);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }
  
  return input;
};

// Cache for loaded iframes to prevent reload
const iframeCache = new Map<string, boolean>();

const SpeckleViewer: React.FC<SpeckleViewerProps> = memo(({ embedUrl }) => {
  const cleanUrl = extractSrcFromIframe(embedUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(iframeCache.has(cleanUrl));
  const [isLoading, setIsLoading] = useState(!iframeCache.has(cleanUrl) && !!cleanUrl);

  // Handle iframe load
  useEffect(() => {
    if (!cleanUrl) return;
    
    // If already cached, mark as loaded immediately
    if (iframeCache.has(cleanUrl)) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const handleLoad = () => {
      iframeCache.set(cleanUrl, true);
      setIsLoaded(true);
      setIsLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [cleanUrl]);

  return (
    <div className="w-full h-full relative bg-slate-100">
      {cleanUrl ? (
        <>
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">加载模型中...</p>
              </div>
            </div>
          )}
          <iframe 
            ref={iframeRef}
            title="3D Model Viewer" 
            src={cleanUrl} 
            width="100%" 
            height="100%" 
            frameBorder="0"
            style={{ 
              border: 'none', 
              display: 'block',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            className="w-full h-full"
            // Prevent iframe from reloading on parent re-render
            loading="lazy"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">No model loaded</p>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if embedUrl actually changes
  return extractSrcFromIframe(prevProps.embedUrl) === extractSrcFromIframe(nextProps.embedUrl);
});

SpeckleViewer.displayName = 'SpeckleViewer';

export default SpeckleViewer;
