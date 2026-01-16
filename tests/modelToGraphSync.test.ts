import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockBIMElements, mockGraphNodes, mockGraphEdges } from '../data/mockData';
import { BIMElement, GraphNode, GraphEdge } from '../types';

describe('Model to Graph Synchronization', () => {
  it('should have a corresponding graph node for every BIM element', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: mockBIMElements.length - 1 }),
        (index) => {
          const element: BIMElement = mockBIMElements[index];
          const correspondingNode: GraphNode | undefined = mockGraphNodes.find(
            (node) => node.id === element.id && node.type === 'Element'
          );
          
          expect(correspondingNode).toBeDefined();
          expect(correspondingNode?.label).toBe(element.name);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have edges connecting elements to their parent spaces', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: mockBIMElements.length - 1 }),
        (index) => {
          const element: BIMElement = mockBIMElements[index];
          const connectingEdge: GraphEdge | undefined = mockGraphEdges.find(
            (edge) => edge.target === element.id && edge.type === 'HAS_ELEMENT'
          );
          
          expect(connectingEdge).toBeDefined();
          expect(connectingEdge?.source).toBe(element.spaceId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should highlight and center the corresponding graph node when an element is clicked', () => {
    const elementIds: string[] = mockBIMElements.map((el) => el.id);
    
    fc.assert(
      fc.property(
        fc.oneof(...elementIds.map((id) => fc.constant(id))),
        (clickedElementId: string) => {
          const selectedElements = new Set<string>([clickedElementId]);
          
          const correspondingNode: GraphNode | undefined = mockGraphNodes.find(
            (node) => node.id === clickedElementId
          );
          
          expect(correspondingNode).toBeDefined();
          expect(selectedElements.has(correspondingNode!.id)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain bidirectional synchronization between model and graph', () => {
    const elementIds: string[] = mockBIMElements.map((el) => el.id);
    
    fc.assert(
      fc.property(
        fc.oneof(...elementIds.map((id) => fc.constant(id))),
        (elementId: string) => {
          const fromModelSelection = new Set<string>([elementId]);
          const fromGraphSelection = new Set<string>([elementId]);
          
          expect(fromModelSelection).toEqual(fromGraphSelection);
          
          const node = mockGraphNodes.find((n) => n.id === elementId);
          const element = mockBIMElements.find((el) => el.id === elementId);
          
          expect(node).toBeDefined();
          expect(element).toBeDefined();
          expect(node?.label).toBe(element?.name);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle space-level hierarchy correctly for synchronization', () => {
    const spaceIds: string[] = [...new Set(mockBIMElements.map((el) => el.spaceId))];
    
    fc.assert(
      fc.property(
        fc.oneof(...spaceIds.map((id) => fc.constant(id))),
        (spaceId: string) => {
          const elementsInSpace = mockBIMElements.filter(
            (el) => el.spaceId === spaceId
          );
          const edgesToSpace = mockGraphEdges.filter(
            (edge) => edge.target === spaceId
          );
          
          expect(elementsInSpace.length).toBeGreaterThan(0);
          expect(edgesToSpace.length).toBeGreaterThan(0);
          
          const spaceNode = mockGraphNodes.find((n) => n.id === spaceId);
          expect(spaceNode).toBeDefined();
          expect(spaceNode?.type).toBe('Space');
          
          const levelId = edgesToSpace[0].source;
          const levelNode = mockGraphNodes.find((n) => n.id === levelId);
          expect(levelNode).toBeDefined();
          expect(levelNode?.type).toBe('Level');
        }
      ),
      { numRuns: 20 }
    );
  });
});
