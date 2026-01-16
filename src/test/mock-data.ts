import { MockBIMElement } from '../types';

export const mockBIMElements: MockBIMElement[] = [
  {
    id: 'space-001',
    name: '办公区域',
    type: 'space',
    category: 'space',
    level: 'Level 1',
    material: 'concrete',
    geometry: {
      position: [0, 0, 0],
      boundingBox: {
        min: [-5, -5, 0],
        max: [5, 5, 3.5],
      },
    },
    properties: {
      area: 150,
      volume: 450,
      type: 'office',
      capacity: 20,
    },
  },
  {
    id: 'space-002',
    name: '会议室',
    type: 'space',
    category: 'space',
    level: 'Level 1',
    material: 'concrete',
    geometry: {
      position: [10, 0, 0],
      boundingBox: {
        min: [5, -5, 0],
        max: [15, 5, 3.5],
      },
    },
    properties: {
      area: 100,
      volume: 300,
      type: 'meeting',
      capacity: 10,
    },
  },
  {
    id: 'element-001',
    name: '柱子-1',
    type: 'column',
    category: 'element',
    level: 'Level 1',
    material: 'steel',
    geometry: {
      position: [0, 0, 1.75],
      boundingBox: {
        min: [-0.25, -0.25, 0],
        max: [0.25, 0.25, 3.5],
      },
    },
    properties: {
      height: 3.5,
      diameter: 0.5,
      type: 'column',
      grade: 'A36',
    },
  },
  {
    id: 'element-002',
    name: '梁-1',
    type: 'beam',
    category: 'element',
    level: 'Level 1',
    material: 'concrete',
    geometry: {
      position: [3, 0, 3.25],
      boundingBox: {
        min: [0, -0.15, 3],
        max: [6, 0.15, 3.5],
      },
    },
    properties: {
      length: 6,
      width: 0.3,
      height: 0.5,
      type: 'beam',
      grade: 'C30',
    },
  },
  {
    id: 'element-003',
    name: '墙-1',
    type: 'wall',
    category: 'element',
    level: 'Level 1',
    material: 'brick',
    geometry: {
      position: [5, 0, 1.75],
      boundingBox: {
        min: [4.9, -5, 0],
        max: [5.1, 5, 3.5],
      },
    },
    properties: {
      length: 10,
      height: 3.5,
      thickness: 0.2,
      type: 'wall',
    },
  },
  {
    id: 'system-001',
    name: '空调系统-1',
    type: 'hvac',
    category: 'system',
    level: 'Level 1',
    material: 'copper',
    geometry: {
      position: [2, 2, 3.2],
      boundingBox: {
        min: [1.5, 1.5, 3],
        max: [2.5, 2.5, 3.4],
      },
    },
    properties: {
      capacity: 5000,
      type: 'hvac',
      zone: 'Zone A',
      power: 2.5,
    },
  },
  {
    id: 'system-002',
    name: '照明系统-1',
    type: 'lighting',
    category: 'system',
    level: 'Level 1',
    material: 'aluminum',
    geometry: {
      position: [0, 0, 3.4],
      boundingBox: {
        min: [-0.5, -0.5, 3.3],
        max: [0.5, 0.5, 3.5],
      },
    },
    properties: {
      capacity: 500,
      type: 'lighting',
      zone: 'Zone A',
      power: 0.1,
    },
  },
  {
    id: 'pipe-001',
    name: '水管-1',
    type: 'water',
    category: 'pipe',
    level: 'Level 1',
    material: 'pvc',
    geometry: {
      position: [3, 3, 1.5],
      boundingBox: {
        min: [0, 3, 1.45],
        max: [6, 3.05, 1.55],
      },
    },
    properties: {
      diameter: 0.1,
      length: 6,
      type: 'water',
      pressure: 0.5,
    },
  },
  {
    id: 'pipe-002',
    name: '气管-1',
    type: 'gas',
    category: 'pipe',
    level: 'Level 1',
    material: 'steel',
    geometry: {
      position: [3, 4, 1.5],
      boundingBox: {
        min: [0, 4, 1.45],
        max: [6, 4.05, 1.55],
      },
    },
    properties: {
      diameter: 0.08,
      length: 6,
      type: 'gas',
      pressure: 0.3,
    },
  },
];

export const mockGraphNodes = [
  {
    id: 'node-space-001',
    type: 'space',
    label: '办公区域',
    elementId: 'space-001',
    properties: {
      area: 150,
      capacity: 20,
    },
  },
  {
    id: 'node-space-002',
    type: 'space',
    label: '会议室',
    elementId: 'space-002',
    properties: {
      area: 100,
      capacity: 10,
    },
  },
  {
    id: 'node-element-001',
    type: 'element',
    label: '柱子-1',
    elementId: 'element-001',
    properties: {
      height: 3.5,
      material: 'steel',
    },
  },
  {
    id: 'node-element-002',
    type: 'element',
    label: '梁-1',
    elementId: 'element-002',
    properties: {
      length: 6,
      material: 'concrete',
    },
  },
  {
    id: 'node-system-001',
    type: 'system',
    label: '空调系统-1',
    elementId: 'system-001',
    properties: {
      capacity: 5000,
      zone: 'Zone A',
    },
  },
  {
    id: 'node-pipe-001',
    type: 'pipe',
    label: '水管-1',
    elementId: 'pipe-001',
    properties: {
      diameter: 0.1,
      type: 'water',
    },
  },
];

export const mockGraphEdges = [
  {
    id: 'edge-1',
    source: 'node-space-001',
    target: 'node-element-001',
    type: 'contains',
    properties: {
      relationship: 'spatial',
    },
  },
  {
    id: 'edge-2',
    source: 'node-space-001',
    target: 'node-element-002',
    type: 'contains',
    properties: {
      relationship: 'spatial',
    },
  },
  {
    id: 'edge-3',
    source: 'node-space-001',
    target: 'node-system-001',
    type: 'served_by',
    properties: {
      relationship: 'functional',
    },
  },
  {
    id: 'edge-4',
    source: 'node-space-002',
    target: 'node-system-001',
    type: 'served_by',
    properties: {
      relationship: 'functional',
    },
  },
  {
    id: 'edge-5',
    source: 'node-system-001',
    target: 'node-pipe-001',
    type: 'connected_to',
    properties: {
      relationship: 'physical',
    },
  },
];

export const highlightColors = {
  space: '#3b82f6',
  element: '#10b981',
  system: '#f59e0b',
  pipe: '#8b5cf6',
} as const;

export const highlightIntensities = {
  preview: '40',
  selected: 'ff',
  result: '80',
} as const;

export function getHighlightColor(category: keyof typeof highlightColors, intensity: keyof typeof highlightIntensities): string {
  const baseColor = highlightColors[category] || '#6b7280';
  const alpha = highlightIntensities[intensity];
  return baseColor + alpha;
}
