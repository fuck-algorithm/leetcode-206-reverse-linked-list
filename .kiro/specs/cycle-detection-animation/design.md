# Design Document: Cycle Detection Animation

## Overview

本设计文档描述链表环检测（Floyd's Tortoise and Hare）算法动画演示功能的技术实现方案。该功能将集成到现有的算法动画演示工具中，复用现有的动画控制系统、Redux 状态管理和 D3.js 渲染框架。

核心设计目标：
- 清晰展示快慢指针的移动轨迹和相遇过程
- 支持带环和无环链表的对比演示
- 提供环形布局以直观展示环结构
- 与现有代码架构保持一致性

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx (Router)                          │
├─────────────────────────────────────────────────────────────────┤
│  /iterative  │  /recursive  │  /cycle-detection (NEW)           │
├──────────────┴───────────────┴──────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CycleDetectionPage.tsx (NEW)                 │   │
│  │  ┌─────────────────┐  ┌────────────────────────────────┐ │   │
│  │  │  ControlPanel   │  │     CycleDetectionCanvas       │ │   │
│  │  │  (reused)       │  │     (NEW - D3.js rendering)    │ │   │
│  │  │  + CycleConfig  │  │                                │ │   │
│  │  └─────────────────┘  └────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              JavaCodeViewer (reused)                 │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     Redux Store (animationSlice)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  cyclePointers: { fast, slow }                             │ │
│  │  cycleConfig: { entryPoint, nodeCount }                    │ │
│  │  currentNodeData, currentStep, isPlaying, etc.             │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Algorithm Layer                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CycleDetection.ts (NEW)                                   │ │
│  │  - generateCycleDetectionEvents()                          │ │
│  │  - hasCycle()                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Data Generation Layer                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  dataGenerator.ts (EXTENDED)                               │ │
│  │  - generateCyclicLinkedList()                              │ │
│  │  - calculateCyclicLayout()                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. CycleDetectionPage Component

页面组件，组合画布、控制面板和代码查看器。

```typescript
// src/pages/CycleDetectionPage.tsx
interface CycleDetectionPageProps {}

const CycleDetectionPage: React.FC<CycleDetectionPageProps> = () => {
  // 使用 AnimationControllerContext 管理动画
  // 渲染 CycleDetectionCanvas, ControlPanel, JavaCodeViewer
}
```

### 2. CycleDetectionCanvas Component

画布组件，负责渲染带环链表和快慢指针。

```typescript
// src/components/CycleDetectionCanvas.tsx
interface CycleDetectionCanvasProps {}

// 核心渲染函数
- renderCyclicLayout(): 计算并渲染环形布局
- renderPointerLabels(): 渲染 fast/slow 指针标签
- renderCycleConnection(): 渲染环连接（尾节点到环入口）
- renderMeetingAnimation(): 渲染相遇动画效果
- renderStatePanel(): 渲染变量状态面板
```

### 3. CycleDetection Algorithm Module

算法模块，生成动画事件序列。

```typescript
// src/algorithms/CycleDetection.ts

// 动画事件类型
type CycleEventType = 
  | 'INITIALIZE'           // 初始化 fast=head, slow=head
  | 'SLOW_MOVE'            // slow = slow.next
  | 'FAST_MOVE_FIRST'      // fast = fast.next (第一步)
  | 'FAST_MOVE_SECOND'     // fast = fast.next (第二步)
  | 'COMPARE_POINTERS'     // 比较 fast == slow
  | 'CYCLE_DETECTED'       // 检测到环
  | 'CHECK_NULL'           // 检查 fast/fast.next 是否为 null
  | 'NO_CYCLE'             // 无环，算法结束

interface CycleAnimationEvent {
  type: CycleEventType;
  data: {
    nodes: ListNodeData[];
    cyclePointers: {
      fast: number | null;
      slow: number | null;
    };
    meetingPoint?: number | null;
    description: string;
  };
  timestamp: number;
}

// 主函数
function generateCycleDetectionEvents(
  nodes: ListNodeData[],
  cycleEntryIndex: number | null
): CycleAnimationEvent[];
```

### 4. Extended Data Generator

扩展数据生成器，支持带环链表。

```typescript
// src/utils/dataGenerator.ts (扩展)

interface CyclicListConfig {
  nodeCount: number;        // 节点数量 (3-10)
  cycleEntryIndex: number | null;  // 环入口索引，null 表示无环
}

interface CyclicListResult {
  nodes: ListNodeData[];
  cycleEntryId: number | null;
}

function generateCyclicLinkedList(config: CyclicListConfig): CyclicListResult;

// 计算环形布局位置
function calculateCyclicLayout(
  nodes: ListNodeData[],
  cycleEntryIndex: number | null,
  canvasSize: { width: number; height: number }
): Map<number, { x: number; y: number }>;
```

### 5. Extended Redux State

扩展 Redux 状态以支持环检测。

```typescript
// src/store/animationSlice.ts (扩展)

interface AnimationState {
  // 现有字段...
  
  // 新增字段
  cyclePointers: {
    fast: number | null;
    slow: number | null;
  };
  cycleConfig: {
    entryPoint: number | null;  // 环入口索引
    nodeCount: number;          // 节点数量
  };
  meetingPoint: number | null;  // 相遇点
  cycleDetected: boolean;       // 是否检测到环
}
```

## Data Models

### ListNodeData (Extended)

```typescript
interface ListNodeData {
  id: number;
  value: number;
  next: number | null;
  position?: { x: number; y: number };
  isActive?: boolean;
  isHighlighted?: boolean;
  color?: string;
  
  // 新增字段
  isCycleEntry?: boolean;    // 是否为环入口节点
  isInCycle?: boolean;       // 是否在环内
}
```

### CycleAnimationEvent

```typescript
interface CycleAnimationEvent {
  type: CycleEventType;
  data: {
    nodes: ListNodeData[];
    cyclePointers: {
      fast: number | null;
      slow: number | null;
    };
    meetingPoint?: number | null;
    description: string;
  };
  timestamp: number;
}
```

### CyclicLayoutConfig

```typescript
interface CyclicLayoutConfig {
  // 直线部分（环外）
  linearStartX: number;
  linearY: number;
  nodeSpacing: number;
  
  // 环形部分
  cycleCenter: { x: number; y: number };
  cycleRadius: number;
  cycleStartAngle: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cycle Configuration Correctness

*For any* valid cycle entry index in range [0, nodeCount-1], the generated linked list's tail node SHALL have its `next` pointer pointing to the node at that index, forming a cycle.

**Validates: Requirements 1.1, 1.2**

### Property 2: Node Count Bounds

*For any* node count value, the Data_Generator SHALL only accept values in the range [3, 10] inclusive. Values outside this range SHALL be rejected or clamped.

**Validates: Requirements 1.4**

### Property 3: Cyclic Layout Geometry

*For any* cyclic linked list with n nodes in the cycle portion, the calculated positions for cycle nodes SHALL be equidistant from a common center point (forming a circular arrangement).

**Validates: Requirements 1.5**

### Property 4: Pointer Movement Invariant

*For any* single iteration of the cycle detection algorithm (excluding termination), the slow pointer SHALL advance exactly 1 node and the fast pointer SHALL advance exactly 2 nodes.

**Validates: Requirements 2.2**

### Property 5: Non-Cyclic Termination

*For any* non-cyclic linked list (cycle entry = null), the algorithm SHALL terminate with a NO_CYCLE event when fast pointer or fast.next becomes null.

**Validates: Requirements 2.3**

### Property 6: Cycle Detection Guarantee

*For any* cyclic linked list, the algorithm SHALL eventually produce a CYCLE_DETECTED event where fast pointer equals slow pointer at some node within the cycle.

**Validates: Requirements 2.4**

### Property 7: Event Description Completeness

*For any* animation event generated by the algorithm, the description field SHALL be non-empty and contain Chinese characters explaining the current step.

**Validates: Requirements 2.6**

### Property 8: Event-to-Code Line Mapping

*For any* animation event type, there SHALL exist a deterministic mapping to a specific line number in the Java code, and this mapping SHALL be consistent across all events of the same type.

**Validates: Requirements 5.5, 6.6**

### Property 9: Step Navigation Consistency

*For any* animation state with currentStep > 0, stepping backward then forward SHALL return to the same state. Similarly, stepping forward then backward SHALL return to the original state (when not at boundaries).

**Validates: Requirements 6.3, 6.4**

### Property 10: Animation Speed Bounds

*For any* speed value set by the user, the Animation_System SHALL clamp it to the range [0.5, 2.0].

**Validates: Requirements 6.7**

### Property 11: Configuration Change Reset

*For any* change to the cycle entry point configuration, the Animation_System SHALL reset currentStep to 0 and regenerate the linked list with the new configuration applied.

**Validates: Requirements 7.2**

## Error Handling

### Invalid Configuration Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Node count < 3 | Clamp to minimum value 3 |
| Node count > 10 | Clamp to maximum value 10 |
| Cycle entry index >= nodeCount | Clamp to nodeCount - 1 |
| Cycle entry index < -1 | Treat as -1 (no cycle) |

### Animation State Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Step backward at step 0 | No-op, remain at step 0 |
| Step forward at last step | No-op, remain at last step |
| Invalid event data | Skip event, log warning |

### Rendering Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Canvas size too small | Use minimum dimensions (600x300) |
| Node position collision | Apply automatic offset |
| Missing node data | Render placeholder with error indicator |

## Testing Strategy

### Unit Tests

Unit tests focus on specific examples and edge cases:

1. **Data Generator Tests**
   - Generate list with cycle at index 0 (cycle to head)
   - Generate list with cycle at last node (self-loop)
   - Generate list with no cycle (null entry)
   - Boundary node counts (3 and 10)

2. **Algorithm Tests**
   - Empty list handling
   - Single node with self-loop
   - Two nodes with cycle
   - Long list without cycle

3. **Layout Calculator Tests**
   - Verify cycle nodes form circle
   - Verify linear portion is horizontal
   - Verify no node overlap

### Property-Based Tests

Property-based tests use fast-check library to verify universal properties:

**Configuration**: Minimum 100 iterations per property test

**Test Annotations**: Each test tagged with `Feature: cycle-detection-animation, Property N: [property text]`

1. **Property 1 Test**: Generate random (nodeCount, cycleEntryIndex) pairs, verify tail.next points to correct node
2. **Property 4 Test**: Generate random lists, run one iteration, verify pointer movements
3. **Property 5 Test**: Generate random non-cyclic lists, verify NO_CYCLE termination
4. **Property 6 Test**: Generate random cyclic lists, verify CYCLE_DETECTED event occurs
5. **Property 7 Test**: Generate events for random lists, verify all descriptions non-empty and contain Chinese
6. **Property 9 Test**: Generate random animation states, verify step forward/backward round-trip

### Integration Tests

1. **Page Rendering**: Verify CycleDetectionPage renders all required components
2. **Navigation**: Verify routing to /cycle-detection works
3. **Animation Flow**: Verify play/pause/step controls update state correctly

