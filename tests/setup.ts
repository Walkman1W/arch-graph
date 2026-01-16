import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for Three.js
vi.stubGlobal('ResizeObserver', class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
});

// Mock window.matchMedia
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock Three.js WebGLRenderer
global.WebGLRenderingContext = {
  COLOR_BUFFER_BIT: 0,
  DEPTH_BUFFER_BIT: 0,
} as any;

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearColor: vi.fn(),
  clear: vi.fn(),
  enable: vi.fn(),
  depthFunc: vi.fn(),
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(() => ({})),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getUniformLocation: vi.fn(() => 0),
  uniformMatrix4fv: vi.fn(),
  uniform3fv: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
  vertexAttribPointer: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  drawArrays: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => ''),
  getProgramInfoLog: vi.fn(() => ''),
  getExtension: vi.fn(() => null),
  vertexAttribDivisor: vi.fn(),
  uniform1i: vi.fn(),
  blendFunc: vi.fn(),
  activeTexture: vi.fn(),
  pixelStorei: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  generateMipmap: vi.fn(),
  createTexture: vi.fn(() => ({})),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: vi.fn(() => 0),
  scissor: vi.fn(),
  viewport: vi.fn(),
  scissorTest: vi.fn(),
  colorMask: vi.fn(),
  depthMask: vi.fn(),
  stencilFunc: vi.fn(),
  stencilOp: vi.fn(),
  stencilMask: vi.fn(),
}));

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,');
