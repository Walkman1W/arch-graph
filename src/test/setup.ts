import '@testing-library/jest-dom';

import { Canvas, createCanvas } from 'canvas';

global.Canvas = Canvas;
global.HTMLCanvasElement = Canvas as any;

Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
  value: function (contextType: string) {
    if (contextType === '2d') {
      const canvas = createCanvas(800, 600);
      return canvas.getContext('2d');
    }
    return null;
  },
  writable: true
});

Object.defineProperty(global.HTMLCanvasElement.prototype, 'toDataURL', {
  value: function () {
    return 'data:image/png;base64,test';
  },
  writable: true
});
