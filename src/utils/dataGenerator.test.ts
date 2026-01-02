import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateCyclicLinkedList,
  calculateCyclicLayout,
  arePositionsCircular,
  clampNodeCount,
  CYCLE_NODE_COUNT_MIN,
  CYCLE_NODE_COUNT_MAX
} from './dataGenerator';

/**
 * Feature: cycle-detection-animation
 * Property 1: Cycle Configuration Correctness
 * Validates: Requirements 1.1, 1.2
 * 
 * For any valid cycle entry index in range [0, nodeCount-1], 
 * the generated linked list's tail node SHALL have its `next` pointer 
 * pointing to the node at that index, forming a cycle.
 */
describe('Property 1: Cycle Configuration Correctness', () => {
  it('should create cycle with tail pointing to correct entry node', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }),
        (nodeCount, rawEntryIndex) => {
          // Ensure entry index is valid for this node count
          const cycleEntryIndex = Math.min(rawEntryIndex, nodeCount - 1);
          
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex
          });
          
          // Verify tail node's next points to cycle entry
          const tailNode = result.nodes[result.nodes.length - 1];
          const cycleEntryNode = result.nodes[cycleEntryIndex];
          
          expect(tailNode.next).toBe(cycleEntryNode.id);
          expect(result.cycleEntryId).toBe(cycleEntryNode.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should mark cycle entry node correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = Math.min(rawEntryIndex, nodeCount - 1);
          
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex
          });
          
          // Only the entry node should be marked as cycle entry
          result.nodes.forEach((node, index) => {
            if (index === cycleEntryIndex) {
              expect(node.isCycleEntry).toBe(true);
            } else {
              expect(node.isCycleEntry).toBe(false);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should mark nodes in cycle correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = Math.min(rawEntryIndex, nodeCount - 1);
          
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex
          });
          
          // Nodes at or after entry index should be in cycle
          result.nodes.forEach((node, index) => {
            if (index >= cycleEntryIndex) {
              expect(node.isInCycle).toBe(true);
            } else {
              expect(node.isInCycle).toBe(false);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 2: Node Count Bounds
 * Validates: Requirements 1.4
 * 
 * For any node count value, the Data_Generator SHALL only accept values 
 * in the range [3, 10] inclusive. Values outside this range SHALL be 
 * rejected or clamped.
 */
describe('Property 2: Node Count Bounds', () => {
  it('should clamp node count to valid range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        (rawNodeCount) => {
          const clamped = clampNodeCount(rawNodeCount);
          
          expect(clamped).toBeGreaterThanOrEqual(CYCLE_NODE_COUNT_MIN);
          expect(clamped).toBeLessThanOrEqual(CYCLE_NODE_COUNT_MAX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate list with clamped node count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        (rawNodeCount) => {
          const result = generateCyclicLinkedList({
            nodeCount: rawNodeCount,
            cycleEntryIndex: null
          });
          
          expect(result.nodes.length).toBeGreaterThanOrEqual(CYCLE_NODE_COUNT_MIN);
          expect(result.nodes.length).toBeLessThanOrEqual(CYCLE_NODE_COUNT_MAX);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Non-cyclic list test (edge case)
 * Validates: Requirements 1.3
 */
describe('Non-cyclic list generation', () => {
  it('should create non-cyclic list when entry is null', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 5,
      cycleEntryIndex: null
    });
    
    // Tail should point to null
    const tailNode = result.nodes[result.nodes.length - 1];
    expect(tailNode.next).toBeNull();
    expect(result.cycleEntryId).toBeNull();
    
    // No nodes should be marked as in cycle
    result.nodes.forEach(node => {
      expect(node.isCycleEntry).toBe(false);
      expect(node.isInCycle).toBe(false);
    });
  });

  it('should create non-cyclic list when entry is -1', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 5,
      cycleEntryIndex: -1
    });
    
    const tailNode = result.nodes[result.nodes.length - 1];
    expect(tailNode.next).toBeNull();
    expect(result.cycleEntryId).toBeNull();
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 3: Cyclic Layout Geometry
 * Validates: Requirements 1.5
 * 
 * For any cyclic linked list with n nodes in the cycle portion, 
 * the calculated positions for cycle nodes SHALL be equidistant 
 * from a common center point (forming a circular arrangement).
 */
describe('Property 3: Cyclic Layout Geometry', () => {
  it('should arrange cycle nodes in circular pattern', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = Math.min(rawEntryIndex, nodeCount - 1);
          
          // Need at least 3 nodes in cycle for circular test
          if (nodeCount - cycleEntryIndex < 3) {
            return true; // Skip this case
          }
          
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex
          });
          
          const canvasSize = { width: 800, height: 400 };
          const positions = calculateCyclicLayout(result.nodes, cycleEntryIndex, canvasSize);
          
          // Extract cycle node positions
          const cyclePositions: Array<{ x: number; y: number }> = [];
          for (let i = cycleEntryIndex; i < nodeCount; i++) {
            const pos = positions.get(result.nodes[i].id);
            if (pos) {
              cyclePositions.push(pos);
            }
          }
          
          // Verify circular arrangement
          expect(arePositionsCircular(cyclePositions, 2)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should arrange linear nodes horizontally', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.integer({ min: 1, max: CYCLE_NODE_COUNT_MAX - 1 }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = Math.min(rawEntryIndex, nodeCount - 1);
          
          // Need at least 2 linear nodes
          if (cycleEntryIndex < 2) {
            return true; // Skip this case
          }
          
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex
          });
          
          const canvasSize = { width: 800, height: 400 };
          const positions = calculateCyclicLayout(result.nodes, cycleEntryIndex, canvasSize);
          
          // Extract linear node positions
          const linearPositions: Array<{ x: number; y: number }> = [];
          for (let i = 0; i < cycleEntryIndex; i++) {
            const pos = positions.get(result.nodes[i].id);
            if (pos) {
              linearPositions.push(pos);
            }
          }
          
          // Verify horizontal alignment (same y coordinate)
          const firstY = linearPositions[0].y;
          linearPositions.forEach(pos => {
            expect(Math.abs(pos.y - firstY)).toBeLessThan(1);
          });
          
          // Verify left-to-right ordering
          for (let i = 1; i < linearPositions.length; i++) {
            expect(linearPositions[i].x).toBeGreaterThan(linearPositions[i - 1].x);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Edge case tests
 */
describe('Edge cases', () => {
  it('should handle cycle entry at index 0 (all nodes in cycle)', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 5,
      cycleEntryIndex: 0
    });
    
    // All nodes should be in cycle
    result.nodes.forEach(node => {
      expect(node.isInCycle).toBe(true);
    });
    
    // First node is cycle entry
    expect(result.nodes[0].isCycleEntry).toBe(true);
    
    // Tail points to head
    const tailNode = result.nodes[result.nodes.length - 1];
    expect(tailNode.next).toBe(result.nodes[0].id);
  });

  it('should handle cycle entry at last index (self-loop)', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 5,
      cycleEntryIndex: 4
    });
    
    // Only last node is in cycle
    const tailNode = result.nodes[result.nodes.length - 1];
    expect(tailNode.isCycleEntry).toBe(true);
    expect(tailNode.isInCycle).toBe(true);
    
    // Self-loop
    expect(tailNode.next).toBe(tailNode.id);
  });

  it('should handle minimum node count', () => {
    const result = generateCyclicLinkedList({
      nodeCount: CYCLE_NODE_COUNT_MIN,
      cycleEntryIndex: 0
    });
    
    expect(result.nodes.length).toBe(CYCLE_NODE_COUNT_MIN);
  });

  it('should handle maximum node count', () => {
    const result = generateCyclicLinkedList({
      nodeCount: CYCLE_NODE_COUNT_MAX,
      cycleEntryIndex: 5
    });
    
    expect(result.nodes.length).toBe(CYCLE_NODE_COUNT_MAX);
  });
});
