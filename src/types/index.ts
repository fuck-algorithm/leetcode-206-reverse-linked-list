// 链表节点数据类型
export interface ListNodeData {
  id: number;
  value: number;
  next: number | null;
  position?: { x: number; y: number };
  isActive?: boolean;
  isHighlighted?: boolean;
  color?: string;
  // 环检测相关字段
  isCycleEntry?: boolean;    // 是否为环入口节点
  isInCycle?: boolean;       // 是否在环内
}

// ==================== 环检测相关类型 ====================

// 环检测动画事件类型
export type CycleEventType =
  | 'CYCLE_INITIALIZE'       // 初始化 fast=head, slow=head
  | 'SLOW_MOVE'              // slow = slow.next
  | 'FAST_MOVE_FIRST'        // fast = fast.next (第一步)
  | 'FAST_MOVE_SECOND'       // fast = fast.next (第二步)
  | 'COMPARE_POINTERS'       // 比较 fast == slow
  | 'CYCLE_DETECTED'         // 检测到环
  | 'CHECK_NULL'             // 检查 fast/fast.next 是否为 null
  | 'NO_CYCLE';              // 无环，算法结束

// 环检测动画事件数据
export interface CycleAnimationEventData {
  nodes: ListNodeData[];
  cyclePointers: {
    fast: number | null;
    slow: number | null;
  };
  meetingPoint?: number | null;
  description: string;
}

// 环检测动画事件
export interface CycleAnimationEvent {
  type: CycleEventType;
  data: CycleAnimationEventData;
  timestamp: number;
}

// 带环链表配置
export interface CyclicListConfig {
  nodeCount: number;              // 节点数量 (3-10)
  cycleEntryIndex: number | null; // 环入口索引，null 表示无环
}

// 带环链表生成结果
export interface CyclicListResult {
  nodes: ListNodeData[];
  cycleEntryId: number | null;
}

// 动画状态类型
export interface AnimationState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  currentNodeData: ListNodeData[];
  animationSpeed: number;
  animationMethod: 'iterative' | 'recursive' | 'cycle-detection';
  pointers: {
    prev: number | null;
    curr: number | null;
    next: number | null;
    newHead: number | null;
  };
  callStack?: Array<{
    returnValue: number | null;
    params: {
      head: number | null;
    };
  }>;
  stepDescription?: string; // 当前步骤的文字说明
  currentEventType?: string; // 当前事件类型，用于代码行高亮
  // 环检测相关状态
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

// 动画控制操作类型
export type AnimationAction =
  | { type: 'START_ANIMATION' }
  | { type: 'PAUSE_ANIMATION' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET_ANIMATION' }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }
  | { type: 'SET_ANIMATION_METHOD'; payload: 'iterative' | 'recursive' | 'cycle-detection' }
  | { type: 'SET_CURRENT_NODE_DATA'; payload: ListNodeData[] }
  | { type: 'SET_POINTERS'; payload: { prev?: number | null; curr?: number | null; next?: number | null; newHead?: number | null } }
  | { type: 'PUSH_CALL_STACK'; payload: { head: number | null } }
  | { type: 'POP_CALL_STACK'; payload: { returnValue: number | null } }
  // 环检测相关操作
  | { type: 'SET_CYCLE_POINTERS'; payload: { fast?: number | null; slow?: number | null } }
  | { type: 'SET_CYCLE_CONFIG'; payload: { entryPoint?: number | null; nodeCount?: number } }
  | { type: 'SET_MEETING_POINT'; payload: number | null }
  | { type: 'SET_CYCLE_DETECTED'; payload: boolean };

// 动画阶段
export enum AnimationPhase {
  INITIALIZE = 'initialize',
  REVERSE = 'reverse',
  COMPLETE = 'complete',
}

// 动画事件数据类型
export interface AnimationEventData {
  nodes?: ListNodeData[];
  pointers?: {
    prev?: number | null;
    curr?: number | null;
    next?: number | null;
    newHead?: number | null;
  };
  callStack?: Array<{
    params: { head: number | null };
    returnValue: number | null;
  }>;
  description?: string;
  currentNode?: number | null;
  reversedNode?: number | null;
}

// 动画事件类型
export interface AnimationEvent {
  type: string;
  data: AnimationEventData;
  timestamp: number;
} 