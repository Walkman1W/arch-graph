/**
 * Mock Graph Data Generator
 * 
 * Generates virtual graph data conforming to the semantic layered model
 * for BIM spatial relationships visualization.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type NodeType = 'Space' | 'MEPElement' | 'MEPSystem' | 'Storey' | 'RouteNode';

export type EdgeType = 
  | 'ON_LEVEL'
  | 'ADJACENT_TO'
  | 'CONNECTS_TO'
  | 'CROSSES'
  | 'BELONGS_TO_SYSTEM'
  | 'SERVES'
  | 'IN_BUILDING'
  | 'IN_ZONE';

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: {
    globalId?: string;
    levelCode?: string;
    category?: string;
    tags?: string[];
    bbox?: BoundingBox;
    systemCode?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties?: {
    weight?: number;
    via?: string;
    distance?: number;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    scenario: string;
    nodeCount: number;
    edgeCount: number;
    relationshipTypes: EdgeType[];
  };
}


export type ScenarioType = 
  | 'simple-building'
  | 'mep-system'
  | 'path-finding'
  | 'full-building';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID with prefix
 */
function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Generate a UUID-like global ID
 */
function generateGlobalId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a bounding box for a space
 */
function generateBoundingBox(
  floorIndex: number,
  spaceIndex: number,
  floorHeight: number = 3.5
): BoundingBox {
  const baseX = (spaceIndex % 3) * 10;
  const baseY = Math.floor(spaceIndex / 3) * 8;
  const baseZ = floorIndex * floorHeight;
  
  return {
    min: { x: baseX, y: baseY, z: baseZ },
    max: { x: baseX + 8, y: baseY + 6, z: baseZ + floorHeight }
  };
}

// ============================================================================
// Space Labels (Chinese)
// ============================================================================

const SPACE_LABELS = {
  office: ['办公室', '会议室', '经理室', '财务室', '人事部'],
  corridor: ['走廊', '过道', '通道'],
  utility: ['电房', '机房', '配电间', '弱电间', '消防控制室'],
  service: ['卫生间', '茶水间', '储藏室', '档案室'],
  public: ['大厅', '门厅', '接待区', '休息区']
};

const MEP_LABELS = {
  pipe: ['给水管', '排水管', '消防管', '冷凝水管'],
  duct: ['送风管', '回风管', '排烟管', '新风管'],
  cable: ['电缆桥架', '弱电桥架', '母线槽']
};

const SYSTEM_LABELS = {
  hvac: ['空调系统', '通风系统', '排烟系统'],
  electrical: ['照明系统', '动力系统', '弱电系统'],
  plumbing: ['给水系统', '排水系统', '消防系统']
};


// ============================================================================
// Node Generation Functions
// ============================================================================

/**
 * Generate a Storey (floor) node
 */
function generateStoreyNode(floorNumber: number): GraphNode {
  const levelCode = `${floorNumber}F`;
  return {
    id: `storey-${floorNumber}`,
    type: 'Storey',
    label: `${floorNumber}层`,
    properties: {
      globalId: generateGlobalId(),
      levelCode,
      category: 'Storey',
      tags: ['楼层', levelCode]
    }
  };
}

/**
 * Generate a Space node
 */
function generateSpaceNode(
  floorNumber: number,
  spaceIndex: number,
  spaceType: keyof typeof SPACE_LABELS
): GraphNode {
  const labels = SPACE_LABELS[spaceType];
  const label = labels[spaceIndex % labels.length];
  const levelCode = `${floorNumber}F`;
  
  return {
    id: `space-${floorNumber}-${spaceIndex}`,
    type: 'Space',
    label: `${label}-${levelCode}`,
    properties: {
      globalId: generateGlobalId(),
      levelCode,
      category: spaceType,
      tags: [spaceType, label],
      bbox: generateBoundingBox(floorNumber - 1, spaceIndex)
    }
  };
}

/**
 * Generate an MEP Element node
 */
function generateMEPElementNode(
  elementType: keyof typeof MEP_LABELS,
  index: number,
  floorNumber: number
): GraphNode {
  const labels = MEP_LABELS[elementType];
  const label = labels[index % labels.length];
  const levelCode = `${floorNumber}F`;
  
  return {
    id: `mep-${elementType}-${floorNumber}-${index}`,
    type: 'MEPElement',
    label: `${label}-${index + 1}`,
    properties: {
      globalId: generateGlobalId(),
      levelCode,
      category: elementType,
      tags: [elementType, label]
    }
  };
}

/**
 * Generate an MEP System node
 */
function generateMEPSystemNode(
  systemType: keyof typeof SYSTEM_LABELS,
  index: number
): GraphNode {
  const labels = SYSTEM_LABELS[systemType];
  const label = labels[index % labels.length];
  const systemCode = `SYS-${systemType.toUpperCase()}-${index + 1}`;
  
  return {
    id: `system-${systemType}-${index}`,
    type: 'MEPSystem',
    label,
    properties: {
      globalId: generateGlobalId(),
      systemCode,
      category: systemType,
      tags: [systemType, label]
    }
  };
}


// ============================================================================
// Edge Generation Functions
// ============================================================================

/**
 * Generate an ON_LEVEL edge (Space -> Storey)
 */
function generateOnLevelEdge(spaceId: string, storeyId: string): GraphEdge {
  return {
    id: `edge-onlevel-${spaceId}-${storeyId}`,
    source: spaceId,
    target: storeyId,
    type: 'ON_LEVEL'
  };
}

/**
 * Generate an ADJACENT_TO edge (Space <-> Space)
 */
function generateAdjacentEdge(
  space1Id: string,
  space2Id: string,
  distance?: number
): GraphEdge {
  return {
    id: `edge-adjacent-${space1Id}-${space2Id}`,
    source: space1Id,
    target: space2Id,
    type: 'ADJACENT_TO',
    properties: distance ? { distance } : undefined
  };
}

/**
 * Generate a CONNECTS_TO edge (Space <-> Space, passable)
 */
function generateConnectsEdge(
  space1Id: string,
  space2Id: string,
  via?: string
): GraphEdge {
  return {
    id: `edge-connects-${space1Id}-${space2Id}`,
    source: space1Id,
    target: space2Id,
    type: 'CONNECTS_TO',
    properties: via ? { via } : undefined
  };
}

/**
 * Generate a CROSSES edge (MEPElement -> Space)
 */
function generateCrossesEdge(elementId: string, spaceId: string): GraphEdge {
  return {
    id: `edge-crosses-${elementId}-${spaceId}`,
    source: elementId,
    target: spaceId,
    type: 'CROSSES'
  };
}

/**
 * Generate a BELONGS_TO_SYSTEM edge (MEPElement -> MEPSystem)
 */
function generateBelongsToSystemEdge(
  elementId: string,
  systemId: string
): GraphEdge {
  return {
    id: `edge-belongs-${elementId}-${systemId}`,
    source: elementId,
    target: systemId,
    type: 'BELONGS_TO_SYSTEM'
  };
}

/**
 * Generate a SERVES edge (MEPElement -> Space)
 */
function generateServesEdge(elementId: string, spaceId: string): GraphEdge {
  return {
    id: `edge-serves-${elementId}-${spaceId}`,
    source: elementId,
    target: spaceId,
    type: 'SERVES'
  };
}


// ============================================================================
// Scenario Generators
// ============================================================================

/**
 * Generate a simple building scenario
 * - 3 floors, each with 3 spaces
 * - Basic spatial relationships (ON_LEVEL, ADJACENT_TO)
 */
export function generateSimpleBuilding(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const floors = 3;
  const spacesPerFloor = 3;
  
  // Generate floors
  for (let f = 1; f <= floors; f++) {
    const storeyNode = generateStoreyNode(f);
    nodes.push(storeyNode);
    
    // Generate spaces for each floor
    const spaceTypes: (keyof typeof SPACE_LABELS)[] = ['office', 'corridor', 'utility'];
    const floorSpaces: GraphNode[] = [];
    
    for (let s = 0; s < spacesPerFloor; s++) {
      const spaceNode = generateSpaceNode(f, s, spaceTypes[s % spaceTypes.length]);
      nodes.push(spaceNode);
      floorSpaces.push(spaceNode);
      
      // ON_LEVEL relationship
      edges.push(generateOnLevelEdge(spaceNode.id, storeyNode.id));
    }
    
    // ADJACENT_TO relationships (connect adjacent spaces on same floor)
    for (let i = 0; i < floorSpaces.length - 1; i++) {
      edges.push(generateAdjacentEdge(floorSpaces[i].id, floorSpaces[i + 1].id));
    }
    
    // CONNECTS_TO for corridor (corridor connects to all other spaces)
    const corridorSpace = floorSpaces.find(s => s.properties.category === 'corridor');
    if (corridorSpace) {
      floorSpaces
        .filter(s => s.id !== corridorSpace.id)
        .forEach(s => {
          edges.push(generateConnectsEdge(corridorSpace.id, s.id, '门洞'));
        });
    }
  }
  
  const relationshipTypes = [...new Set(edges.map(e => e.type))];
  
  return {
    nodes,
    edges,
    metadata: {
      scenario: 'simple-building',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      relationshipTypes
    }
  };
}


/**
 * Generate an MEP system scenario
 * - Includes pipes, ducts, and cable trays
 * - Shows CROSSES relationships (elements crossing spaces)
 * - Shows BELONGS_TO_SYSTEM relationships
 */
export function generateMEPSystem(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // First generate a simple building as base
  const building = generateSimpleBuilding();
  nodes.push(...building.nodes);
  edges.push(...building.edges);
  
  // Get all space nodes
  const spaceNodes = nodes.filter(n => n.type === 'Space');
  
  // Generate MEP systems
  const hvacSystem = generateMEPSystemNode('hvac', 0);
  const electricalSystem = generateMEPSystemNode('electrical', 0);
  const plumbingSystem = generateMEPSystemNode('plumbing', 0);
  nodes.push(hvacSystem, electricalSystem, plumbingSystem);
  
  // Generate MEP elements for each floor
  for (let f = 1; f <= 3; f++) {
    // Duct (HVAC)
    const duct = generateMEPElementNode('duct', f - 1, f);
    nodes.push(duct);
    edges.push(generateBelongsToSystemEdge(duct.id, hvacSystem.id));
    
    // Pipe (Plumbing)
    const pipe = generateMEPElementNode('pipe', f - 1, f);
    nodes.push(pipe);
    edges.push(generateBelongsToSystemEdge(pipe.id, plumbingSystem.id));
    
    // Cable tray (Electrical)
    const cable = generateMEPElementNode('cable', f - 1, f);
    nodes.push(cable);
    edges.push(generateBelongsToSystemEdge(cable.id, electricalSystem.id));
    
    // CROSSES relationships - elements cross through spaces
    const floorSpaces = spaceNodes.filter(
      s => s.properties.levelCode === `${f}F`
    );
    
    // Duct crosses corridor and utility room
    floorSpaces
      .filter(s => ['corridor', 'utility'].includes(s.properties.category || ''))
      .forEach(space => {
        edges.push(generateCrossesEdge(duct.id, space.id));
      });
    
    // Pipe crosses utility room
    floorSpaces
      .filter(s => s.properties.category === 'utility')
      .forEach(space => {
        edges.push(generateCrossesEdge(pipe.id, space.id));
      });
    
    // Cable tray crosses all spaces
    floorSpaces.forEach(space => {
      edges.push(generateCrossesEdge(cable.id, space.id));
    });
    
    // SERVES relationships - elements serve spaces
    floorSpaces
      .filter(s => s.properties.category === 'office')
      .forEach(space => {
        edges.push(generateServesEdge(duct.id, space.id));
      });
  }
  
  const relationshipTypes = [...new Set(edges.map(e => e.type))];
  
  return {
    nodes,
    edges,
    metadata: {
      scenario: 'mep-system',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      relationshipTypes
    }
  };
}


/**
 * Generate a path-finding scenario
 * - Focuses on connectivity between spaces
 * - Includes RouteNode for path visualization
 */
export function generatePathFinding(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Generate 2 floors with more spaces for path finding
  for (let f = 1; f <= 2; f++) {
    const storeyNode = generateStoreyNode(f);
    nodes.push(storeyNode);
    
    // Generate 5 spaces per floor in a grid pattern
    const spaceTypes: (keyof typeof SPACE_LABELS)[] = [
      'public', 'corridor', 'office', 'office', 'service'
    ];
    const floorSpaces: GraphNode[] = [];
    
    for (let s = 0; s < 5; s++) {
      const spaceNode = generateSpaceNode(f, s, spaceTypes[s]);
      nodes.push(spaceNode);
      floorSpaces.push(spaceNode);
      edges.push(generateOnLevelEdge(spaceNode.id, storeyNode.id));
    }
    
    // Create connectivity pattern:
    // [0:public] -- [1:corridor] -- [2:office]
    //                    |
    //              [3:office] -- [4:service]
    edges.push(generateConnectsEdge(floorSpaces[0].id, floorSpaces[1].id, '门洞'));
    edges.push(generateConnectsEdge(floorSpaces[1].id, floorSpaces[2].id, '门洞'));
    edges.push(generateConnectsEdge(floorSpaces[1].id, floorSpaces[3].id, '门洞'));
    edges.push(generateConnectsEdge(floorSpaces[3].id, floorSpaces[4].id, '门洞'));
    
    // Adjacent relationships
    edges.push(generateAdjacentEdge(floorSpaces[0].id, floorSpaces[1].id));
    edges.push(generateAdjacentEdge(floorSpaces[1].id, floorSpaces[2].id));
    edges.push(generateAdjacentEdge(floorSpaces[1].id, floorSpaces[3].id));
    edges.push(generateAdjacentEdge(floorSpaces[3].id, floorSpaces[4].id));
  }
  
  // Add vertical connection (staircase) between floors
  const floor1Corridor = nodes.find(
    n => n.type === 'Space' && 
    n.properties.levelCode === '1F' && 
    n.properties.category === 'corridor'
  );
  const floor2Corridor = nodes.find(
    n => n.type === 'Space' && 
    n.properties.levelCode === '2F' && 
    n.properties.category === 'corridor'
  );
  
  if (floor1Corridor && floor2Corridor) {
    edges.push(generateConnectsEdge(floor1Corridor.id, floor2Corridor.id, '楼梯'));
  }
  
  const relationshipTypes = [...new Set(edges.map(e => e.type))];
  
  return {
    nodes,
    edges,
    metadata: {
      scenario: 'path-finding',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      relationshipTypes
    }
  };
}


/**
 * Generate a full building scenario
 * - Combines all relationship types
 * - More comprehensive data for testing
 */
export function generateFullBuilding(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const floors = 3;
  const spacesPerFloor = 5;
  
  // Generate MEP systems first
  const systems = [
    generateMEPSystemNode('hvac', 0),
    generateMEPSystemNode('hvac', 1),
    generateMEPSystemNode('electrical', 0),
    generateMEPSystemNode('plumbing', 0),
    generateMEPSystemNode('plumbing', 1)
  ];
  nodes.push(...systems);
  
  // Generate floors and spaces
  for (let f = 1; f <= floors; f++) {
    const storeyNode = generateStoreyNode(f);
    nodes.push(storeyNode);
    
    const spaceTypes: (keyof typeof SPACE_LABELS)[] = [
      'public', 'corridor', 'office', 'utility', 'service'
    ];
    const floorSpaces: GraphNode[] = [];
    
    for (let s = 0; s < spacesPerFloor; s++) {
      const spaceNode = generateSpaceNode(f, s, spaceTypes[s]);
      nodes.push(spaceNode);
      floorSpaces.push(spaceNode);
      edges.push(generateOnLevelEdge(spaceNode.id, storeyNode.id));
    }
    
    // Connectivity pattern
    const corridor = floorSpaces[1];
    floorSpaces.forEach((space, i) => {
      if (i !== 1) {
        edges.push(generateConnectsEdge(corridor.id, space.id, '门洞'));
        edges.push(generateAdjacentEdge(corridor.id, space.id));
      }
    });
    
    // Additional adjacencies
    edges.push(generateAdjacentEdge(floorSpaces[0].id, floorSpaces[2].id));
    edges.push(generateAdjacentEdge(floorSpaces[3].id, floorSpaces[4].id));
    
    // Generate MEP elements
    const mepTypes: (keyof typeof MEP_LABELS)[] = ['duct', 'pipe', 'cable'];
    mepTypes.forEach((mepType, i) => {
      const element = generateMEPElementNode(mepType, f * 3 + i, f);
      nodes.push(element);
      
      // Assign to system
      const systemIndex = mepType === 'duct' ? 0 : mepType === 'pipe' ? 3 : 2;
      edges.push(generateBelongsToSystemEdge(element.id, systems[systemIndex].id));
      
      // CROSSES relationships
      const crossSpaces = floorSpaces.filter(s => 
        ['corridor', 'utility'].includes(s.properties.category || '')
      );
      crossSpaces.forEach(space => {
        edges.push(generateCrossesEdge(element.id, space.id));
      });
      
      // SERVES relationships
      const serveSpaces = floorSpaces.filter(s => 
        ['office', 'public'].includes(s.properties.category || '')
      );
      serveSpaces.forEach(space => {
        edges.push(generateServesEdge(element.id, space.id));
      });
    });
  }
  
  // Vertical connections between floors
  for (let f = 1; f < floors; f++) {
    const lowerCorridor = nodes.find(
      n => n.type === 'Space' && 
      n.properties.levelCode === `${f}F` && 
      n.properties.category === 'corridor'
    );
    const upperCorridor = nodes.find(
      n => n.type === 'Space' && 
      n.properties.levelCode === `${f + 1}F` && 
      n.properties.category === 'corridor'
    );
    
    if (lowerCorridor && upperCorridor) {
      edges.push(generateConnectsEdge(lowerCorridor.id, upperCorridor.id, '楼梯'));
    }
  }
  
  const relationshipTypes = [...new Set(edges.map(e => e.type))];
  
  return {
    nodes,
    edges,
    metadata: {
      scenario: 'full-building',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      relationshipTypes
    }
  };
}


// ============================================================================
// Data Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate graph data for consistency
 */
export function validateGraphData(data: GraphData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check node ID uniqueness
  const nodeIds = new Set<string>();
  data.nodes.forEach(node => {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIds.add(node.id);
  });
  
  // Check edge ID uniqueness
  const edgeIds = new Set<string>();
  data.edges.forEach(edge => {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);
  });
  
  // Check edge source/target validity
  data.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
    }
  });
  
  // Check for orphan nodes (nodes with no edges)
  const connectedNodes = new Set<string>();
  data.edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  data.nodes.forEach(node => {
    if (!connectedNodes.has(node.id)) {
      warnings.push(`Orphan node (no edges): ${node.id}`);
    }
  });
  
  // Check node type validity
  const validNodeTypes: NodeType[] = ['Space', 'MEPElement', 'MEPSystem', 'Storey', 'RouteNode'];
  data.nodes.forEach(node => {
    if (!validNodeTypes.includes(node.type)) {
      errors.push(`Invalid node type: ${node.type} for node ${node.id}`);
    }
  });
  
  // Check edge type validity
  const validEdgeTypes: EdgeType[] = [
    'ON_LEVEL', 'ADJACENT_TO', 'CONNECTS_TO', 'CROSSES',
    'BELONGS_TO_SYSTEM', 'SERVES', 'IN_BUILDING', 'IN_ZONE'
  ];
  data.edges.forEach(edge => {
    if (!validEdgeTypes.includes(edge.type)) {
      errors.push(`Invalid edge type: ${edge.type} for edge ${edge.id}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}


// ============================================================================
// Main API
// ============================================================================

/**
 * Generate graph data for a specific scenario
 */
export function generateScenario(scenario: ScenarioType): GraphData {
  switch (scenario) {
    case 'simple-building':
      return generateSimpleBuilding();
    case 'mep-system':
      return generateMEPSystem();
    case 'path-finding':
      return generatePathFinding();
    case 'full-building':
      return generateFullBuilding();
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

/**
 * Get all available scenarios
 */
export function getAvailableScenarios(): { id: ScenarioType; name: string; description: string }[] {
  return [
    {
      id: 'simple-building',
      name: '简单建筑',
      description: '3层建筑，每层3个空间，展示基本空间关系'
    },
    {
      id: 'mep-system',
      name: '机电系统',
      description: '包含管线穿越和系统归属关系'
    },
    {
      id: 'path-finding',
      name: '路径查找',
      description: '展示空间连通性，适合路径规划演示'
    },
    {
      id: 'full-building',
      name: '完整建筑',
      description: '包含所有关系类型的综合场景'
    }
  ];
}

/**
 * Get nodes by type
 */
export function getNodesByType(data: GraphData, type: NodeType): GraphNode[] {
  return data.nodes.filter(node => node.type === type);
}

/**
 * Get edges by type
 */
export function getEdgesByType(data: GraphData, type: EdgeType): GraphEdge[] {
  return data.edges.filter(edge => edge.type === type);
}

/**
 * Get neighbors of a node
 */
export function getNeighbors(data: GraphData, nodeId: string): GraphNode[] {
  const neighborIds = new Set<string>();
  
  data.edges.forEach(edge => {
    if (edge.source === nodeId) {
      neighborIds.add(edge.target);
    }
    if (edge.target === nodeId) {
      neighborIds.add(edge.source);
    }
  });
  
  return data.nodes.filter(node => neighborIds.has(node.id));
}

/**
 * Get edges connected to a node
 */
export function getConnectedEdges(data: GraphData, nodeId: string): GraphEdge[] {
  return data.edges.filter(
    edge => edge.source === nodeId || edge.target === nodeId
  );
}

/**
 * Filter graph data by floor
 */
export function filterByFloor(data: GraphData, levelCode: string): GraphData {
  // Get nodes on this floor
  const floorNodes = data.nodes.filter(node => {
    if (node.type === 'Storey') {
      return node.properties.levelCode === levelCode;
    }
    if (node.type === 'Space' || node.type === 'MEPElement') {
      return node.properties.levelCode === levelCode;
    }
    // Include systems (they span all floors)
    if (node.type === 'MEPSystem') {
      return true;
    }
    return false;
  });
  
  const nodeIds = new Set(floorNodes.map(n => n.id));
  
  // Get edges between these nodes
  const floorEdges = data.edges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
  
  return {
    nodes: floorNodes,
    edges: floorEdges,
    metadata: {
      scenario: `${data.metadata.scenario}-${levelCode}`,
      nodeCount: floorNodes.length,
      edgeCount: floorEdges.length,
      relationshipTypes: [...new Set(floorEdges.map(e => e.type))]
    }
  };
}
