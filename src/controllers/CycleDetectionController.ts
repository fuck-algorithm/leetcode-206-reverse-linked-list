import { Dispatch } from 'redux';
import {
  setCurrentNodeData,
  setTotalSteps,
  startAnimation,
  pauseAnimation,
  stepForward,
  stepBackward,
  setStepDescription,
  setCurrentEventType,
  setCyclePointers,
  setCycleConfig,
  setMeetingPoint,
  setCycleDetected,
  resetCycleDetection,
  setAnimationSpeed
} from '../store/animationSlice';
import { generateCycleDetectionEvents } from '../algorithms/CycleDetection';
import { generateCyclicLinkedList } from '../utils/dataGenerator';
import { CycleAnimationEvent, CyclicListConfig } from '../types';

/**
 * 动画速度边界常量
 */
export const ANIMATION_SPEED_MIN = 0.5;
export const ANIMATION_SPEED_MAX = 2.0;

/**
 * 限制动画速度在有效范围内
 */
export const clampAnimationSpeed = (speed: number): number => {
  return Math.max(ANIMATION_SPEED_MIN, Math.min(ANIMATION_SPEED_MAX, speed));
};

/**
 * 环检测动画控制器类
 */
export class CycleDetectionController {
  private events: CycleAnimationEvent[] = [];
  private animationInterval: number | null = null;
  private currentStepIndex = 0;
  private dispatch: Dispatch;
  private currentConfig: CyclicListConfig = { nodeCount: 5, cycleEntryIndex: 2 };

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /**
   * 加载链表数据并生成动画事件
   */
  public loadData(config: CyclicListConfig): void {
    this.currentConfig = config;
    
    // 生成带环链表
    const result = generateCyclicLinkedList(config);
    
    // 更新配置到 Redux
    this.dispatch(setCycleConfig({
      entryPoint: config.cycleEntryIndex,
      nodeCount: config.nodeCount
    }));
    
    // 生成动画事件
    this.events = generateCycleDetectionEvents(result.nodes);
    
    // 设置总步数
    this.dispatch(setTotalSteps(this.events.length - 1));
    
    // 初始化动画
    this.currentStepIndex = 0;
    if (this.events.length > 0) {
      this.applyEvent(this.events[0]);
    }
  }

  /**
   * 更改环配置
   */
  public changeConfig(config: CyclicListConfig): void {
    this.stopAnimation();
    this.dispatch(resetCycleDetection());
    this.loadData(config);
  }

  /**
   * 开始动画播放
   */
  public startAnimation(animationSpeed: number): void {
    if (this.animationInterval !== null) {
      return;
    }
    
    this.dispatch(startAnimation());
    
    // 限制速度范围
    const clampedSpeed = clampAnimationSpeed(animationSpeed);
    const intervalTime = Math.round(1000 / clampedSpeed);
    
    this.animationInterval = window.setInterval(() => {
      this.stepForward();
      
      if (this.currentStepIndex >= this.events.length - 1) {
        this.stopAnimation();
      }
    }, intervalTime);
  }

  /**
   * 停止动画播放
   */
  public stopAnimation(): void {
    if (this.animationInterval !== null) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
      this.dispatch(pauseAnimation());
    }
  }

  /**
   * 前进一步
   */
  public stepForward(): void {
    if (this.currentStepIndex < this.events.length - 1) {
      this.currentStepIndex++;
      this.applyEvent(this.events[this.currentStepIndex]);
      this.dispatch(stepForward());
    }
  }

  /**
   * 后退一步
   */
  public stepBackward(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.applyEvent(this.events[this.currentStepIndex]);
      this.dispatch(stepBackward());
    }
  }

  /**
   * 应用动画事件
   */
  private applyEvent(event: CycleAnimationEvent): void {
    const { data, type } = event;
    
    // 更新当前事件类型
    this.dispatch(setCurrentEventType(type));
    
    // 更新节点数据
    if (data.nodes) {
      this.dispatch(setCurrentNodeData(data.nodes));
    }
    
    // 更新环检测指针
    if (data.cyclePointers) {
      this.dispatch(setCyclePointers(data.cyclePointers));
    }
    
    // 更新步骤描述
    if (data.description) {
      this.dispatch(setStepDescription(data.description));
    }
    
    // 更新相遇点
    if (data.meetingPoint !== undefined) {
      this.dispatch(setMeetingPoint(data.meetingPoint));
    }
    
    // 更新环检测状态
    if (type === 'CYCLE_DETECTED') {
      this.dispatch(setCycleDetected(true));
    } else if (type === 'NO_CYCLE') {
      this.dispatch(setCycleDetected(false));
    }
  }

  /**
   * 重置动画
   */
  public resetAnimation(): void {
    this.stopAnimation();
    this.currentStepIndex = 0;
    this.dispatch(resetCycleDetection());
    
    if (this.events.length > 0) {
      this.applyEvent(this.events[0]);
    }
  }

  /**
   * 更改播放速度
   */
  public changeSpeed(speed: number, isPlaying: boolean): void {
    const clampedSpeed = clampAnimationSpeed(speed);
    this.dispatch(setAnimationSpeed(clampedSpeed));
    
    if (isPlaying) {
      this.stopAnimation();
      this.startAnimation(clampedSpeed);
    }
  }

  /**
   * 跳转到指定步骤
   */
  public goToStep(step: number): void {
    if (step >= 0 && step < this.events.length) {
      this.currentStepIndex = step;
      this.applyEvent(this.events[step]);
    }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): CyclicListConfig {
    return this.currentConfig;
  }
}
