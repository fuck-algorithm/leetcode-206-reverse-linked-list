import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateCycleDetectionEvents,
  hasCycle,
  getCycleDetectionCodeLine,
  CYCLE_DETECTION_JAVA_CODE
} from './CycleDetection';
import {
  generateCyclicLinkedList,
  CYCLE_NODE_COUNT_MIN,
  CYCLE_NODE_COUNT_MAX
} from '../utils/dataGenerator';
import { CycleEventType } from '../types';

/**
 * Feature: cycle-detection-animation
 * Property 4: Pointer Movement Invariant
 * Validates: Requirements 2.2
 * 
 * For any single iteration of the cycle detection algorithm (excluding termination),
 * the slow pointer SHALL advance exactly 1 node and the fast pointer SHALL advance
 * exactly 2 nodes.
 */
describe('Property 4: Pointer Movement Invariant', () => {
  it('should move slow pointer 1 step and fast pointer 2 steps per iteration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = rawEntryIndex !== undefined 
            ? Math.min(rawEntryIndex, nodeCount - 1) 
            : null;
          
          const result = generateCyclicLinkedList({ nodeCount, cycleEntryIndex });
          const events = generateCycleDetectionEvents(result.nodes);
          
          // Build node map for position lookup
          const nodeMap = new Map<number, number>();
          result.nodes.forEach((node, index) => nodeMap.set(node.id, index));
          
          // Track pointer positions through events
          let slowPos = 0; // Start at head (index 0)
          let fastPos = 0;
          
          for (const event of events) {
            if (event.type === 'SLOW_MOVE') {
              // Slow should move exactly 1 step
              const newSlowId = event.data.cyclePointers.slow;
              if (newSlowId !== null) {
                const newSlowPos = nodeMap.get(newSlowId);
                if (newSlowPos !== undefined) {
                  // In a cycle, position might wrap around
                  // Just verify slow moved to next node
                  const currentNode = result.nodes[slowPos];
                  expect(currentNode.next).toBe(newSlowId);
                  slowPos = newSlowPos;
                }
              }
            }
            
            if (event.type === 'FAST_MOVE_FIRST') {
              // Fast first step
              const newFastId = event.data.cyclePointers.fast;
              if (newFastId !== null) {
                const currentNode = result.nodes[fastPos];
                expect(currentNode.next).toBe(newFastId);
                fastPos = nodeMap.get(newFastId) ?? fastPos;
              }
            }
            
            if (event.type === 'FAST_MOVE_SECOND') {
              // Fast second step
              const newFastId = event.data.cyclePointers.fast;
              if (newFastId !== null) {
                const currentNode = result.nodes[fastPos];
                expect(currentNode.next).toBe(newFastId);
                fastPos = nodeMap.get(newFastId) ?? fastPos;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 5: Non-Cyclic Termination
 * Validates: Requirements 2.3
 * 
 * For any non-cyclic linked list (cycle entry = null), the algorithm SHALL
 * terminate with a NO_CYCLE event when fast pointer or fast.next becomes null.
 */
describe('Property 5: Non-Cyclic Termination', () => {
  it('should terminate with NO_CYCLE for non-cyclic lists', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        (nodeCount) => {
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex: null // No cycle
          });
          
          const events = generateCycleDetectionEvents(result.nodes);
          
          // Last event should be NO_CYCLE
          const lastEvent = events[events.length - 1];
          expect(lastEvent.type).toBe('NO_CYCLE');
          
          // Should not have CYCLE_DETECTED event
          const hasCycleDetected = events.some(e => e.type === 'CYCLE_DETECTED');
          expect(hasCycleDetected).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have fast or fast.next as null when terminating', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        (nodeCount) => {
          const result = generateCyclicLinkedList({
            nodeCount,
            cycleEntryIndex: null
          });
          
          const events = generateCycleDetectionEvents(result.nodes);
          const lastEvent = events[events.length - 1];
          
          if (lastEvent.type === 'NO_CYCLE') {
            // Description should mention null
            expect(lastEvent.data.description).toMatch(/null/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 6: Cycle Detection Guarantee
 * Validates: Requirements 2.4
 * 
 * For any cyclic linked list, the algorithm SHALL eventually produce a
 * CYCLE_DETECTED event where fast pointer equals slow pointer at some
 * node within the cycle.
 */
describe('Property 6: Cycle Detection Guarantee', () => {
  it('should detect cycle in cyclic lists', () => {
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
          
          const events = generateCycleDetectionEvents(result.nodes);
          
          // Should have CYCLE_DETECTED event
          const cycleDetectedEvent = events.find(e => e.type === 'CYCLE_DETECTED');
          expect(cycleDetectedEvent).toBeDefined();
          
          // Should not have NO_CYCLE event
          const hasNoCycle = events.some(e => e.type === 'NO_CYCLE');
          expect(hasNoCycle).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have fast == slow at meeting point', () => {
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
          
          const events = generateCycleDetectionEvents(result.nodes);
          const cycleDetectedEvent = events.find(e => e.type === 'CYCLE_DETECTED');
          
          if (cycleDetectedEvent) {
            const { fast, slow } = cycleDetectedEvent.data.cyclePointers;
            expect(fast).toBe(slow);
            expect(cycleDetectedEvent.data.meetingPoint).toBe(fast);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should match hasCycle function result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = rawEntryIndex !== undefined 
            ? Math.min(rawEntryIndex, nodeCount - 1) 
            : null;
          
          const result = generateCyclicLinkedList({ nodeCount, cycleEntryIndex });
          const events = generateCycleDetectionEvents(result.nodes);
          
          const hasCycleResult = hasCycle(result.nodes[0].id, result.nodes);
          const eventHasCycle = events.some(e => e.type === 'CYCLE_DETECTED');
          
          expect(eventHasCycle).toBe(hasCycleResult);
          expect(hasCycleResult).toBe(cycleEntryIndex !== null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 7: Event Description Completeness
 * Validates: Requirements 2.6
 * 
 * For any animation event generated by the algorithm, the description field
 * SHALL be non-empty and contain Chinese characters explaining the current step.
 */
describe('Property 7: Event Description Completeness', () => {
  // Chinese character regex
  const chineseRegex = /[\u4e00-\u9fa5]/;

  it('should have non-empty descriptions with Chinese characters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = rawEntryIndex !== undefined 
            ? Math.min(rawEntryIndex, nodeCount - 1) 
            : null;
          
          const result = generateCyclicLinkedList({ nodeCount, cycleEntryIndex });
          const events = generateCycleDetectionEvents(result.nodes);
          
          events.forEach(event => {
            // Description should be non-empty
            expect(event.data.description).toBeTruthy();
            expect(event.data.description.length).toBeGreaterThan(0);
            
            // Description should contain Chinese characters
            expect(chineseRegex.test(event.data.description)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 8: Event-to-Code Line Mapping
 * Validates: Requirements 5.5, 6.6
 * 
 * For any animation event type, there SHALL exist a deterministic mapping
 * to a specific line number in the Java code, and this mapping SHALL be
 * consistent across all events of the same type.
 */
describe('Property 8: Event-to-Code Line Mapping', () => {
  const allEventTypes: CycleEventType[] = [
    'CYCLE_INITIALIZE',
    'CHECK_NULL',
    'SLOW_MOVE',
    'FAST_MOVE_FIRST',
    'FAST_MOVE_SECOND',
    'COMPARE_POINTERS',
    'CYCLE_DETECTED',
    'NO_CYCLE'
  ];

  it('should have deterministic line mapping for all event types', () => {
    allEventTypes.forEach(eventType => {
      const line1 = getCycleDetectionCodeLine(eventType);
      const line2 = getCycleDetectionCodeLine(eventType);
      
      // Same event type should always map to same line
      expect(line1).toBe(line2);
      
      // Line should be a valid positive number
      expect(line1).toBeGreaterThan(0);
    });
  });

  it('should map to valid lines within code', () => {
    const codeLines = CYCLE_DETECTION_JAVA_CODE.split('\n').length;
    
    allEventTypes.forEach(eventType => {
      const line = getCycleDetectionCodeLine(eventType);
      expect(line).toBeLessThanOrEqual(codeLines);
    });
  });

  it('should have consistent mapping across generated events', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        (nodeCount, rawEntryIndex) => {
          const cycleEntryIndex = rawEntryIndex !== undefined 
            ? Math.min(rawEntryIndex, nodeCount - 1) 
            : null;
          
          const result = generateCyclicLinkedList({ nodeCount, cycleEntryIndex });
          const events = generateCycleDetectionEvents(result.nodes);
          
          // Group events by type and verify consistent line mapping
          const typeToLines = new Map<string, Set<number>>();
          
          events.forEach(event => {
            const line = getCycleDetectionCodeLine(event.type);
            
            if (!typeToLines.has(event.type)) {
              typeToLines.set(event.type, new Set());
            }
            typeToLines.get(event.type)!.add(line);
          });
          
          // Each event type should map to exactly one line
          typeToLines.forEach((lines) => {
            expect(lines.size).toBe(1);
          });
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
  it('should handle empty node array', () => {
    const events = generateCycleDetectionEvents([]);
    expect(events).toHaveLength(0);
  });

  it('should handle single node without cycle', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 3,
      cycleEntryIndex: null
    });
    // Manually create single node
    const singleNode = [{ ...result.nodes[0], next: null }];
    
    const events = generateCycleDetectionEvents(singleNode);
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('NO_CYCLE');
  });

  it('should handle self-loop (single node cycle)', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 3,
      cycleEntryIndex: 2 // Last node points to itself
    });
    
    const events = generateCycleDetectionEvents(result.nodes);
    const cycleDetectedEvent = events.find(e => e.type === 'CYCLE_DETECTED');
    expect(cycleDetectedEvent).toBeDefined();
  });

  it('should start with CYCLE_INITIALIZE event', () => {
    const result = generateCyclicLinkedList({
      nodeCount: 5,
      cycleEntryIndex: 2
    });
    
    const events = generateCycleDetectionEvents(result.nodes);
    expect(events[0].type).toBe('CYCLE_INITIALIZE');
    expect(events[0].data.cyclePointers.fast).toBe(result.nodes[0].id);
    expect(events[0].data.cyclePointers.slow).toBe(result.nodes[0].id);
  });
});
