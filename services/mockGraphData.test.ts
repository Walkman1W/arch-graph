/**
 * Unit tests for Mock Graph Data Generator
 */
import { describe, it, expect } from 'vitest';
import {
  generateSimpleBuilding,
  generateMEPSystem,
  generatePathFinding,
  generateFullBuilding,
  generateScenario,
  validateGraphData,
  getNodesByType,
  getEdgesByType,
  getNeighbors,
  getConnectedEdges,
  filterByFloor,
  getAvailableScenarios,
  GraphData,
  NodeType,
  EdgeType
} from './mockGraphData';

describe('Mock Graph Data Generator', () => {
  describe('generateSimpleBuilding', () => {
    it('should generate a valid graph with 3 floors', () => {
      const data = generateSimpleBuilding();
      
      expect(data.nodes.length).toBeGreaterThan(0);
      expect(data.edges.length).toBeGreaterThan(0);
      expect(data.metadata.scenario).toBe('simple-building');
    });

    it('should have 3 storey nodes', () => {
      const data = generateSimpleBuilding();
      const storeys = getNodesByType(data, 'Storey');
      
      expect(storeys.length).toBe(3);
    });

    it('should have 9 space nodes (3 per floor)', () => {
      const data = generateSimpleBuilding();
      const spaces = getNodesByType(data, 'Space');
      
      expect(spaces.length).toBe(9);
    });

    it('should have ON_LEVEL edges for all spaces', () => {
      const data = generateSimpleBuilding();
      const spaces = getNodesByType(data, 'Space');
      const onLevelEdges = getEdgesByType(data, 'ON_LEVEL');
      
      expect(onLevelEdges.length).toBe(spaces.length);
    });

    it('should pass validation', () => {
      const data = generateSimpleBuilding();
      const result = validateGraphData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });


  describe('generateMEPSystem', () => {
    it('should include MEP elements and systems', () => {
      const data = generateMEPSystem();
      
      const mepElements = getNodesByType(data, 'MEPElement');
      const mepSystems = getNodesByType(data, 'MEPSystem');
      
      expect(mepElements.length).toBeGreaterThan(0);
      expect(mepSystems.length).toBeGreaterThan(0);
    });

    it('should have BELONGS_TO_SYSTEM edges', () => {
      const data = generateMEPSystem();
      const belongsEdges = getEdgesByType(data, 'BELONGS_TO_SYSTEM');
      
      expect(belongsEdges.length).toBeGreaterThan(0);
    });

    it('should have CROSSES edges', () => {
      const data = generateMEPSystem();
      const crossesEdges = getEdgesByType(data, 'CROSSES');
      
      expect(crossesEdges.length).toBeGreaterThan(0);
    });

    it('should pass validation', () => {
      const data = generateMEPSystem();
      const result = validateGraphData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('generatePathFinding', () => {
    it('should have CONNECTS_TO edges for path finding', () => {
      const data = generatePathFinding();
      const connectsEdges = getEdgesByType(data, 'CONNECTS_TO');
      
      expect(connectsEdges.length).toBeGreaterThan(0);
    });

    it('should have vertical connection between floors', () => {
      const data = generatePathFinding();
      const connectsEdges = getEdgesByType(data, 'CONNECTS_TO');
      
      // Find edge with '楼梯' via property
      const stairEdge = connectsEdges.find(e => e.properties?.via === '楼梯');
      expect(stairEdge).toBeDefined();
    });

    it('should pass validation', () => {
      const data = generatePathFinding();
      const result = validateGraphData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('generateFullBuilding', () => {
    it('should include all node types', () => {
      const data = generateFullBuilding();
      
      const nodeTypes: NodeType[] = ['Space', 'MEPElement', 'MEPSystem', 'Storey'];
      nodeTypes.forEach(type => {
        const nodes = getNodesByType(data, type);
        expect(nodes.length).toBeGreaterThan(0);
      });
    });

    it('should include all core edge types', () => {
      const data = generateFullBuilding();
      
      const edgeTypes: EdgeType[] = [
        'ON_LEVEL', 'ADJACENT_TO', 'CONNECTS_TO', 
        'CROSSES', 'BELONGS_TO_SYSTEM', 'SERVES'
      ];
      edgeTypes.forEach(type => {
        const edges = getEdgesByType(data, type);
        expect(edges.length).toBeGreaterThan(0);
      });
    });

    it('should pass validation', () => {
      const data = generateFullBuilding();
      const result = validateGraphData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });


  describe('generateScenario', () => {
    it('should generate correct scenario by name', () => {
      const scenarios = getAvailableScenarios();
      
      scenarios.forEach(scenario => {
        const data = generateScenario(scenario.id);
        expect(data.metadata.scenario).toBe(scenario.id);
      });
    });

    it('should throw error for unknown scenario', () => {
      expect(() => generateScenario('unknown' as any)).toThrow();
    });
  });

  describe('validateGraphData', () => {
    it('should detect duplicate node IDs', () => {
      const data: GraphData = {
        nodes: [
          { id: 'node-1', type: 'Space', label: 'Test 1', properties: {} },
          { id: 'node-1', type: 'Space', label: 'Test 2', properties: {} }
        ],
        edges: [],
        metadata: { scenario: 'test', nodeCount: 2, edgeCount: 0, relationshipTypes: [] }
      };
      
      const result = validateGraphData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate node ID'))).toBe(true);
    });

    it('should detect invalid edge source', () => {
      const data: GraphData = {
        nodes: [
          { id: 'node-1', type: 'Space', label: 'Test', properties: {} }
        ],
        edges: [
          { id: 'edge-1', source: 'invalid', target: 'node-1', type: 'ADJACENT_TO' }
        ],
        metadata: { scenario: 'test', nodeCount: 1, edgeCount: 1, relationshipTypes: ['ADJACENT_TO'] }
      };
      
      const result = validateGraphData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid source'))).toBe(true);
    });

    it('should detect invalid edge target', () => {
      const data: GraphData = {
        nodes: [
          { id: 'node-1', type: 'Space', label: 'Test', properties: {} }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'invalid', type: 'ADJACENT_TO' }
        ],
        metadata: { scenario: 'test', nodeCount: 1, edgeCount: 1, relationshipTypes: ['ADJACENT_TO'] }
      };
      
      const result = validateGraphData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid target'))).toBe(true);
    });

    it('should warn about orphan nodes', () => {
      const data: GraphData = {
        nodes: [
          { id: 'node-1', type: 'Space', label: 'Test', properties: {} }
        ],
        edges: [],
        metadata: { scenario: 'test', nodeCount: 1, edgeCount: 0, relationshipTypes: [] }
      };
      
      const result = validateGraphData(data);
      expect(result.warnings.some(w => w.includes('Orphan node'))).toBe(true);
    });
  });


  describe('getNeighbors', () => {
    it('should return all neighbors of a node', () => {
      const data = generateSimpleBuilding();
      const spaces = getNodesByType(data, 'Space');
      const firstSpace = spaces[0];
      
      const neighbors = getNeighbors(data, firstSpace.id);
      expect(neighbors.length).toBeGreaterThan(0);
    });

    it('should return empty array for isolated node', () => {
      const data: GraphData = {
        nodes: [
          { id: 'node-1', type: 'Space', label: 'Test', properties: {} }
        ],
        edges: [],
        metadata: { scenario: 'test', nodeCount: 1, edgeCount: 0, relationshipTypes: [] }
      };
      
      const neighbors = getNeighbors(data, 'node-1');
      expect(neighbors.length).toBe(0);
    });
  });

  describe('getConnectedEdges', () => {
    it('should return all edges connected to a node', () => {
      const data = generateSimpleBuilding();
      const spaces = getNodesByType(data, 'Space');
      const firstSpace = spaces[0];
      
      const edges = getConnectedEdges(data, firstSpace.id);
      expect(edges.length).toBeGreaterThan(0);
    });
  });

  describe('filterByFloor', () => {
    it('should filter nodes by floor', () => {
      const data = generateFullBuilding();
      const floor1Data = filterByFloor(data, '1F');
      
      // All space nodes should be on 1F
      const spaces = getNodesByType(floor1Data, 'Space');
      spaces.forEach(space => {
        expect(space.properties.levelCode).toBe('1F');
      });
    });

    it('should include systems (they span all floors)', () => {
      const data = generateFullBuilding();
      const floor1Data = filterByFloor(data, '1F');
      
      const systems = getNodesByType(floor1Data, 'MEPSystem');
      expect(systems.length).toBeGreaterThan(0);
    });

    it('should only include edges between filtered nodes', () => {
      const data = generateFullBuilding();
      const floor1Data = filterByFloor(data, '1F');
      
      const nodeIds = new Set(floor1Data.nodes.map(n => n.id));
      floor1Data.edges.forEach(edge => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });
  });

  describe('getAvailableScenarios', () => {
    it('should return all 4 scenarios', () => {
      const scenarios = getAvailableScenarios();
      expect(scenarios.length).toBe(4);
    });

    it('should have id, name, and description for each scenario', () => {
      const scenarios = getAvailableScenarios();
      scenarios.forEach(scenario => {
        expect(scenario.id).toBeDefined();
        expect(scenario.name).toBeDefined();
        expect(scenario.description).toBeDefined();
      });
    });
  });

  describe('Node properties', () => {
    it('should have globalId for all nodes', () => {
      const data = generateFullBuilding();
      data.nodes.forEach(node => {
        expect(node.properties.globalId).toBeDefined();
        expect(node.properties.globalId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });
    });

    it('should have levelCode for Space and MEPElement nodes', () => {
      const data = generateFullBuilding();
      const spaces = getNodesByType(data, 'Space');
      const mepElements = getNodesByType(data, 'MEPElement');
      
      [...spaces, ...mepElements].forEach(node => {
        expect(node.properties.levelCode).toBeDefined();
        expect(node.properties.levelCode).toMatch(/^\d+F$/);
      });
    });

    it('should have systemCode for MEPSystem nodes', () => {
      const data = generateFullBuilding();
      const systems = getNodesByType(data, 'MEPSystem');
      
      systems.forEach(node => {
        expect(node.properties.systemCode).toBeDefined();
      });
    });

    it('should have bbox for Space nodes', () => {
      const data = generateFullBuilding();
      const spaces = getNodesByType(data, 'Space');
      
      spaces.forEach(node => {
        expect(node.properties.bbox).toBeDefined();
        expect(node.properties.bbox?.min).toBeDefined();
        expect(node.properties.bbox?.max).toBeDefined();
      });
    });
  });
});
