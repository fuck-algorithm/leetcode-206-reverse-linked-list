// 链表节点数据类型
export interface ListNodeData {
  id: number;
  value: number;
  next: number | null;
  position?: { x: number; y: number };
  isActive?: boolean;
  isHighlighted?: boolean;
  color?: string;
}

// 动画状态类型
export interface AnimationState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  currentNodeData: ListNodeData[];
  animationSpeed: number;
  animationMethod: 'iterative' | 'recursive';
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
}

// 动画控制操作类型
export type AnimationAction =
  | { type: 'START_ANIMATION' }
  | { type: 'PAUSE_ANIMATION' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET_ANIMATION' }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }
  | { type: 'SET_ANIMATION_METHOD'; payload: 'iterative' | 'recursive' }
  | { type: 'SET_CURRENT_NODE_DATA'; payload: ListNodeData[] }
  | { type: 'SET_POINTERS'; payload: { prev?: number | null; curr?: number | null; next?: number | null; newHead?: number | null } }
  | { type: 'PUSH_CALL_STACK'; payload: { head: number | null } }
  | { type: 'POP_CALL_STACK'; payload: { returnValue: number | null } };

// 动画阶段
export enum AnimationPhase {
  INITIALIZE = 'initialize',
  REVERSE = 'reverse',
  COMPLETE = 'complete',
}

// 动画事件类型
export interface AnimationEvent {
  type: string;
  data: any;
  timestamp: number;
} 