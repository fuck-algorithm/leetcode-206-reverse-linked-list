import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import { CYCLE_DETECTION_JAVA_CODE } from '../algorithms/CycleDetection';
import '../styles/JavaCodeViewer.css';

// 事件类型到代码行的映射
const CYCLE_LINE_MAP: Record<string, number[]> = {
  'CYCLE_INITIALIZE': [2],
  'CHECK_NULL': [3],
  'SLOW_MOVE': [5],
  'FAST_MOVE_FIRST': [4],
  'FAST_MOVE_SECOND': [4],
  'COMPARE_POINTERS': [6],
  'CYCLE_DETECTED': [7],
  'NO_CYCLE': [10],
};

const CycleDetectionCodeViewer: React.FC = () => {
  const { cyclePointers, currentNodeData, currentStep, totalSteps, currentEventType, stepDescription } = useSelector(
    (state: RootState) => state.animation
  );
  
  const lines = CYCLE_DETECTION_JAVA_CODE.split('\n');
  const highlightedLines = currentEventType ? (CYCLE_LINE_MAP[currentEventType] || []) : [];

  useEffect(() => {
    Prism.highlightAll();
  }, []);
  
  const getNodeValue = (nodeId: number | null): string => {
    if (nodeId === null) return 'null';
    const node = currentNodeData.find(n => n.id === nodeId);
    return node ? `[${node.value}]` : 'null';
  };

  // 语法高亮处理
  const highlightCode = (line: string): string => {
    return Prism.highlight(line, Prism.languages.java, 'java');
  };

  const variables = [
    { name: 'fast', value: getNodeValue(cyclePointers.fast), color: '#f44336', icon: '🐰' },
    { name: 'slow', value: getNodeValue(cyclePointers.slow), color: '#2196f3', icon: '🐢' },
  ];

  return (
    <div className="java-code-viewer">
      <div className="code-viewer-header">
        <h3>Java AC 代码 - 环检测</h3>
        <span className="step-badge">Step {currentStep}/{totalSteps}</span>
      </div>
      
      {/* 步骤描述 */}
      {stepDescription && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#fff3e0',
          borderLeft: '4px solid #ff9800',
          marginBottom: '12px',
          borderRadius: '0 4px 4px 0',
          fontSize: '14px',
          color: '#e65100'
        }}>
          {stepDescription}
        </div>
      )}
      
      <div className="code-viewer-content">
        <div className="code-panel">
          <div className="line-numbers">
            {lines.map((_, index) => (
              <div 
                key={index} 
                className={`line-number ${highlightedLines.includes(index + 1) ? 'highlighted' : ''}`}
              >
                {highlightedLines.includes(index + 1) && <span className="debug-indicator">●</span>}
                {index + 1}
              </div>
            ))}
          </div>
          <pre className="code-lines">
            {lines.map((line, index) => (
              <div 
                key={index} 
                className={`code-line ${highlightedLines.includes(index + 1) ? 'highlighted executing' : ''}`}
              >
                <span 
                  className="code-content"
                  dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                />
              </div>
            ))}
          </pre>
        </div>
        
        <div className="variables-panel">
          <div className="variables-header">变量状态</div>
          <div className="variables-list">
            {variables.map((variable) => (
              <div key={variable.name} className="variable-item">
                <span style={{ marginRight: '4px' }}>{variable.icon}</span>
                <span 
                  className="variable-name" 
                  style={{ borderLeftColor: variable.color }}
                >
                  {variable.name}
                </span>
                <span className="variable-value">{variable.value}</span>
              </div>
            ))}
          </div>
          
          <div className="memory-visualization">
            <div className="memory-header">指针状态</div>
            <div className="pointer-arrows">
              <div className="pointer-arrow" style={{ borderLeftColor: '#f44336' }}>
                <span className="arrow-label">🐰 fast →</span>
                <span className="arrow-target">{getNodeValue(cyclePointers.fast)}</span>
              </div>
              <div className="pointer-arrow" style={{ borderLeftColor: '#2196f3' }}>
                <span className="arrow-label">🐢 slow →</span>
                <span className="arrow-target">{getNodeValue(cyclePointers.slow)}</span>
              </div>
            </div>
          </div>

          {/* 算法说明 */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>
              算法原理
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
              <li>🐢 slow 每次移动 1 步</li>
              <li>🐰 fast 每次移动 2 步</li>
              <li>如果有环，fast 会追上 slow</li>
              <li>如果无环，fast 会先到达 null</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDetectionCodeViewer;
