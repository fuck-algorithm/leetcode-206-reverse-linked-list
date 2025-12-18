import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { AnimationController } from '../controllers/AnimationController';
import { generateLinkedList } from '../utils/dataGenerator';
import { AnimationControllerContext } from '../contexts/AnimationControllerContext';
import RecursiveCanvas from '../components/RecursiveCanvas';
import ControlPanel from '../components/ControlPanel';
import JavaCodeViewer from '../components/JavaCodeViewer';
import '../styles/PageLayout.css';

const RecursivePage: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, animationSpeed } = useSelector((state: RootState) => state.animation);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    controllerRef.current = new AnimationController(dispatch);
    const initialNodes = generateLinkedList(5);
    controllerRef.current.loadData(initialNodes, 'recursive');

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
          <h2>递归法反转链表</h2>
          <p>递归到链表末尾，然后在回溯过程中反转指针</p>
        </div>

        <div className="animation-area">
          <RecursiveCanvas />
        </div>

        <ControlPanel className="page-controls" />

        <JavaCodeViewer method="recursive" />
      </div>
    </AnimationControllerContext.Provider>
  );
};

export default RecursivePage;
