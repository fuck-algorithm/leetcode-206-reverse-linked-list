import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  startAnimation,
  pauseAnimation,
  resetAnimation,
  setAnimationSpeed,
  setCurrentStep,
} from '../store/animationSlice';
import { useAnimationController } from '../contexts/AnimationControllerContext';
import { getAnimationSpeed, saveAnimationSpeed } from '../utils/userPreferences';
import '../styles/ControlPanel.css';

interface ControlPanelProps {
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ className = '' }) => {
  const { isPlaying, currentStep, totalSteps, animationSpeed } = useSelector(
    (state: RootState) => state.animation
  );
  const dispatch = useDispatch();
  const { controllerRef } = useAnimationController();

  // 加载保存的播放速度
  useEffect(() => {
    getAnimationSpeed().then(speed => {
      dispatch(setAnimationSpeed(speed));
    });
  }, [dispatch]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      dispatch(pauseAnimation());
    } else {
      dispatch(startAnimation());
    }
  }, [isPlaying, dispatch]);

  const handleStepForward = useCallback(() => {
    if (controllerRef.current && !isPlaying && currentStep < totalSteps) {
      controllerRef.current.stepForward();
    }
  }, [controllerRef, isPlaying, currentStep, totalSteps]);

  const handleStepBackward = useCallback(() => {
    if (controllerRef.current && !isPlaying && currentStep > 0) {
      controllerRef.current.stepBackward();
    }
  }, [controllerRef, isPlaying, currentStep]);

  const handleReset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resetAnimation();
    }
    dispatch(resetAnimation());
  }, [controllerRef, dispatch]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': // 空格键 - 播放/暂停
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft': // 左方向键 - 上一步
          e.preventDefault();
          handleStepBackward();
          break;
        case 'ArrowRight': // 右方向键 - 下一步
          e.preventDefault();
          handleStepForward();
          break;
        case 'r': // R键 - 重置
        case 'R':
          e.preventDefault();
          if (!isPlaying) {
            handleReset();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleStepForward, handleStepBackward, handleReset, isPlaying]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = Number(e.target.value);
    dispatch(setAnimationSpeed(speed));
    saveAnimationSpeed(speed);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 拖动时暂停播放
    if (isPlaying) {
      dispatch(pauseAnimation());
    }
    const newStep = Number(e.target.value);
    dispatch(setCurrentStep(newStep));
    if (controllerRef.current) {
      controllerRef.current.goToStep(newStep);
    }
  };

  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`control-panel-wrapper ${className}`}>
      <div className="progress-bar-container">
        <input
          type="range"
          className="progress-slider"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={handleProgressChange}
          style={{
            background: `linear-gradient(to right, #4caf50 0%, #4caf50 ${progressPercent}%, #e0e0e0 ${progressPercent}%, #e0e0e0 100%)`
          }}
        />
      </div>
      <div className="control-panel">
        <div className="control-buttons">
          <button onClick={handleStepBackward} disabled={isPlaying || currentStep <= 0} title="后退一步 (←)">
            <span className="btn-icon">⏮</span>
            <span className="btn-shortcut">←</span>
          </button>
          <button onClick={handlePlayPause} title={isPlaying ? '暂停 (Space)' : '播放 (Space)'} className="play-btn">
            <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
            <span className="btn-shortcut">Space</span>
          </button>
          <button onClick={handleStepForward} disabled={isPlaying || currentStep >= totalSteps} title="前进一步 (→)">
            <span className="btn-icon">⏭</span>
            <span className="btn-shortcut">→</span>
          </button>
          <button onClick={handleReset} disabled={isPlaying} title="重置 (R)">
            <span className="btn-icon">⟳</span>
            <span className="btn-shortcut">R</span>
          </button>
        </div>

        <div className="speed-control">
          <label>速度:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={handleSpeedChange}
          />
          <span>{animationSpeed}x</span>
        </div>

        <div className="progress-info">
          <span>{currentStep} / {totalSteps}</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
