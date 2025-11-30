import React from 'react';

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

const SpeckleViewer: React.FC<SpeckleViewerProps> = ({ embedUrl }) => {
  const cleanUrl = extractSrcFromIframe(embedUrl);
  
  return (
    <div className="w-full h-full relative bg-slate-100">
      {cleanUrl ? (
        <iframe 
          title="3D Model Viewer" 
          src={cleanUrl} 
          width="100%" 
          height="100%" 
          frameBorder="0"
          style={{ border: 'none', display: 'block' }}
          className="w-full h-full"
        ></iframe>
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
};

export default SpeckleViewer;
