import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import AnimationCanvas from './AnimationCanvas';
import ControlPanel from './ControlPanel';
import { AnimationController } from '../controllers/AnimationController';
import { generateLinkedList } from '../utils/dataGenerator';
import {
  startAnimation,
  pauseAnimation,
  resetAnimation,
  setAnimationSpeed,
  setAnimationMethod
} from '../store/animationSlice';
import '../styles/LinkedListAnimation.css';

const LinkedListAnimation: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, animationSpeed, animationMethod } = useSelector(
    (state: RootState) => state.animation
  );
  
  // 创建动画控制器引用
  const controllerRef = useRef<AnimationController | null>(null);
  
  // 初始化动画控制器
  useEffect(() => {
    const getState = () => ({ animation: useSelector((state: RootState) => state.animation) });
    controllerRef.current = new AnimationController(dispatch, getState);
    
    // 加载示例数据
    const initialNodes = generateLinkedList(5);
    controllerRef.current.loadData(initialNodes);
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.stopAnimation();
      }
    };
  }, [dispatch]);
  
  // 监听播放状态变化
  useEffect(() => {
    if (!controllerRef.current) return;
    
    if (isPlaying) {
      controllerRef.current.startAnimation();
    } else {
      controllerRef.current.stopAnimation();
    }
  }, [isPlaying]);
  
  // 监听速度变化
  useEffect(() => {
    if (!controllerRef.current) return;
    
    controllerRef.current.changeSpeed(animationSpeed);
  }, [animationSpeed]);
  
  // 监听算法方法变化
  useEffect(() => {
    if (!controllerRef.current) return;
    
    // 重新加载数据
    const nodes = generateLinkedList(5);
    controllerRef.current.loadData(nodes);
  }, [animationMethod]);
  
  const handleSpeedChange = (speed: number) => {
    dispatch(setAnimationSpeed(speed));
  };
  
  const handleMethodChange = (method: 'iterative' | 'recursive') => {
    dispatch(setAnimationMethod(method));
  };
  
  return (
    <div className="linked-list-animation">
      <h1 className="animation-title">链表反转动画演示</h1>
      <div className="animation-description">
        <p>
          本演示展示了LeetCode 206题 - 反转链表的两种解法：迭代法和递归法。
          使用下方控制面板调整动画播放，或切换算法实现方式。
        </p>
      </div>
      
      <div className="animation-container">
        <AnimationCanvas width={800} height={400} />
      </div>
      
      <ControlPanel 
        className="animation-controls"
        onSpeedChange={handleSpeedChange}
        onMethodChange={handleMethodChange}
      />
      
      <div className="animation-info">
        <div className="algorithm-description">
          {animationMethod === 'iterative' ? (
            <div className="iterative-description">
              <h3>迭代法实现</h3>
              <pre>
{`// 迭代法代码
var reverseList = function(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
};`}
              </pre>
            </div>
          ) : (
            <div className="recursive-description">
              <h3>递归法实现</h3>
              <pre>
{`// 递归法代码
var reverseList = function(head) {
    if (head === null || head.next === null) {
        return head;
    }
    
    const newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
};`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedListAnimation; 