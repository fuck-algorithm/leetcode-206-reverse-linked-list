import { Dispatch } from 'redux';
import {
  setCurrentNodeData,
  setPointers,
  setTotalSteps,
  pauseAnimation,
  pushCallStack,
  popCallStack
} from '../store/animationSlice';
import { generateIterativeReverseEvents } from '../algorithms/IterativeReverse';
import { generateRecursiveReverseEvents } from '../algorithms/RecursiveReverse';
import { AnimationEvent, ListNodeData, AnimationState } from '../types';

/**
 * 动画控制器类
 */
export class AnimationController {
  private events: AnimationEvent[] = [];
  private animationInterval: number | null = null;
  private currentStepIndex = 0;
  private dispatch: Dispatch;

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /**
   * 加载链表数据并生成动画事件
   * @param nodes 链表节点数据
   */
  public loadData(nodes: ListNodeData[], animationMethod: 'iterative' | 'recursive'): void {
    
    // 根据选择的方法生成动画事件
    this.events = animationMethod === 'iterative'
      ? generateIterativeReverseEvents(nodes)
      : generateRecursiveReverseEvents(nodes);
    
    // 设置总步数
    this.dispatch(setTotalSteps(this.events.length - 1));
    
    // 初始化动画
    this.currentStepIndex = 0;
    this.applyEvent(this.events[0]);
  }

  /**
   * 开始动画播放
   */
  public startAnimation(animationSpeed: number): void {
    if (this.animationInterval !== null) {
      return;
    }
    
    // 计算动画间隔时间
    const intervalTime = Math.round(1000 / animationSpeed);
    
    this.animationInterval = window.setInterval(() => {
      this.stepForward();
      
      // 如果到达最后一步，停止动画
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
    }
  }

  /**
   * 后退一步
   */
  public stepBackward(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.applyEvent(this.events[this.currentStepIndex]);
    }
  }

  /**
   * 应用动画事件
   * @param event 动画事件
   */
  private applyEvent(event: AnimationEvent): void {
    const { data } = event;
    
    // 更新节点数据
    if (data.nodes) {
      this.dispatch(setCurrentNodeData(data.nodes));
    }
    
    // 更新指针
    if (data.pointers) {
      this.dispatch(setPointers(data.pointers));
    }
    
    // 处理调用栈相关事件
    if (event.type === 'RECURSIVE_CALL' && data.callStack) {
      // 递归调用时更新调用栈
      const latestFrame = data.callStack[data.callStack.length - 1];
      if (latestFrame && latestFrame.params) {
        this.dispatch(pushCallStack(latestFrame.params));
      }
    } else if (event.type === 'RECURSIVE_RETURN' && data.callStack) {
      // 递归返回时更新调用栈
      this.dispatch(popCallStack({ returnValue: data.pointers.newHead }));
    }
  }

  /**
   * 重置动画
   */
  public resetAnimation(): void {
    this.stopAnimation();
    this.currentStepIndex = 0;
    
    if (this.events.length > 0) {
      this.applyEvent(this.events[0]);
    }
  }

  /**
   * 更改播放速度
   * @param speed 播放速度
   * @param isPlaying 当前是否正在播放
   */
  public changeSpeed(speed: number, isPlaying: boolean): void {
    if (isPlaying) {
      // 如果正在播放，需要重新启动动画
      this.stopAnimation();
      this.startAnimation(speed);
    }
  }
} 