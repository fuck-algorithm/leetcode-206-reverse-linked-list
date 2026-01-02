import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-javascript';
import { getCodeLanguage, saveCodeLanguage } from '../utils/userPreferences';
import '../styles/JavaCodeViewer.css';

type Language = 'java' | 'python' | 'golang' | 'javascript';

interface CodeConfig {
  code: string;
  lineMap: Record<string, number[]>;
  lineVariables: Record<number, string[]>;
  prismLang: string;
}

// 迭代法代码
const ITERATIVE_CODE: Record<Language, CodeConfig> = {
  java: {
    code: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
}`,
    lineMap: {
      'INITIALIZE': [2, 3],
      'HIGHLIGHT_NODE': [5],
      'SET_NEXT_POINTER': [6],
      'REVERSE_POINTER': [7],
      'MOVE_PREV': [8],
      'MOVE_CURR': [9],
      'COMPLETE': [12],
    },
    lineVariables: {
      2: ['prev'],
      3: ['curr'],
      6: ['next'],
      7: ['curr.next'],
      8: ['prev'],
      9: ['curr'],
    },
    prismLang: 'java',
  },
  python: {
    code: `def reverseList(self, head: ListNode) -> ListNode:
    prev = None
    curr = head
    
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    
    return prev`,
    lineMap: {
      'INITIALIZE': [2, 3],
      'HIGHLIGHT_NODE': [5],
      'SET_NEXT_POINTER': [6],
      'REVERSE_POINTER': [7],
      'MOVE_PREV': [8],
      'MOVE_CURR': [9],
      'COMPLETE': [11],
    },
    lineVariables: {
      2: ['prev'],
      3: ['curr'],
      6: ['next_node'],
      7: ['curr.next'],
      8: ['prev'],
      9: ['curr'],
    },
    prismLang: 'python',
  },
  golang: {
    code: `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode = nil
    curr := head
    
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    
    return prev
}`,
    lineMap: {
      'INITIALIZE': [2, 3],
      'HIGHLIGHT_NODE': [5],
      'SET_NEXT_POINTER': [6],
      'REVERSE_POINTER': [7],
      'MOVE_PREV': [8],
      'MOVE_CURR': [9],
      'COMPLETE': [12],
    },
    lineVariables: {
      2: ['prev'],
      3: ['curr'],
      6: ['next'],
      7: ['curr.Next'],
      8: ['prev'],
      9: ['curr'],
    },
    prismLang: 'go',
  },
  javascript: {
    code: `var reverseList = function(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
};`,
    lineMap: {
      'INITIALIZE': [2, 3],
      'HIGHLIGHT_NODE': [5],
      'SET_NEXT_POINTER': [6],
      'REVERSE_POINTER': [7],
      'MOVE_PREV': [8],
      'MOVE_CURR': [9],
      'COMPLETE': [12],
    },
    lineVariables: {
      2: ['prev'],
      3: ['curr'],
      6: ['next'],
      7: ['curr.next'],
      8: ['prev'],
      9: ['curr'],
    },
    prismLang: 'javascript',
  },
};

// 递归法代码
const RECURSIVE_CODE: Record<Language, CodeConfig> = {
  java: {
    code: `public ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
    lineMap: {
      'INITIALIZE': [1],
      'RECURSIVE_BASE_NULL': [2, 3],
      'RECURSIVE_BASE_LAST': [2, 3],
      'HIGHLIGHT_NODE': [1],
      'RECURSIVE_CALL': [6],
      'REVERSE_POINTER': [7],
      'SET_NULL_POINTER': [8],
      'RECURSIVE_RETURN': [10],
      'COMPLETE': [10],
    },
    lineVariables: {
      2: ['head'],
      6: ['newHead'],
      7: ['head.next.next'],
      8: ['head.next'],
    },
    prismLang: 'java',
  },
  python: {
    code: `def reverseList(self, head: ListNode) -> ListNode:
    if not head or not head.next:
        return head
    
    new_head = self.reverseList(head.next)
    head.next.next = head
    head.next = None
    
    return new_head`,
    lineMap: {
      'INITIALIZE': [1],
      'RECURSIVE_BASE_NULL': [2, 3],
      'RECURSIVE_BASE_LAST': [2, 3],
      'HIGHLIGHT_NODE': [1],
      'RECURSIVE_CALL': [5],
      'REVERSE_POINTER': [6],
      'SET_NULL_POINTER': [7],
      'RECURSIVE_RETURN': [9],
      'COMPLETE': [9],
    },
    lineVariables: {
      2: ['head'],
      5: ['new_head'],
      6: ['head.next.next'],
      7: ['head.next'],
    },
    prismLang: 'python',
  },
  golang: {
    code: `func reverseList(head *ListNode) *ListNode {
    if head == nil || head.Next == nil {
        return head
    }
    
    newHead := reverseList(head.Next)
    head.Next.Next = head
    head.Next = nil
    
    return newHead
}`,
    lineMap: {
      'INITIALIZE': [1],
      'RECURSIVE_BASE_NULL': [2, 3],
      'RECURSIVE_BASE_LAST': [2, 3],
      'HIGHLIGHT_NODE': [1],
      'RECURSIVE_CALL': [6],
      'REVERSE_POINTER': [7],
      'SET_NULL_POINTER': [8],
      'RECURSIVE_RETURN': [10],
      'COMPLETE': [10],
    },
    lineVariables: {
      2: ['head'],
      6: ['newHead'],
      7: ['head.Next.Next'],
      8: ['head.Next'],
    },
    prismLang: 'go',
  },
  javascript: {
    code: `var reverseList = function(head) {
    if (head === null || head.next === null) {
        return head;
    }
    
    let newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
};`,
    lineMap: {
      'INITIALIZE': [1],
      'RECURSIVE_BASE_NULL': [2, 3],
      'RECURSIVE_BASE_LAST': [2, 3],
      'HIGHLIGHT_NODE': [1],
      'RECURSIVE_CALL': [6],
      'REVERSE_POINTER': [7],
      'SET_NULL_POINTER': [8],
      'RECURSIVE_RETURN': [10],
      'COMPLETE': [10],
    },
    lineVariables: {
      2: ['head'],
      6: ['newHead'],
      7: ['head.next.next'],
      8: ['head.next'],
    },
    prismLang: 'javascript',
  },
};

const LANGUAGE_LABELS: Record<Language, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript',
};

interface MultiLangCodeViewerProps {
  method: 'iterative' | 'recursive';
}

const MultiLangCodeViewer: React.FC<MultiLangCodeViewerProps> = ({ method }) => {
  const [language, setLanguage] = useState<Language>('java');
  const { pointers, currentNodeData, currentStep, totalSteps, currentEventType } = useSelector(
    (state: RootState) => state.animation
  );

  // 加载用户保存的语言偏好
  useEffect(() => {
    getCodeLanguage().then(setLanguage);
  }, []);

  const codeConfigs = method === 'iterative' ? ITERATIVE_CODE : RECURSIVE_CODE;
  const config = codeConfigs[language];
  const lines = config.code.split('\n');
  const highlightedLines = currentEventType ? (config.lineMap[currentEventType] || []) : [];

  useEffect(() => {
    Prism.highlightAll();
  }, [config.code, language]);

  // 切换语言
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveCodeLanguage(lang);
  };

  const getNodeValue = (nodeId: number | null): string => {
    if (nodeId === null) return 'null';
    const node = currentNodeData.find(n => n.id === nodeId);
    return node ? `[${node.value}]` : 'null';
  };

  const getVariableValue = (varName: string): string => {
    const baseName = varName.replace(/[._]/g, '').toLowerCase();
    if (baseName.includes('prev')) return getNodeValue(pointers.prev);
    if (baseName.includes('curr') || baseName === 'head') return getNodeValue(pointers.curr);
    if (baseName.includes('next') || baseName === 'nextnode') return getNodeValue(pointers.next);
    if (baseName.includes('newhead')) return getNodeValue(pointers.newHead);
    return '→';
  };

  const getInlineVariables = (lineNumber: number): React.ReactNode => {
    const vars = config.lineVariables[lineNumber];
    if (!vars || !highlightedLines.includes(lineNumber)) return null;
    
    return (
      <span className="inline-variables">
        {vars.map((varName, idx) => (
          <span key={idx} className="inline-var">
            {varName}: {getVariableValue(varName)}
          </span>
        ))}
      </span>
    );
  };

  const highlightCode = (line: string): string => {
    const prismLang = Prism.languages[config.prismLang];
    if (!prismLang) return line;
    return Prism.highlight(line, prismLang, config.prismLang);
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
        <div className="language-tabs">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map(lang => (
            <button
              key={lang}
              className={`lang-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
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

export default MultiLangCodeViewer;
