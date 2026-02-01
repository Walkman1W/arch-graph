import React, { useState, useEffect } from 'react';

interface SpeckleViewerProps {
  embedUrl: string;
}

const SpeckleViewer: React.FC<SpeckleViewerProps> = ({ embedUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUrlValid, setIsUrlValid] = useState(true);
  
  useEffect(() => {
    // Reset state when embedUrl changes
    setHasError(false);
    setIsLoading(true);
    
    // Validate URL format
    try {
      const url = new URL(embedUrl);
      if (!url.hostname.includes('speckle.systems')) {
        console.warn('SpeckleViewer: URL does not appear to be a valid Speckle URL');
        setIsUrlValid(false);
        setHasError(true);
      }
    } catch (error) {
      console.error('SpeckleViewer: Invalid URL format', error);
      setIsUrlValid(false);
      setHasError(true);
    }
  }, [embedUrl]);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  const handleIframeError = () => {
    console.error('SpeckleViewer: Failed to load Speckle embed');
    setHasError(true);
    setIsLoading(false);
  };
  
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };
  
  if (!isUrlValid) {
    return (
      <div className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Invalid Speckle URL</h3>
          <p className="text-sm text-slate-500 mb-4">The provided URL is not a valid Speckle model URL</p>
          <code className="text-xs bg-slate-200 p-2 rounded block mb-4 text-left overflow-x-auto">
            {embedUrl}
          </code>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🏗️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">3D Model Unavailable</h3>
          <p className="text-sm text-slate-500 mb-4">The Speckle model could not be loaded</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">Loading 3D Model...</p>
          </div>
        </div>
      )}
      
      <iframe 
        title="Speckle Viewer" 
        src={embedUrl} 
        width="100%" 
        height="100%" 
        frameBorder="0"
        className="absolute inset-0 w-full h-full"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="fullscreen; vr; xr; accelerometer; magnetometer; gyroscope; camera; microphone"
      ></iframe>
      
      {/* Overlay Badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
        <span className="text-xs font-semibold text-slate-700">{isLoading ? 'Loading' : 'Live'} Model</span>
      </div>
    </div>
  );
};

export default SpeckleViewer;
