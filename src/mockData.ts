import { MockBIMElement, MockGraphData } from '../types';

const createBoundingBox = (x: number, y: number, z: number, width: number, height: number, depth: number) => ({
  min: [x, y, z] as [number, number, number],
  max: [x + width, y + height, z + depth] as [number, number, number],
  center: [x + width / 2, y + height / 2, z + depth / 2] as [number, number, number],
  size: [width, height, depth] as [number, number, number],
});

export const mockBIMElements: MockBIMElement[] = [
  {
    id: 'space-1',
    type: 'space',
    name: '办公室',
    category: 'space',
    geometry: {
      position: [0, 0, 0] as [number, number, number],
      boundingBox: createBoundingBox(0, 0, 0, 10, 3, 8),
    },
    properties: {
      area: 80,
      volume: 240,
      usage: '办公',
    },
  },
  {
    id: 'space-2',
    type: 'space',
    name: '会议室',
    category: 'space',
    geometry: {
      position: [12, 0, 0] as [number, number, number],
      boundingBox: createBoundingBox(12, 0, 0, 8, 3.5, 8),
    },
    properties: {
      area: 64,
      volume: 224,
      usage: '会议',
    },
  },
  {
    id: 'wall-1',
    type: 'wall',
    name: '外墙',
    category: 'element',
    material: '混凝土',
    geometry: {
      position: [0, 0, 0] as [number, number, number],
      boundingBox: createBoundingBox(0, 0, 0, 10, 3, 0.2),
    },
    properties: {
      thickness: 0.2,
    },
  },
  {
    id: 'door-1',
    type: 'door',
    name: '办公室门',
    category: 'element',
    material: '木材',
    geometry: {
      position: [5, 0, 0] as [number, number, number],
      boundingBox: createBoundingBox(5, 0, 0, 0.1, 2.1, 0.9),
    },
    properties: {
      type: '平开门',
    },
  },
  {
    id: 'window-1',
    type: 'window',
    name: '窗户',
    category: 'element',
    material: '玻璃',
    geometry: {
      position: [3, 0.5, 0] as [number, number, number],
      boundingBox: createBoundingBox(3, 0.5, 0, 1.5, 1.2, 0.1),
    },
    properties: {
      type: '推拉窗',
    },
  },
  {
    id: 'system-1',
    type: 'system',
    name: '空调系统',
    category: 'system',
    geometry: {
      position: [0, 3, 0] as [number, number, number],
      boundingBox: createBoundingBox(0, 3, 0, 10, 0.3, 8),
    },
    properties: {
      type: '中央空调',
      power: 5000,
    },
  },
  {
    id: 'pipe-1',
    type: 'pipe',
    name: '水管',
    category: 'pipe',
    material: 'PVC',
    geometry: {
      position: [0, -0.2, 0] as [number, number, number],
      boundingBox: createBoundingBox(0, -0.2, 0, 10, 0.1, 0.1),
    },
    properties: {
      diameter: 0.1,
    },
  },
];

export const mockGraphData: MockGraphData = {
  nodes: [
    { data: { id: 'space-1', label: '办公室', category: 'space' } },
    { data: { id: 'space-2', label: '会议室', category: 'space' } },
    { data: { id: 'wall-1', label: '外墙', category: 'element' } },
    { data: { id: 'door-1', label: '办公室门', category: 'element' } },
    { data: { id: 'window-1', label: '窗户', category: 'element' } },
    { data: { id: 'system-1', label: '空调系统', category: 'system' } },
    { data: { id: 'pipe-1', label: '水管', category: 'pipe' } },
  ],
  edges: [
    { data: { id: 'e1', source: 'space-1', target: 'wall-1', label: '包含' } },
    { data: { id: 'e2', source: 'space-1', target: 'door-1', label: '包含' } },
    { data: { id: 'e3', source: 'space-1', target: 'window-1', label: '包含' } },
    { data: { id: 'e4', source: 'space-1', target: 'system-1', label: '包含' } },
    { data: { id: 'e5', source: 'space-1', target: 'pipe-1', label: '包含' } },
    { data: { id: 'e6', source: 'space-2', target: 'wall-1', label: '相邻' } },
  ],
};
