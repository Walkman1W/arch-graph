const SPECKLE_URL_PATTERN = /^https:\/\/speckle\.(xyz|systems)\/streams\/([a-zA-Z0-9]+)(\/.*)?$/;

export const speckleUtils = {
  validateSpeckleUrl: (url: string): boolean => {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return SPECKLE_URL_PATTERN.test(url.trim());
  },

  extractStreamId: (url: string): string | null => {
    const match = url.trim().match(SPECKLE_URL_PATTERN);
    if (match && match[2]) {
      return match[2];
    }
    return null;
  },

  getEmbedUrl: (speckleUrl: string): string => {
    const streamId = speckleUtils.extractStreamId(speckleUrl);
    if (!streamId) {
      return speckleUrl;
    }
    
    const baseUrl = speckleUrl.includes('speckle.systems') 
      ? 'https://speckle.systems' 
      : 'https://speckle.xyz';
    
    return `${baseUrl}/embed?stream=${streamId}&autoload=true&transparent=true&hidecontrols=false&hideselectioninfo=false`;
  },

  getThumbnailUrl: (speckleUrl: string): string => {
    const streamId = speckleUtils.extractStreamId(speckleUrl);
    if (!streamId) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Preview%3C/text%3E%3C/svg%3E';
    }
    
    const baseUrl = speckleUrl.includes('speckle.systems') 
      ? 'https://speckle.systems' 
      : 'https://speckle.xyz';
    
    return `${baseUrl}/preview/${streamId}`;
  },

  normalizeUrl: (url: string): string => {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  },
};
