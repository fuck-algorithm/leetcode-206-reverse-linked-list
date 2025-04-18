import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  startAnimation,
  pauseAnimation,
  stepForward,
  stepBackward,
  resetAnimation,
  setAnimationSpeed,
  setAnimationMethod
} from '../store/animationSlice';

interface ControlPanelProps {
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ className = '' }) => {
  const { isPlaying, currentStep, totalSteps, animationSpeed, animationMethod } = useSelector(
    (state: RootState) => state.animation
  );
  const dispatch = useDispatch();

  // 处理动画控制
  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pauseAnimation());
    } else {
      dispatch(startAnimation());
    }
  };

  const handleStepForward = () => {
    dispatch(stepForward());
  };

  const handleStepBackward = () => {
    dispatch(stepBackward());
  };

  const handleReset = () => {
    dispatch(resetAnimation());
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAnimationSpeed(Number(e.target.value)));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAnimationMethod(e.target.value as 'iterative' | 'recursive'));
  };

  return (
    <div className={`control-panel ${className}`}>
      <div className="method-selector">
        <label htmlFor="method-select">算法方法:</label>
        <select
          id="method-select"
          value={animationMethod}
          onChange={handleMethodChange}
          disabled={isPlaying}
        >
          <option value="iterative">迭代法</option>
          <option value="recursive">递归法</option>
        </select>
      </div>

      <div className="animation-controls">
        <button
          onClick={handleStepBackward}
          disabled={isPlaying || currentStep <= 0}
          aria-label="后退一步"
          title="后退一步"
        >
          <span>⏮</span>
        </button>
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? '暂停' : '播放'}
          title={isPlaying ? '暂停' : '播放'}
          id="play-pause-btn"
        >
          {isPlaying ? <span>⏸</span> : <span>▶</span>}
        </button>
        <button
          onClick={handleStepForward}
          disabled={isPlaying || currentStep >= totalSteps}
          aria-label="前进一步"
          title="前进一步"
        >
          <span>⏭</span>
        </button>
        <button
          onClick={handleReset}
          disabled={isPlaying}
          aria-label="重置"
          title="重置"
        >
          <span>⟳</span>
        </button>
      </div>

      <div className="speed-control">
        <label htmlFor="speed-slider">速度:</label>
        <input
          type="range"
          id="speed-slider"
          min="0.5"
          max="3"
          step="0.5"
          value={animationSpeed}
          onChange={handleSpeedChange}
        />
        <span>{animationSpeed}x</span>
      </div>

      <div className="progress-info">
        <progress value={currentStep} max={totalSteps}></progress>
        <span>{currentStep} / {totalSteps}</span>
      </div>
    </div>
  );
};

export default ControlPanel; 