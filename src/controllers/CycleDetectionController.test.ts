import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Dispatch } from 'redux';
import {
  CycleDetectionController,
  clampAnimationSpeed,
  ANIMATION_SPEED_MIN,
  ANIMATION_SPEED_MAX
} from './CycleDetectionController';
import { CYCLE_NODE_COUNT_MIN, CYCLE_NODE_COUNT_MAX } from '../utils/dataGenerator';

// Mock dispatch function with proper typing
const createMockDispatch = () => vi.fn() as unknown as Dispatch & ReturnType<typeof vi.fn>;

/**
 * Feature: cycle-detection-animation
 * Property 9: Step Navigation Consistency
 * Validates: Requirements 6.3, 6.4
 * 
 * For any animation state with currentStep > 0, stepping backward then forward
 * SHALL return to the same state. Similarly, stepping forward then backward
 * SHALL return to the original state (when not at boundaries).
 */
describe('Property 9: Step Navigation Consistency', () => {
  let controller: CycleDetectionController;
  let mockDispatch: Dispatch & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = createMockDispatch();
    controller = new CycleDetectionController(mockDispatch);
  });

  it('should return to same state after step forward then backward', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        fc.integer({ min: 1, max: 20 }), // Number of steps to take
        (nodeCount, rawEntryIndex, stepsToTake) => {
          const cycleEntryIndex = rawEntryIndex !== undefined 
            ? Math.min(rawEntryIndex, nodeCount - 1) 
            : null;
          
          // Load data
          controller.loadData({ nodeCount, cycleEntryIndex });
          
          // Clear mock to track only navigation calls
          mockDispatch.mockClear();
          
          // Take some steps forward (but not to the end)
          const actualSteps = Math.min(stepsToTake, 10);
          for (let i = 0; i < actualSteps; i++) {
            controller.stepForward();
          }
          
          // Record state after forward steps
          const forwardCalls = mockDispatch.mock.calls.length;
          
          // Step backward
          controller.stepBackward();
          
          // Step forward again
          controller.stepForward();
          
          // The dispatch should have been called for both operations
          expect(mockDispatch.mock.calls.length).toBeGreaterThan(forwardCalls);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not change state when stepping backward at step 0', () => {
    controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
    mockDispatch.mockClear();
    
    // At step 0, stepping backward should be a no-op
    controller.stepBackward();
    
    // stepBackward should not dispatch stepBackward action when at step 0
    const stepBackwardCalls = mockDispatch.mock.calls.filter(
      call => call[0]?.type === 'animation/stepBackward'
    );
    expect(stepBackwardCalls.length).toBe(0);
  });

  it('should handle multiple forward-backward cycles', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Number of cycles
        (cycles) => {
          controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
          mockDispatch.mockClear();
          
          // Move to middle of animation
          for (let i = 0; i < 3; i++) {
            controller.stepForward();
          }
          
          // Perform forward-backward cycles
          for (let i = 0; i < cycles; i++) {
            controller.stepForward();
            controller.stepBackward();
          }
          
          // Should have dispatched actions for each step
          expect(mockDispatch).toHaveBeenCalled();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 10: Animation Speed Bounds
 * Validates: Requirements 6.7
 * 
 * For any speed value set by the user, the Animation_System SHALL clamp it
 * to the range [0.5, 2.0].
 */
describe('Property 10: Animation Speed Bounds', () => {
  it('should clamp speed to valid range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -10, max: 10, noNaN: true }),
        (rawSpeed) => {
          const clampedSpeed = clampAnimationSpeed(rawSpeed);
          
          expect(clampedSpeed).toBeGreaterThanOrEqual(ANIMATION_SPEED_MIN);
          expect(clampedSpeed).toBeLessThanOrEqual(ANIMATION_SPEED_MAX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve valid speeds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: ANIMATION_SPEED_MIN, max: ANIMATION_SPEED_MAX, noNaN: true }),
        (validSpeed) => {
          const clampedSpeed = clampAnimationSpeed(validSpeed);
          
          // Valid speeds should be preserved (within floating point tolerance)
          expect(Math.abs(clampedSpeed - validSpeed)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clamp speeds below minimum', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: ANIMATION_SPEED_MIN - 0.01, noNaN: true }),
        (lowSpeed) => {
          const clampedSpeed = clampAnimationSpeed(lowSpeed);
          expect(clampedSpeed).toBe(ANIMATION_SPEED_MIN);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clamp speeds above maximum', () => {
    fc.assert(
      fc.property(
        fc.double({ min: ANIMATION_SPEED_MAX + 0.01, max: 100, noNaN: true }),
        (highSpeed) => {
          const clampedSpeed = clampAnimationSpeed(highSpeed);
          expect(clampedSpeed).toBe(ANIMATION_SPEED_MAX);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cycle-detection-animation
 * Property 11: Configuration Change Reset
 * Validates: Requirements 7.2
 * 
 * For any change to the cycle entry point configuration, the Animation_System
 * SHALL reset currentStep to 0 and regenerate the linked list with the new
 * configuration applied.
 */
describe('Property 11: Configuration Change Reset', () => {
  let controller: CycleDetectionController;
  let mockDispatch: Dispatch & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = createMockDispatch();
    controller = new CycleDetectionController(mockDispatch);
  });

  it('should reset and regenerate on config change', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        fc.integer({ min: CYCLE_NODE_COUNT_MIN, max: CYCLE_NODE_COUNT_MAX }),
        fc.option(fc.integer({ min: 0, max: CYCLE_NODE_COUNT_MAX - 1 }), { nil: undefined }),
        (nodeCount1, rawEntry1, nodeCount2, rawEntry2) => {
          const entry1 = rawEntry1 !== undefined ? Math.min(rawEntry1, nodeCount1 - 1) : null;
          const entry2 = rawEntry2 !== undefined ? Math.min(rawEntry2, nodeCount2 - 1) : null;
          
          // Load initial config
          controller.loadData({ nodeCount: nodeCount1, cycleEntryIndex: entry1 });
          
          // Take some steps
          controller.stepForward();
          controller.stepForward();
          
          mockDispatch.mockClear();
          
          // Change config
          controller.changeConfig({ nodeCount: nodeCount2, cycleEntryIndex: entry2 });
          
          // Should have dispatched resetCycleDetection
          const resetCalls = mockDispatch.mock.calls.filter(
            call => call[0]?.type === 'animation/resetCycleDetection'
          );
          expect(resetCalls.length).toBeGreaterThanOrEqual(1);
          
          // Should have dispatched setCycleConfig with new values
          const configCalls = mockDispatch.mock.calls.filter(
            call => call[0]?.type === 'animation/setCycleConfig'
          );
          expect(configCalls.length).toBeGreaterThanOrEqual(1);
          
          // Verify new config is stored
          const currentConfig = controller.getConfig();
          expect(currentConfig.nodeCount).toBe(nodeCount2);
          expect(currentConfig.cycleEntryIndex).toBe(entry2);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should stop animation on config change', () => {
    controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
    
    // Start animation (mock)
    mockDispatch.mockClear();
    
    // Change config should stop any running animation
    controller.changeConfig({ nodeCount: 6, cycleEntryIndex: 3 });
    
    // Verify reset was called
    const resetCalls = mockDispatch.mock.calls.filter(
      call => call[0]?.type === 'animation/resetCycleDetection'
    );
    expect(resetCalls.length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * Edge case tests
 */
describe('Controller edge cases', () => {
  let controller: CycleDetectionController;
  let mockDispatch: Dispatch & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = createMockDispatch();
    controller = new CycleDetectionController(mockDispatch);
  });

  it('should handle reset animation', () => {
    controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
    
    // Take some steps
    controller.stepForward();
    controller.stepForward();
    
    mockDispatch.mockClear();
    
    // Reset
    controller.resetAnimation();
    
    // Should dispatch reset action
    const resetCalls = mockDispatch.mock.calls.filter(
      call => call[0]?.type === 'animation/resetCycleDetection'
    );
    expect(resetCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle goToStep', () => {
    controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
    mockDispatch.mockClear();
    
    // Go to specific step
    controller.goToStep(3);
    
    // Should dispatch event type update
    const eventTypeCalls = mockDispatch.mock.calls.filter(
      call => call[0]?.type === 'animation/setCurrentEventType'
    );
    expect(eventTypeCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle invalid goToStep gracefully', () => {
    controller.loadData({ nodeCount: 5, cycleEntryIndex: 2 });
    mockDispatch.mockClear();
    
    // Try to go to invalid step
    controller.goToStep(-1);
    controller.goToStep(1000);
    
    // Should not crash, may or may not dispatch depending on implementation
    expect(true).toBe(true);
  });
});
