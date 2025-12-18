import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { AnimationController } from '../controllers/AnimationController';
import { generateLinkedList } from '../utils/dataGenerator';
import { AnimationControllerContext } from '../contexts/AnimationControllerContext';
import IterativeCanvas from '../components/IterativeCanvas';
import ControlPanel from '../components/ControlPanel';
import JavaCodeViewer from '../components/JavaCodeViewer';
import '../styles/PageLayout.css';

const IterativePage: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, animationSpeed } = useSelector((state: RootState) => state.animation);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    controllerRef.current = new AnimationController(dispatch);
    const initialNodes = generateLinkedList(5);
    controllerRef.current.loadData(initialNodes, 'iterative');

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stopAnimation();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (!controllerRef.current) return;
    if (isPlaying) {
      controllerRef.current.startAnimation(animationSpeed);
    } else {
      controllerRef.current.stopAnimation();
    }
  }, [isPlaying, animationSpeed]);

  useEffect(() => {
    if (!controllerRef.current) return;
    controllerRef.current.changeSpeed(animationSpeed, isPlaying);
  }, [animationSpeed, isPlaying]);

  return (
    <AnimationControllerContext.Provider value={{ controllerRef }}>
      <div className="page-container">
        <div className="page-header">
          <h2>迭代法反转链表</h2>
          <p>使用三个指针 prev、curr、next 逐步反转链表方向</p>
        </div>

        <div className="animation-area">
          <IterativeCanvas />
        </div>

        <ControlPanel className="page-controls" />

        <JavaCodeViewer method="iterative" />
      </div>
    </AnimationControllerContext.Provider>
  );
};

export default IterativePage;
