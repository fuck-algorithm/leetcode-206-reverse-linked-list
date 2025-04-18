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
  callStack: []
};

// 创建动画状态切片
export const animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    startAnimation: (state) => {
      state.isPlaying = true;
    },
    pauseAnimation: (state) => {
      state.isPlaying = false;
    },
    stepForward: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    stepBackward: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    resetAnimation: (state) => {
      state.currentStep = 0;
      state.isPlaying = false;
      state.pointers = {
        prev: null,
        curr: null,
        next: null,
        newHead: null
      };
      state.callStack = [];
    },
    setAnimationSpeed: (state, action: PayloadAction<number>) => {
      state.animationSpeed = action.payload;
    },
    setAnimationMethod: (state, action: PayloadAction<'iterative' | 'recursive'>) => {
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
    },
    setCurrentNodeData: (state, action: PayloadAction<ListNodeData[]>) => {
      state.currentNodeData = action.payload;
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },
    setPointers: (state, action: PayloadAction<{
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
    pushCallStack: (state, action: PayloadAction<{ head: number | null }>) => {
      if (!state.callStack) {
        state.callStack = [];
      }
      state.callStack.push({
        params: action.payload,
        returnValue: null
      });
    },
    popCallStack: (state, action: PayloadAction<{ returnValue: number | null }>) => {
      if (state.callStack && state.callStack.length > 0) {
        const lastFrame = state.callStack.pop();
        if (lastFrame && state.callStack.length > 0) {
          const currentFrame = state.callStack[state.callStack.length - 1];
          currentFrame.returnValue = action.payload.returnValue;
        }
      }
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
  popCallStack
} = animationSlice.actions;

// 导出reducer
export default animationSlice.reducer; 