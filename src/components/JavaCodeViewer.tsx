import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import '../styles/JavaCodeViewer.css';

// Java AC代码 - 迭代法
const ITERATIVE_JAVA_CODE = `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
}`;

// Java AC代码 - 递归法
const RECURSIVE_JAVA_CODE = `public ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`;

// 迭代法：事件类型到代码行的映射
const ITERATIVE_LINE_MAP: Record<string, number[]> = {
  'INITIALIZE': [2, 3],
  'HIGHLIGHT_NODE': [5],
  'SET_NEXT_POINTER': [6],
  'REVERSE_POINTER': [7],
  'MOVE_PREV': [8],
  'MOVE_CURR': [9],
  'COMPLETE': [12],
};

// 递归法：事件类型到代码行的映射
const RECURSIVE_LINE_MAP: Record<string, number[]> = {
  'INITIALIZE': [1],
  'RECURSIVE_BASE_NULL': [2, 3],
  'RECURSIVE_BASE_LAST': [2, 3],
  'HIGHLIGHT_NODE': [1],
  'RECURSIVE_CALL': [6],
  'REVERSE_POINTER': [7],
  'SET_NULL_POINTER': [8],
  'RECURSIVE_RETURN': [10],
  'COMPLETE': [10],
};

// 迭代法：行号到变量的映射
const ITERATIVE_LINE_VARIABLES: Record<number, string[]> = {
  2: ['prev'],
  3: ['curr'],
  6: ['next'],
  7: ['curr.next'],
  8: ['prev'],
  9: ['curr'],
};

// 递归法：行号到变量的映射
const RECURSIVE_LINE_VARIABLES: Record<number, string[]> = {
  2: ['head'],
  6: ['newHead'],
  7: ['head.next.next'],
  8: ['head.next'],
};

interface JavaCodeViewerProps {
  method: 'iterative' | 'recursive';
}

const JavaCodeViewer: React.FC<JavaCodeViewerProps> = ({ method }) => {
  const { pointers, currentNodeData, currentStep, totalSteps, currentEventType } = useSelector(
    (state: RootState) => state.animation
  );
  
  const code = method === 'iterative' ? ITERATIVE_JAVA_CODE : RECURSIVE_JAVA_CODE;
  const lineMap = method === 'iterative' ? ITERATIVE_LINE_MAP : RECURSIVE_LINE_MAP;
  const lineVariables = method === 'iterative' ? ITERATIVE_LINE_VARIABLES : RECURSIVE_LINE_VARIABLES;
  const lines = code.split('\n');
  
  const highlightedLines = currentEventType ? (lineMap[currentEventType] || []) : [];

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);
  
  const getNodeValue = (nodeId: number | null): string => {
    if (nodeId === null) return 'null';
    const node = currentNodeData.find(n => n.id === nodeId);
    return node ? `[${node.value}]` : 'null';
  };

  // 获取变量值用于行内显示
  const getVariableValue = (varName: string): string => {
    switch (varName) {
      case 'prev':
        return getNodeValue(pointers.prev);
      case 'curr':
        return getNodeValue(pointers.curr);
      case 'next':
        return getNodeValue(pointers.next);
      case 'head':
        return getNodeValue(pointers.curr);
      case 'newHead':
        return getNodeValue(pointers.newHead);
      case 'curr.next':
      case 'head.next':
      case 'head.next.next':
        return '→';
      default:
        return '';
    }
  };

  // 获取行内变量注释
  const getInlineVariables = (lineNumber: number): React.ReactNode => {
    const vars = lineVariables[lineNumber];
    if (!vars || !highlightedLines.includes(lineNumber)) return null;
    
    return (
      <span className="inline-variables">
        {vars.map((varName, idx) => (
          <span key={idx} className={`inline-var ${varName.replace('.', '-')}`}>
            {varName}: {getVariableValue(varName)}
          </span>
        ))}
      </span>
    );
  };

  // 语法高亮处理
  const highlightCode = (line: string): string => {
    return Prism.highlight(line, Prism.languages.java, 'java');
  };

  const iterativeVariables = [
    { name: 'prev', value: getNodeValue(pointers.prev), color: '#e74c3c' },
    { name: 'curr', value: getNodeValue(pointers.curr), color: '#3498db' },
    { name: 'next', value: getNodeValue(pointers.next), color: '#2ecc71' },
  ];

  const recursiveVariables = [
    { name: 'head', value: getNodeValue(pointers.curr), color: '#3498db' },
    { name: 'newHead', value: getNodeValue(pointers.newHead), color: '#9b59b6' },
  ];

  const variables = method === 'iterative' ? iterativeVariables : recursiveVariables;

  return (
    <div className="java-code-viewer">
      <div className="code-viewer-header">
        <h3>Java AC 代码</h3>
        <span className="step-badge">Step {currentStep}/{totalSteps}</span>
      </div>
      
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
                {getInlineVariables(index + 1)}
              </div>
            ))}
          </pre>
        </div>
        
        <div className="variables-panel">
          <div className="variables-header">变量状态</div>
          <div className="variables-list">
            {variables.map((variable) => (
              <div key={variable.name} className="variable-item">
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
          
          {method === 'iterative' && (
            <div className="memory-visualization">
              <div className="memory-header">内存指向</div>
              <div className="pointer-arrows">
                {pointers.prev !== null && (
                  <div className="pointer-arrow prev">
                    <span className="arrow-label">prev →</span>
                    <span className="arrow-target">{getNodeValue(pointers.prev)}</span>
                  </div>
                )}
                {pointers.curr !== null && (
                  <div className="pointer-arrow curr">
                    <span className="arrow-label">curr →</span>
                    <span className="arrow-target">{getNodeValue(pointers.curr)}</span>
                  </div>
                )}
                {pointers.next !== null && (
                  <div className="pointer-arrow next">
                    <span className="arrow-label">next →</span>
                    <span className="arrow-target">{getNodeValue(pointers.next)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JavaCodeViewer;
