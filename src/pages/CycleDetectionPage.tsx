import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { CycleDetectionController } from '../controllers/CycleDetectionController';
import { AnimationControllerContext } from '../contexts/AnimationControllerContext';
import CycleDetectionCanvas from '../components/CycleDetectionCanvas';
import ControlPanel from '../components/ControlPanel';
import CycleDetectionCodeViewer from '../components/CycleDetectionCodeViewer';
import { CYCLE_NODE_COUNT_MIN, CYCLE_NODE_COUNT_MAX } from '../utils/dataGenerator';
import '../styles/PageLayout.css';

const CycleDetectionPage: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, animationSpeed } = useSelector((state: RootState) => state.animation);
  const controllerRef = useRef<CycleDetectionController | null>(null);
  
  // 本地状态用于配置控件
  const [nodeCount, setNodeCount] = useState(5);
  const [cycleEntryIndex, setCycleEntryIndex] = useState<number | null>(2);

  useEffect(() => {
    controllerRef.current = new CycleDetectionController(dispatch);
    controllerRef.current.loadData({
      nodeCount: 5,
      cycleEntryIndex: 2
    });

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

  // 处理节点数量变化
  const handleNodeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value, 10);
    setNodeCount(newCount);
    
    // 如果环入口超出范围，调整它
    if (cycleEntryIndex !== null && cycleEntryIndex >= newCount) {
      setCycleEntryIndex(newCount - 1);
    }
    
    if (controllerRef.current) {
      controllerRef.current.changeConfig({
        nodeCount: newCount,
        cycleEntryIndex: cycleEntryIndex !== null && cycleEntryIndex >= newCount 
          ? newCount - 1 
          : cycleEntryIndex
      });
    }
  };

  // 处理环入口变化
  const handleCycleEntryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newEntry = value === 'none' ? null : parseInt(value, 10);
    setCycleEntryIndex(newEntry);
    
    if (controllerRef.current) {
      controllerRef.current.changeConfig({
        nodeCount,
        cycleEntryIndex: newEntry
      });
    }
  };

  // 生成环入口选项
  const cycleEntryOptions = () => {
    const options = [
      <option key="none" value="none">无环</option>
    ];
    for (let i = 0; i < nodeCount; i++) {
      options.push(
        <option key={i} value={i}>
          节点 {i + 1} (索引 {i})
        </option>
      );
    }
    return options;
  };

  return (
    <AnimationControllerContext.Provider value={{ controllerRef }}>
      <div className="page-container">
        <div className="page-header">
          <h2>环检测 - 快慢指针法</h2>
          <p>使用 Floyd's Tortoise and Hare 算法检测链表中是否存在环</p>
        </div>

        {/* 配置面板 */}
        <div className="config-panel" style={{
          display: 'flex',
          gap: '20px',
          padding: '12px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: '#555' }}>节点数量:</label>
            <input
              type="range"
              min={CYCLE_NODE_COUNT_MIN}
              max={CYCLE_NODE_COUNT_MAX}
              value={nodeCount}
              onChange={handleNodeCountChange}
              disabled={isPlaying}
              style={{ width: '100px' }}
            />
            <span style={{ 
              minWidth: '24px', 
              textAlign: 'center',
              fontWeight: 600,
              color: '#333'
            }}>{nodeCount}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: '#555' }}>环入口:</label>
            <select
              value={cycleEntryIndex === null ? 'none' : cycleEntryIndex}
              onChange={handleCycleEntryChange}
              disabled={isPlaying}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: isPlaying ? 'not-allowed' : 'pointer'
              }}
            >
              {cycleEntryOptions()}
            </select>
          </div>

          <div style={{ 
            marginLeft: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: cycleEntryIndex !== null ? '#e8f5e9' : '#fafafa',
            borderRadius: '4px',
            border: `1px solid ${cycleEntryIndex !== null ? '#4caf50' : '#ddd'}`
          }}>
            <span style={{ fontSize: '16px' }}>
              {cycleEntryIndex !== null ? '🔄' : '➡️'}
            </span>
            <span style={{ 
              fontWeight: 500, 
              color: cycleEntryIndex !== null ? '#2e7d32' : '#666' 
            }}>
              {cycleEntryIndex !== null ? '有环链表' : '无环链表'}
            </span>
          </div>
        </div>

        <div className="animation-area">
          <CycleDetectionCanvas />
        </div>

        <ControlPanel className="page-controls" />

        <CycleDetectionCodeViewer />
      </div>
    </AnimationControllerContext.Provider>
  );
};

export default CycleDetectionPage;
