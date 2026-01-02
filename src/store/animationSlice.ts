import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnimationState, ListNodeData } from '../types';

// 初始状态
const initialState: AnimationState = {
  isPlaying: false,
  currentStep: 0,
  totalSteps: 0,
  currentNodeData: [],
  animationSpeed: 1,
  animationMethod: 'iterative',
  pointers: {
    prev: null,
    curr: null,
    next: null,
    newHead: null
  },
  callStack: [],
  stepDescription: '',
  currentEventType: '',
  // 环检测相关初始状态
  cyclePointers: {
    fast: null,
    slow: null
  },
  cycleConfig: {
    entryPoint: null,
    nodeCount: 5
  },
  meetingPoint: null,
  cycleDetected: false
};

// 创建动画状态切片
export const animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    startAnimation: (state: AnimationState) => {
      state.isPlaying = true;
    },
    pauseAnimation: (state: AnimationState) => {
      state.isPlaying = false;
    },
    stepForward: (state: AnimationState) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    stepBackward: (state: AnimationState) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    resetAnimation: (state: AnimationState) => {
      state.currentStep = 0;
      state.isPlaying = false;
      state.pointers = {
        prev: null,
        curr: null,
        next: null,
        newHead: null
      };
      state.callStack = [];
      state.stepDescription = '';
    },
    setAnimationSpeed: (state: AnimationState, action: PayloadAction<number>) => {
      state.animationSpeed = action.payload;
    },
    setAnimationMethod: (state: AnimationState, action: PayloadAction<'iterative' | 'recursive' | 'cycle-detection'>) => {
      state.animationMethod = action.payload;
      state.currentStep = 0;
      state.isPlaying = false;
      state.pointers = {
        prev: null,
        curr: null,
        next: null,
        newHead: null
      };
      state.callStack = [];
      // 重置环检测状态
      state.cyclePointers = {
        fast: null,
        slow: null
      };
      state.meetingPoint = null;
      state.cycleDetected = false;
    },
    setCurrentNodeData: (state: AnimationState, action: PayloadAction<ListNodeData[]>) => {
      state.currentNodeData = action.payload;
    },
    setTotalSteps: (state: AnimationState, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },
    setPointers: (state: AnimationState, action: PayloadAction<{
      prev?: number | null;
      curr?: number | null;
      next?: number | null;
      newHead?: number | null;
    }>) => {
      state.pointers = {
        ...state.pointers,
        ...action.payload
      };
    },
    pushCallStack: (state: AnimationState, action: PayloadAction<{ head: number | null }>) => {
      if (!state.callStack) {
        state.callStack = [];
      }
      state.callStack.push({
        params: action.payload,
        returnValue: null
      });
    },
    popCallStack: (state: AnimationState, action: PayloadAction<{ returnValue: number | null }>) => {
      if (state.callStack && state.callStack.length > 0) {
        const lastFrame = state.callStack.pop();
        if (lastFrame && state.callStack.length > 0) {
          const currentFrame = state.callStack[state.callStack.length - 1];
          currentFrame.returnValue = action.payload.returnValue;
        }
      }
    },
    setCallStack: (state: AnimationState, action: PayloadAction<Array<{ params: { head: number | null }; returnValue: number | null }>>) => {
      state.callStack = action.payload;
    },
    setStepDescription: (state: AnimationState, action: PayloadAction<string>) => {
      state.stepDescription = action.payload;
    },
    setCurrentEventType: (state: AnimationState, action: PayloadAction<string>) => {
      state.currentEventType = action.payload;
    },
    setCurrentStep: (state: AnimationState, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    // 环检测相关 reducers
    setCyclePointers: (state: AnimationState, action: PayloadAction<{
      fast?: number | null;
      slow?: number | null;
    }>) => {
      state.cyclePointers = {
        ...state.cyclePointers,
        ...action.payload
      };
    },
    setCycleConfig: (state: AnimationState, action: PayloadAction<{
      entryPoint?: number | null;
      nodeCount?: number;
    }>) => {
      state.cycleConfig = {
        ...state.cycleConfig,
        ...action.payload
      };
    },
    setMeetingPoint: (state: AnimationState, action: PayloadAction<number | null>) => {
      state.meetingPoint = action.payload;
    },
    setCycleDetected: (state: AnimationState, action: PayloadAction<boolean>) => {
      state.cycleDetected = action.payload;
    },
    resetCycleDetection: (state: AnimationState) => {
      state.currentStep = 0;
      state.isPlaying = false;
      state.cyclePointers = {
        fast: null,
        slow: null
      };
      state.meetingPoint = null;
      state.cycleDetected = false;
      state.stepDescription = '';
      state.currentEventType = '';
    }
  }
});

// 导出动作创建器
export const {
  startAnimation,
  pauseAnimation,
  stepForward,
  stepBackward,
  resetAnimation,
  setAnimationSpeed,
  setAnimationMethod,
  setCurrentNodeData,
  setTotalSteps,
  setPointers,
  pushCallStack,
  popCallStack,
  setCallStack,
  setStepDescription,
  setCurrentEventType,
  setCurrentStep,
  // 环检测相关
  setCyclePointers,
  setCycleConfig,
  setMeetingPoint,
  setCycleDetected,
  resetCycleDetection
} = animationSlice.actions;

// 导出reducer
export default animationSlice.reducer; 