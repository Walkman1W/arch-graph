/**
 * Graph Test Data Generator
 * 
 * Generates large-scale test data for performance testing:
 * - 100 nodes scenario for basic performance testing
 * - 500 nodes scenario for stress testing
 * - Configurable node/edge ratios
 */

import { GraphNode, GraphEdge } from '../components/OptimizedGraphViewer';

// ============================================================================
// Types
// ============================================================================

export interface TestDataConfig {
  nodeCount: number;
  edgeRatio?: number; // edges per node (default: 2)
  includeAllTypes?: boolean;
  seed?: number; // for reproducible data
}

export interface GeneratedTestData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    generationTime: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
  };
}

// ============================================================================
// Constants
// ============================================================================

const NODE_TYPES: GraphNode['type'][] = [
  'Project', 'Level', 'Space', 'Element', 'System', 'Pipe', 'Duct', 'MEPElement', 'MEPSystem', 'Storey'
];

const EDGE_TYPES: GraphEdge['type'][] = [
  'HAS_LEVEL', 'CONTAINS', 'HAS_ELEMENT', 'PASSES_THROUGH', 'CONNECTED_TO',
  'ADJACENT_TO', 'CROSSES', 'BELONGS_TO_SYSTEM', 'ON_LEVEL'
];

const SPACE_NAMES = [
  '办公室', '会议室', '走廊', '电梯厅', '卫生间', '茶水间', '机房', '配电室',
  '消防控制室', '门厅', '楼梯间', '设备间', '储藏室', '休息室'
];

const SYSTEM_NAMES = [
  'HVAC-01', 'HVAC-02', '给水系统', '排水系统', '消防系统', '电气系统',
  '弱电系统', '燃气系统', '新风系统', '空调系统'
];

// ============================================================================
// Seeded Random Generator
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// ============================================================================
// Data Generation Functions
// ============================================================================

/**
 * Generate a unique ID
 */
function generateId(prefix: string, index: number): string {
  return `${prefix}-${index.toString().padStart(4, '0')}`;
}

/**
 * Generate a building hierarchy structure
 */
function generateBuildingHierarchy(
  nodeCount: number,
  random: SeededRandom
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Calculate distribution
  const projectCount = 1;
  const levelCount = Math.max(3, Math.floor(nodeCount * 0.05));
  const systemCount = Math.max(5, Math.floor(nodeCount * 0.08));
  const spaceCount = Math.floor(nodeCount * 0.3);
  const elementCount = nodeCount - projectCount - levelCount - systemCount - spaceCount;
  
  let nodeIndex = 0;
  let edgeIndex = 0;
  
  // Create project node
  const projectId = generateId('project', 0);
  nodes.push({
    id: projectId,
    label: '示例建筑项目',
    type: 'Project',
    properties: { globalId: `proj-${Date.now()}` }
  });
  nodeIndex++;
  
  // Create level nodes
  const levelIds: string[] = [];
  for (let i = 0; i < levelCount; i++) {
    const levelId = generateId('level', i);
    levelIds.push(levelId);
    nodes.push({
      id: levelId,
      label: `${i + 1}F`,
      type: random.next() > 0.5 ? 'Level' : 'Storey',
      properties: {
        levelCode: `${i + 1}F`,
        elevation: i * 3.5
      }
    });
    
    // Connect to project
    edges.push({
      id: generateId('edge', edgeIndex++),
      source: projectId,
      target: levelId,
      type: 'HAS_LEVEL'
    });
  }
  nodeIndex += levelCount;
  
  // Create system nodes
  const systemIds: string[] = [];
  for (let i = 0; i < systemCount; i++) {
    const systemId = generateId('system', i);
    systemIds.push(systemId);
    nodes.push({
      id: systemId,
      label: random.pick(SYSTEM_NAMES),
      type: random.next() > 0.5 ? 'System' : 'MEPSystem',
      properties: {
        systemCode: `SYS-${i + 1}`,
        category: random.pick(['HVAC', 'Plumbing', 'Electrical', 'Fire'])
      }
    });
  }
  nodeIndex += systemCount;
  
  // Create space nodes
  const spaceIds: string[] = [];
  for (let i = 0; i < spaceCount; i++) {
    const spaceId = generateId('space', i);
    spaceIds.push(spaceId);
    const levelId = random.pick(levelIds);
    
    nodes.push({
      id: spaceId,
      label: `${random.pick(SPACE_NAMES)}-${i + 1}`,
      type: 'Space',
      properties: {
        levelCode: nodes.find(n => n.id === levelId)?.properties.levelCode,
        area: random.nextInt(20, 200),
        tags: [random.pick(['公共', '私密', '服务'])]
      }
    });
    
    // Connect to level
    edges.push({
      id: generateId('edge', edgeIndex++),
      source: levelId,
      target: spaceId,
      type: 'CONTAINS'
    });
  }
  nodeIndex += spaceCount;
  
  // Create element nodes
  for (let i = 0; i < elementCount; i++) {
    const elementId = generateId('element', i);
    const elementType = random.pick(['Element', 'MEPElement', 'Pipe', 'Duct'] as GraphNode['type'][]);
    const spaceId = random.pick(spaceIds);
    const systemId = random.pick(systemIds);
    
    nodes.push({
      id: elementId,
      label: `构件-${i + 1}`,
      type: elementType,
      properties: {
        category: random.pick(['管道', '风管', '桥架', '设备']),
        diameter: elementType === 'Pipe' ? random.nextInt(50, 300) : undefined
      }
    });
    
    // Connect to space (PASSES_THROUGH or HAS_ELEMENT)
    edges.push({
      id: generateId('edge', edgeIndex++),
      source: spaceId,
      target: elementId,
      type: random.next() > 0.5 ? 'PASSES_THROUGH' : 'HAS_ELEMENT'
    });
    
    // Connect to system
    edges.push({
      id: generateId('edge', edgeIndex++),
      source: elementId,
      target: systemId,
      type: 'BELONGS_TO_SYSTEM'
    });
  }
  
  return { nodes, edges };
}

/**
 * Add additional edges for connectivity
 */
function addConnectivityEdges(
  nodes: GraphNode[],
  edges: GraphEdge[],
  targetEdgeCount: number,
  random: SeededRandom
): GraphEdge[] {
  const additionalEdges: GraphEdge[] = [];
  const existingEdgeSet = new Set(edges.map(e => `${e.source}-${e.target}`));
  let edgeIndex = edges.length;
  
  const spaceNodes = nodes.filter(n => n.type === 'Space');
  const elementNodes = nodes.filter(n => 
    ['Element', 'MEPElement', 'Pipe', 'Duct'].includes(n.type)
  );
  
  // Add ADJACENT_TO edges between spaces
  for (let i = 0; i < spaceNodes.length - 1 && additionalEdges.length < targetEdgeCount - edges.length; i++) {
    const space1 = spaceNodes[i];
    const space2 = spaceNodes[i + 1];
    const edgeKey = `${space1.id}-${space2.id}`;
    
    if (!existingEdgeSet.has(edgeKey) && random.next() > 0.5) {
      additionalEdges.push({
        id: generateId('edge', edgeIndex++),
        source: space1.id,
        target: space2.id,
        type: 'ADJACENT_TO'
      });
      existingEdgeSet.add(edgeKey);
    }
  }
  
  // Add CROSSES edges (elements crossing spaces)
  for (const element of elementNodes) {
    if (additionalEdges.length >= targetEdgeCount - edges.length) break;
    
    const crossCount = random.nextInt(1, 3);
    const shuffledSpaces = random.shuffle(spaceNodes);
    
    for (let i = 0; i < crossCount && i < shuffledSpaces.length; i++) {
      const space = shuffledSpaces[i];
      const edgeKey = `${element.id}-${space.id}`;
      
      if (!existingEdgeSet.has(edgeKey)) {
        additionalEdges.push({
          id: generateId('edge', edgeIndex++),
          source: element.id,
          target: space.id,
          type: 'CROSSES'
        });
        existingEdgeSet.add(edgeKey);
      }
    }
  }
  
  // Add CONNECTED_TO edges between elements
  for (let i = 0; i < elementNodes.length - 1 && additionalEdges.length < targetEdgeCount - edges.length; i++) {
    if (random.next() > 0.7) {
      const elem1 = elementNodes[i];
      const elem2 = elementNodes[random.nextInt(i + 1, elementNodes.length - 1)];
      const edgeKey = `${elem1.id}-${elem2.id}`;
      
      if (!existingEdgeSet.has(edgeKey)) {
        additionalEdges.push({
          id: generateId('edge', edgeIndex++),
          source: elem1.id,
          target: elem2.id,
          type: 'CONNECTED_TO'
        });
        existingEdgeSet.add(edgeKey);
      }
    }
  }
  
  return additionalEdges;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate test data with specified configuration
 */
export function generateTestData(config: TestDataConfig): GeneratedTestData {
  const startTime = performance.now();
  const random = new SeededRandom(config.seed || Date.now());
  const edgeRatio = config.edgeRatio || 2;
  
  // Generate base hierarchy
  const { nodes, edges } = generateBuildingHierarchy(config.nodeCount, random);
  
  // Add connectivity edges
  const targetEdgeCount = Math.floor(config.nodeCount * edgeRatio);
  const additionalEdges = addConnectivityEdges(nodes, edges, targetEdgeCount, random);
  const allEdges = [...edges, ...additionalEdges];
  
  // Calculate metadata
  const nodeTypes: Record<string, number> = {};
  const edgeTypes: Record<string, number> = {};
  
  for (const node of nodes) {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  }
  
  for (const edge of allEdges) {
    edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
  }
  
  const generationTime = performance.now() - startTime;
  
  return {
    nodes,
    edges: allEdges,
    metadata: {
      nodeCount: nodes.length,
      edgeCount: allEdges.length,
      generationTime,
      nodeTypes,
      edgeTypes
    }
  };
}

/**
 * Generate 100-node test dataset
 */
export function generate100NodeDataset(seed?: number): GeneratedTestData {
  return generateTestData({
    nodeCount: 100,
    edgeRatio: 2,
    seed: seed || 12345
  });
}

/**
 * Generate 500-node test dataset
 */
export function generate500NodeDataset(seed?: number): GeneratedTestData {
  return generateTestData({
    nodeCount: 500,
    edgeRatio: 2.5,
    seed: seed || 54321
  });
}

/**
 * Generate 1000-node stress test dataset
 */
export function generate1000NodeDataset(seed?: number): GeneratedTestData {
  return generateTestData({
    nodeCount: 1000,
    edgeRatio: 3,
    seed: seed || 99999
  });
}

/**
 * Generate minimal test dataset (for unit tests)
 */
export function generateMinimalDataset(): GeneratedTestData {
  return generateTestData({
    nodeCount: 20,
    edgeRatio: 1.5,
    seed: 11111
  });
}

// ============================================================================
// Performance Benchmarking
// ============================================================================

export interface BenchmarkResult {
  datasetSize: number;
  generationTime: number;
  renderTime?: number;
  memoryUsage?: number;
  passed: boolean;
  threshold: number;
}

/**
 * Run performance benchmark for data generation
 */
export function benchmarkDataGeneration(
  nodeCount: number,
  iterations: number = 5
): BenchmarkResult {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = generateTestData({ nodeCount, seed: i * 1000 });
    times.push(result.metadata.generationTime);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const threshold = nodeCount <= 100 ? 100 : nodeCount <= 500 ? 500 : 2000;
  
  return {
    datasetSize: nodeCount,
    generationTime: avgTime,
    passed: avgTime < threshold,
    threshold
  };
}

/**
 * Validate generated data integrity
 */
export function validateTestData(data: GeneratedTestData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeIds = new Set(data.nodes.map(n => n.id));
  
  // Check for duplicate node IDs
  if (nodeIds.size !== data.nodes.length) {
    errors.push('Duplicate node IDs found');
  }
  
  // Check edge references
  for (const edge of data.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target: ${edge.target}`);
    }
  }
  
  // Check node types
  for (const node of data.nodes) {
    if (!NODE_TYPES.includes(node.type)) {
      errors.push(`Invalid node type: ${node.type}`);
    }
  }
  
  // Check edge types
  for (const edge of data.edges) {
    if (!EDGE_TYPES.includes(edge.type)) {
      errors.push(`Invalid edge type: ${edge.type}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  generateTestData,
  generate100NodeDataset,
  generate500NodeDataset,
  generate1000NodeDataset,
  generateMinimalDataset,
  benchmarkDataGeneration,
  validateTestData
};
