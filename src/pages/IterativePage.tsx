import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { AnimationController } from '../controllers/AnimationController';
import { generateLinkedList } from '../utils/dataGenerator';
import { AnimationControllerContext } from '../contexts/AnimationControllerContext';
import IterativeCanvas from '../components/IterativeCanvas';
import ControlPanel from '../components/ControlPanel';
import MultiLangCodeViewer from '../components/MultiLangCodeViewer';
import DataInput from '../components/DataInput';
import '../styles/PageLayout.css';

const IterativePage: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, animationSpeed } = useSelector((state: RootState) => state.animation);
  const controllerRef = useRef<AnimationController | null>(null);
  const [currentData, setCurrentData] = useState<number[]>([1, 2, 3, 4, 5]);

  const initializeAnimation = useCallback((values: number[]) => {
    if (controllerRef.current) {
      controllerRef.current.stopAnimation();
    }
    controllerRef.current = new AnimationController(dispatch);
    const nodes = generateLinkedList(values.length, values);
    controllerRef.current.loadData(nodes, 'iterative');
  }, [dispatch]);

  useEffect(() => {
    initializeAnimation(currentData);

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stopAnimation();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleDataChange = useCallback((values: number[]) => {
    setCurrentData(values);
    initializeAnimation(values);
  }, [initializeAnimation]);

  return (
    <AnimationControllerContext.Provider value={{ controllerRef }}>
      <div className="page-container">
        <div className="page-header">
          <h2>迭代法反转链表</h2>
          <p>使用三个指针 prev、curr、next 逐步反转链表方向</p>
        </div>

        <DataInput 
          onDataChange={handleDataChange} 
          currentData={currentData}
          dataType="linked-list"
        />

        <div className="animation-area">
          <IterativeCanvas />
        </div>

        <ControlPanel className="page-controls" />

        <MultiLangCodeViewer method="iterative" />
      </div>
    </AnimationControllerContext.Provider>
  );
};

export default IterativePage;
