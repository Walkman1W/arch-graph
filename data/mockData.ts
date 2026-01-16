import { BIMElement, GraphNode, GraphEdge } from '../types';

export const mockBIMElements: BIMElement[] = [
  {
    id: 'element-1',
    name: '混凝土墙 A1',
    type: 'Wall',
    spaceId: 'space-1',
    geometry: {
      position: [10, 0, 5],
      boundingBox: {
        min: [8, -0.2, 3],
        max: [12, 0.2, 7],
      },
    },
    properties: { material: 'Concrete', thickness: '200mm' },
  },
  {
    id: 'element-2',
    name: '混凝土墙 A2',
    type: 'Wall',
    spaceId: 'space-1',
    geometry: {
      position: [10, 5, 0],
      boundingBox: {
        min: [8, 4.8, -2],
        max: [12, 5.2, 2],
      },
    },
    properties: { material: 'Concrete', thickness: '200mm' },
  },
  {
    id: 'element-3',
    name: '窗 W1',
    type: 'Window',
    spaceId: 'space-1',
    geometry: {
      position: [10, 0, 6],
      boundingBox: {
        min: [9, -0.2, 5.5],
        max: [11, 0.2, 6.5],
      },
    },
    properties: { material: 'Glass', area: '2m²' },
  },
  {
    id: 'element-4',
    name: '门 D1',
    type: 'Door',
    spaceId: 'space-1',
    geometry: {
      position: [12, 2.5, 1],
      boundingBox: {
        min: [11.8, 1.5, 0.5],
        max: [12.2, 3.5, 1.5],
      },
    },
    properties: { material: 'Timber', width: '1m' },
  },
  {
    id: 'element-5',
    name: '柱 C1',
    type: 'Column',
    spaceId: 'space-1',
    geometry: {
      position: [8, 0, 3],
      boundingBox: {
        min: [7.8, -0.2, 2.8],
        max: [8.2, 0.2, 3.2],
      },
    },
    properties: { material: 'Concrete', diameter: '400mm' },
  },
  {
    id: 'element-6',
    name: '混凝土墙 B1',
    type: 'Wall',
    spaceId: 'space-2',
    geometry: {
      position: [25, 0, 5],
      boundingBox: {
        min: [23, -0.2, 3],
        max: [27, 0.2, 7],
      },
    },
    properties: { material: 'Concrete', thickness: '200mm' },
  },
  {
    id: 'element-7',
    name: '混凝土墙 B2',
    type: 'Wall',
    spaceId: 'space-2',
    geometry: {
      position: [25, 5, 0],
      boundingBox: {
        min: [23, 4.8, -2],
        max: [27, 5.2, 2],
      },
    },
    properties: { material: 'Concrete', thickness: '200mm' },
  },
  {
    id: 'element-8',
    name: '窗 W2',
    type: 'Window',
    spaceId: 'space-2',
    geometry: {
      position: [25, 0, 6],
      boundingBox: {
        min: [24, -0.2, 5.5],
        max: [26, 0.2, 6.5],
      },
    },
    properties: { material: 'Glass', area: '2m²' },
  },
  {
    id: 'element-9',
    name: '天花板 C1',
    type: 'Ceiling',
    spaceId: 'space-1',
    geometry: {
      position: [10, 0, 7],
      boundingBox: {
        min: [8, -5, 6.8],
        max: [12, 5, 7.2],
      },
    },
    properties: { material: 'Gypsum', height: '3m' },
  },
  {
    id: 'element-10',
    name: '地板 F1',
    type: 'Floor',
    spaceId: 'space-1',
    geometry: {
      position: [10, 0, 0],
      boundingBox: {
        min: [8, -5, -0.2],
        max: [12, 5, 0.2],
      },
    },
    properties: { material: 'Concrete', height: '0m' },
  },
  {
    id: 'element-11',
    name: '天花板 C2',
    type: 'Ceiling',
    spaceId: 'space-2',
    geometry: {
      position: [25, 0, 7],
      boundingBox: {
        min: [23, -5, 6.8],
        max: [27, 5, 7.2],
      },
    },
    properties: { material: 'Gypsum', height: '3m' },
  },
  {
    id: 'element-12',
    name: '地板 F2',
    type: 'Floor',
    spaceId: 'space-2',
    geometry: {
      position: [25, 0, 0],
      boundingBox: {
        min: [23, -5, -0.2],
        max: [27, 5, 0.2],
      },
    },
    properties: { material: 'Concrete', height: '0m' },
  },
];

export const mockGraphNodes: GraphNode[] = [
  {
    id: 'project-1',
    label: '办公楼项目',
    type: 'Project',
    properties: { name: '办公楼项目', description: '现代化办公楼建筑' },
  },
  {
    id: 'level-1',
    label: '一层',
    type: 'Level',
    properties: { name: '一层', elevation: '0m' },
  },
  {
    id: 'space-1',
    label: '会议室 A',
    type: 'Space',
    properties: { name: '会议室 A', area: '40m²', level: '一层' },
  },
  {
    id: 'space-2',
    label: '办公室 B',
    type: 'Space',
    properties: { name: '办公室 B', area: '30m²', level: '一层' },
  },
  {
    id: 'element-1',
    label: '混凝土墙 A1',
    type: 'Element',
    properties: { name: '混凝土墙 A1', type: 'Wall', material: 'Concrete' },
  },
  {
    id: 'element-2',
    label: '混凝土墙 A2',
    type: 'Element',
    properties: { name: '混凝土墙 A2', type: 'Wall', material: 'Concrete' },
  },
  {
    id: 'element-3',
    label: '窗 W1',
    type: 'Element',
    properties: { name: '窗 W1', type: 'Window', material: 'Glass' },
  },
  {
    id: 'element-4',
    label: '门 D1',
    type: 'Element',
    properties: { name: '门 D1', type: 'Door', material: 'Timber' },
  },
  {
    id: 'element-5',
    label: '柱 C1',
    type: 'Element',
    properties: { name: '柱 C1', type: 'Column', material: 'Concrete' },
  },
  {
    id: 'element-6',
    label: '混凝土墙 B1',
    type: 'Element',
    properties: { name: '混凝土墙 B1', type: 'Wall', material: 'Concrete' },
  },
  {
    id: 'element-7',
    label: '混凝土墙 B2',
    type: 'Element',
    properties: { name: '混凝土墙 B2', type: 'Wall', material: 'Concrete' },
  },
  {
    id: 'element-8',
    label: '窗 W2',
    type: 'Element',
    properties: { name: '窗 W2', type: 'Window', material: 'Glass' },
  },
  {
    id: 'element-9',
    label: '天花板 C1',
    type: 'Element',
    properties: { name: '天花板 C1', type: 'Ceiling', material: 'Gypsum' },
  },
  {
    id: 'element-10',
    label: '地板 F1',
    type: 'Element',
    properties: { name: '地板 F1', type: 'Floor', material: 'Concrete' },
  },
  {
    id: 'element-11',
    label: '天花板 C2',
    type: 'Element',
    properties: { name: '天花板 C2', type: 'Ceiling', material: 'Gypsum' },
  },
  {
    id: 'element-12',
    label: '地板 F2',
    type: 'Element',
    properties: { name: '地板 F2', type: 'Floor', material: 'Concrete' },
  },
];

export const mockGraphEdges: GraphEdge[] = [
  { id: 'edge-1', source: 'project-1', target: 'level-1', type: 'HAS_LEVEL' },
  { id: 'edge-2', source: 'level-1', target: 'space-1', type: 'CONTAINS' },
  { id: 'edge-3', source: 'level-1', target: 'space-2', type: 'CONTAINS' },
  { id: 'edge-4', source: 'space-1', target: 'element-1', type: 'HAS_ELEMENT' },
  { id: 'edge-5', source: 'space-1', target: 'element-2', type: 'HAS_ELEMENT' },
  { id: 'edge-6', source: 'space-1', target: 'element-3', type: 'HAS_ELEMENT' },
  { id: 'edge-7', source: 'space-1', target: 'element-4', type: 'HAS_ELEMENT' },
  { id: 'edge-8', source: 'space-1', target: 'element-5', type: 'HAS_ELEMENT' },
  { id: 'edge-9', source: 'space-1', target: 'element-9', type: 'HAS_ELEMENT' },
  { id: 'edge-10', source: 'space-1', target: 'element-10', type: 'HAS_ELEMENT' },
  { id: 'edge-11', source: 'space-2', target: 'element-6', type: 'HAS_ELEMENT' },
  { id: 'edge-12', source: 'space-2', target: 'element-7', type: 'HAS_ELEMENT' },
  { id: 'edge-13', source: 'space-2', target: 'element-8', type: 'HAS_ELEMENT' },
  { id: 'edge-14', source: 'space-2', target: 'element-11', type: 'HAS_ELEMENT' },
  { id: 'edge-15', source: 'space-2', target: 'element-12', type: 'HAS_ELEMENT' },
];

export const elementToNodeMap: Map<string, string> = new Map(
  mockBIMElements.map(el => [el.id, el.id])
);

export const nodeToElementMap: Map<string, string> = new Map(
  mockGraphNodes
    .filter(n => n.type === 'Element')
    .map(n => [n.id, n.id])
);
