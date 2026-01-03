import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import { ListNodeData } from '../types';
import './RecursiveCanvas.css';

const RecursiveCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentNodeData, pointers, callStack, currentEventType, stepDescription } = useSelector(
    (state: RootState) => state.animation
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const nodeSpacing = 150;
  const nodeRadius = 28;
  const boxSize = 24;
  const boxOffset = nodeRadius + 22;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 8;
        const containerHeight = containerRef.current.clientHeight - 8;
        setCanvasSize({
          width: Math.max(containerWidth, 600),
          height: Math.max(containerHeight, 250)
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.attr('width', canvasSize.width).attr('height', canvasSize.height);
    setCanvasReady(true);
  }, [canvasSize.width, canvasSize.height]);

  const [nodePositions, setNodePositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  useEffect(() => {
    if (!canvasReady || currentNodeData.length === 0) return;
    const positions = new Map<number, { x: number; y: number }>();
    const totalWidth = (currentNodeData.length - 1) * nodeSpacing;
    const startX = (canvasSize.width - totalWidth) / 2;
    const centerY = canvasSize.height / 2;
    currentNodeData.forEach((node: ListNodeData, index: number) => {
      positions.set(node.id, { x: startX + index * nodeSpacing, y: centerY });
    });
    setNodePositions(positions);
  }, [currentNodeData, canvasReady, canvasSize.width, canvasSize.height]);

  // 获取节点值
  const getNodeValue = (id: number | null) => {
    if (id === null) return 'null';
    const node = currentNodeData.find(n => n.id === id);
    return node ? node.value : 'null';
  };

  // 获取当前递归深度
  const getCurrentDepth = () => {
    return callStack?.length || 0;
  };

  // 获取当前处理的节点ID
  const getCurrentNodeId = (): number | null => {
    if (!callStack || callStack.length === 0) return null;
    const topFrame = callStack[callStack.length - 1];
    return topFrame.params.head;
  };

  // 渲染操作标签 - 放在链表上方居中位置
  const renderActionLabel = () => {
    if (!currentEventType) return null;
    
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const labelY = centerY - 120;
    
    let icon = '';
    let title = '';
    let detail = stepDescription || '';
    let color = '#666';
    
    switch (currentEventType) {
      case 'INITIALIZE':
        icon = '🚀';
        title = '开始递归';
        detail = detail || '从头节点开始递归反转';
        color = '#4caf50';
        break;
      case 'HIGHLIGHT_NODE':
        icon = '📍';
        title = `进入递归 (深度 ${getCurrentDepth()})`;
        detail = detail || `处理节点 ${getNodeValue(getCurrentNodeId())}`;
        color = '#2196f3';
        break;
      case 'RECURSIVE_CALL':
        icon = '⬇️';
        title = `递归调用 (深度 ${getCurrentDepth()})`;
        detail = detail || '向下递归到下一个节点';
        color = '#9c27b0';
        break;
      case 'RECURSIVE_BASE_LAST':
        icon = '🎯';
        title = `到达末尾 (深度 ${getCurrentDepth()})`;
        detail = detail || '找到新的头节点';
        color = '#ff9800';
        break;
      case 'RECURSIVE_BASE_NULL':
        icon = '⚠️';
        title = '空节点';
        detail = detail || '遇到空节点，返回';
        color = '#9e9e9e';
        break;
      case 'REVERSE_POINTER':
        icon = '↩️';
        title = `反转指针 (深度 ${getCurrentDepth()})`;
        detail = detail || '执行 head.next.next = head';
        color = '#f44336';
        break;
      case 'SET_NULL_POINTER':
        icon = '✂️';
        title = `断开连接 (深度 ${getCurrentDepth()})`;
        detail = detail || '执行 head.next = null';
        color = '#e91e63';
        break;
      case 'RECURSIVE_RETURN':
        icon = '⬆️';
        title = `回溯返回 (深度 ${getCurrentDepth()})`;
        detail = detail || '返回新的头节点';
        color = '#00bcd4';
        break;
      case 'COMPLETE':
        icon = '✅';
        title = '反转完成';
        detail = detail || `新的头节点是 ${getNodeValue(pointers.newHead)}`;
        color = '#4caf50';
        break;
      default:
        return null;
    }
    
    const boxWidth = Math.max(detail.length * 8 + 60, 280);
    
    return (
      <g className="action-label">
        <rect 
          x={centerX - boxWidth / 2} 
          y={labelY} 
          width={boxWidth} 
          height={48} 
          rx={8} 
          fill={color} 
          opacity={0.12} 
          stroke={color} 
          strokeWidth={1.5} 
        />
        <text x={centerX} y={labelY + 18} textAnchor="middle" fontSize="14px" fontWeight="bold" fill={color}>
          {icon} {title}
        </text>
        <text x={centerX} y={labelY + 38} textAnchor="middle" fontSize="11px" fill={color} opacity={0.9}>
          {detail.length > 50 ? detail.substring(0, 50) + '...' : detail}
        </text>
      </g>
    );
  };

  // 渲染递归深度标签 - 在每个节点上方显示
  const renderDepthLabels = () => {
    if (!callStack || callStack.length === 0) return null;
    
    const labels: React.ReactElement[] = [];
    
    // 为调用栈中的每个节点显示深度
    callStack.forEach((frame, index) => {
      const nodeId = frame.params.head;
      if (nodeId === null) return;
      
      const pos = nodePositions.get(nodeId);
      if (!pos) return;
      
      const depth = index + 1;
      const isTop = index === callStack.length - 1;
      
      labels.push(
        <g key={`depth-${nodeId}`} className="depth-label">
          <circle 
            cx={pos.x} 
            cy={pos.y - 55} 
            r={14} 
            fill={isTop ? '#2196f3' : '#e3f2fd'}
            stroke={isTop ? '#1976d2' : '#90caf9'}
            strokeWidth={2}
          />
          <text 
            x={pos.x} 
            y={pos.y - 51} 
            textAnchor="middle" 
            fontSize="11px" 
            fontWeight="bold" 
            fill={isTop ? '#fff' : '#1976d2'}
          >
            {depth}
          </text>
          {isTop && (
            <text 
              x={pos.x} 
              y={pos.y - 72} 
              textAnchor="middle" 
              fontSize="10px" 
              fill="#2196f3"
              fontWeight="600"
            >
              head
            </text>
          )}
        </g>
      );
    });
    
    return labels;
  };

  // 渲染递归调用栈可视化
  const renderCallStack = () => {
    if (!callStack || callStack.length === 0) return null;
    
    const stackX = 20;
    const stackY = 20;
    const itemHeight = 26;
    const stackWidth = 150;
    
    const reversedStack = [...callStack].reverse();
    
    return (
      <g className="call-stack">
        <text x={stackX} y={stackY} fontSize="12px" fontWeight="bold" fill="#495057">
          递归调用栈
        </text>
        <text x={stackX + stackWidth - 10} y={stackY} fontSize="10px" fill="#9e9e9e" textAnchor="end">
          栈顶↓
        </text>
        {reversedStack.map((frame: { params: { head: number | null }; returnValue: number | null }, i: number) => {
          const y = stackY + 12 + i * itemHeight;
          const isTop = i === 0;
          const depth = callStack.length - i;
          return (
            <g key={`stack-${i}`}>
              <rect
                x={stackX}
                y={y}
                width={stackWidth}
                height={itemHeight - 4}
                rx={4}
                fill={isTop ? '#e3f2fd' : '#f5f5f5'}
                stroke={isTop ? '#2196f3' : '#e0e0e0'}
                strokeWidth={isTop ? 2 : 1}
              />
              <circle 
                cx={stackX + 12} 
                cy={y + 11} 
                r={8} 
                fill={isTop ? '#2196f3' : '#bdbdbd'}
              />
              <text x={stackX + 12} y={y + 15} textAnchor="middle" fontSize="9px" fill="#fff" fontWeight="bold">
                {depth}
              </text>
              <text x={stackX + 26} y={y + 15} fontSize="10px" fontFamily="monospace" fill="#333">
                reverse({getNodeValue(frame.params.head)})
              </text>
              {frame.returnValue !== null && (
                <text x={stackX + stackWidth - 8} y={y + 15} fontSize="9px" fill="#4caf50" textAnchor="end" fontWeight="bold">
                  → {getNodeValue(frame.returnValue)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  // 渲染状态面板
  const renderStatePanel = () => {
    const panelX = canvasSize.width - 130;
    return (
      <g className="state-panel">
        <rect x={panelX - 10} y={15} width={120} height={90} rx={6} fill="#f8f9fa" stroke="#dee2e6" />
        <text x={panelX} y={35} fontSize="12px" fontWeight="bold" fill="#495057">递归状态</text>
        <text x={panelX} y={55} fontSize="12px" fontFamily="monospace">
          <tspan fill="#2196f3">深度</tspan>
          <tspan fill="#333"> = {getCurrentDepth()}</tspan>
        </text>
        <text x={panelX} y={73} fontSize="12px" fontFamily="monospace">
          <tspan fill="#9c27b0">head</tspan>
          <tspan fill="#333"> = {getNodeValue(getCurrentNodeId())}</tspan>
        </text>
        <text x={panelX} y={91} fontSize="12px" fontFamily="monospace">
          <tspan fill="#4caf50">newHead</tspan>
          <tspan fill="#333"> = {getNodeValue(pointers.newHead)}</tspan>
        </text>
      </g>
    );
  };

  // 渲染连接线
  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    
    currentNodeData.forEach((node: ListNodeData) => {
      if (node.next === null) return;
      const nextNode = currentNodeData.find((n: ListNodeData) => n.id === node.next);
      if (!nextNode) return;
      const p1 = nodePositions.get(node.id);
      const p2 = nodePositions.get(nextNode.id);
      if (!p1 || !p2) return;

      const isReversed = p2.x < p1.x;
      const strokeColor = isReversed ? '#4caf50' : '#90a4ae';
      const strokeWidth = isReversed ? 3 : 2;

      const startX = p1.x + boxOffset + boxSize / 2;
      const endX = p2.x - boxOffset - boxSize / 2;

      if (isReversed) {
        const midY = p1.y + 55;
        const revStartX = p1.x - boxOffset - boxSize / 2;
        const revEndX = p2.x + boxOffset + boxSize / 2;
        connections.push(
          <g key={`conn-${node.id}`}>
            <path
              d={`M ${revStartX} ${p1.y} Q ${(p1.x + p2.x) / 2} ${midY} ${revEndX} ${p2.y}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd="url(#arr-reversed)"
            />
            <text x={(p1.x + p2.x) / 2} y={midY + 18} textAnchor="middle" fontSize="10px" fill="#4caf50" fontWeight="600">
              已反转
            </text>
          </g>
        );
      } else {
        connections.push(
          <line 
            key={`conn-${node.id}`} 
            x1={startX} 
            y1={p1.y} 
            x2={endX} 
            y2={p2.y}
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            markerEnd="url(#arr-conn)" 
          />
        );
      }
    });
    return connections;
  };

  // 渲染每个节点的入边/出边状态
  const renderNodePointerStates = () => {
    const states: React.ReactElement[] = [];
    
    currentNodeData.forEach((node: ListNodeData) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      const incomingNode = currentNodeData.find((n: ListNodeData) => n.next === node.id);
      const incomingValue = incomingNode ? incomingNode.value : null;
      
      const outgoingNode = node.next !== null ? currentNodeData.find((n: ListNodeData) => n.id === node.next) : null;
      const outgoingValue = outgoingNode ? outgoingNode.value : null;
      
      const inX = pos.x - boxOffset;
      const outX = pos.x + boxOffset;
      
      states.push(
        <g key={`node-state-${node.id}`} className="node-pointer-state">
          <g className="incoming-indicator">
            <rect 
              x={inX - boxSize / 2} 
              y={pos.y - boxSize / 2} 
              width={boxSize} 
              height={boxSize} 
              rx={4} 
              fill={incomingValue === null ? '#fafafa' : '#e8f5e9'}
              stroke={incomingValue === null ? '#bdbdbd' : '#4caf50'}
              strokeWidth={1.5}
            />
            <text 
              x={inX} 
              y={pos.y + 5} 
              textAnchor="middle" 
              fontSize="12px" 
              fontFamily="monospace"
              fill={incomingValue === null ? '#9e9e9e' : '#2e7d32'}
              fontWeight="bold"
            >
              {incomingValue === null ? '∅' : incomingValue}
            </text>
          </g>
          
          <g className="outgoing-indicator">
            <rect 
              x={outX - boxSize / 2} 
              y={pos.y - boxSize / 2} 
              width={boxSize} 
              height={boxSize} 
              rx={4} 
              fill={outgoingValue === null ? '#fafafa' : '#fff3e0'}
              stroke={outgoingValue === null ? '#bdbdbd' : '#ff9800'}
              strokeWidth={1.5}
            />
            <text 
              x={outX} 
              y={pos.y + 5} 
              textAnchor="middle" 
              fontSize="12px" 
              fontFamily="monospace"
              fill={outgoingValue === null ? '#9e9e9e' : '#e65100'}
              fontWeight="bold"
            >
              {outgoingValue === null ? '∅' : outgoingValue}
            </text>
          </g>
        </g>
      );
    });
    
    return states;
  };

  // 渲染null指示
  const renderNullIndicator = () => {
    let leftmostX = Infinity;
    let leftmostY = 0;
    nodePositions.forEach((pos) => {
      if (pos.x < leftmostX) {
        leftmostX = pos.x;
        leftmostY = pos.y;
      }
    });
    if (leftmostX === Infinity) return null;

    const nullX = leftmostX - boxOffset - boxSize / 2 - 35;
    return (
      <g className="null-indicator">
        <rect 
          x={nullX - 22} 
          y={leftmostY - 18} 
          width={45} 
          height={36} 
          rx={6}
          fill="#fafafa" 
          stroke="#e0e0e0" 
          strokeDasharray="4,2" 
        />
        <text x={nullX} y={leftmostY + 6} textAnchor="middle" fontSize="13px" fill="#9e9e9e" fontWeight="600">
          null
        </text>
      </g>
    );
  };

  // 渲染反转指针指示
  const renderReverseIndicator = () => {
    if (currentEventType !== 'REVERSE_POINTER') return null;
    
    const currentNodeId = getCurrentNodeId();
    if (currentNodeId === null) return null;
    
    const currentNode = currentNodeData.find(n => n.id === currentNodeId);
    if (!currentNode) return null;
    
    const currPos = nodePositions.get(currentNodeId);
    if (!currPos) return null;
    
    // 找到 head.next 节点（即将指向 head 的节点）
    const nextNodeId = currentNode.next;
    if (nextNodeId === null) return null;
    
    const nextPos = nodePositions.get(nextNodeId);
    if (!nextPos) return null;
    
    const midY = currPos.y + 55;
    const startX = nextPos.x - boxOffset - boxSize / 2;
    const endX = currPos.x + boxOffset + boxSize / 2;
    
    return (
      <g className="reverse-indicator">
        <path
          d={`M ${startX} ${nextPos.y} Q ${(currPos.x + nextPos.x) / 2} ${midY} ${endX} ${currPos.y}`}
          fill="none"
          stroke="#f44336"
          strokeWidth="3"
          strokeDasharray="8,4"
          markerEnd="url(#arr-new)"
        />
        <text 
          x={(currPos.x + nextPos.x) / 2} 
          y={midY + 18} 
          textAnchor="middle" 
          fontSize="10px" 
          fill="#f44336" 
          fontWeight="600"
        >
          新建连接
        </text>
      </g>
    );
  };

  // 渲染断开连接指示
  const renderBreakIndicator = () => {
    if (currentEventType !== 'SET_NULL_POINTER') return null;
    
    const currentNodeId = getCurrentNodeId();
    if (currentNodeId === null) return null;
    
    const currPos = nodePositions.get(currentNodeId);
    if (!currPos) return null;
    
    const breakX = currPos.x + boxOffset + boxSize / 2 + 15;
    
    return (
      <g className="break-indicator">
        <line 
          x1={breakX - 8} 
          y1={currPos.y - 8} 
          x2={breakX + 8} 
          y2={currPos.y + 8}
          stroke="#f44336" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <line 
          x1={breakX - 8} 
          y1={currPos.y + 8} 
          x2={breakX + 8} 
          y2={currPos.y - 8}
          stroke="#f44336" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <text 
          x={breakX} 
          y={currPos.y + 28} 
          textAnchor="middle" 
          fontSize="10px" 
          fill="#f44336" 
          fontWeight="bold"
        >
          断开
        </text>
      </g>
    );
  };

  // 渲染newHead指针标签
  const renderNewHeadLabel = () => {
    if (pointers.newHead === null) return null;
    
    const pos = nodePositions.get(pointers.newHead);
    if (!pos) return null;
    
    return (
      <g className="newhead-label">
        <text 
          x={pos.x + 35} 
          y={pos.y - 55} 
          textAnchor="middle" 
          fontSize="11px" 
          fontWeight="bold" 
          fill="#4caf50"
        >
          newHead
        </text>
        <line 
          x1={pos.x + 35} 
          y1={pos.y - 48} 
          x2={pos.x + 20} 
          y2={pos.y - 35}
          stroke="#4caf50" 
          strokeWidth="2" 
          markerEnd="url(#arr-newhead)" 
        />
      </g>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="recursive-canvas-container"
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height}>
        <defs>
          <marker id="arr-head" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2196f3" />
          </marker>
          <marker id="arr-conn" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#90a4ae" />
          </marker>
          <marker id="arr-reversed" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#4caf50" />
          </marker>
          <marker id="arr-new" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#f44336" />
          </marker>
          <marker id="arr-newhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#4caf50" />
          </marker>
        </defs>
        {renderActionLabel()}
        {renderNullIndicator()}
        <g className="connections">{renderConnections()}</g>
        {renderReverseIndicator()}
        {renderBreakIndicator()}
        <g className="nodes">
          {currentNodeData.map(node => {
            const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
            return <ListNode key={node.id} data={{ ...node, position: pos }} nodeRadius={nodeRadius} />;
          })}
        </g>
        <g className="node-pointer-states">{renderNodePointerStates()}</g>
        <g className="depth-labels">{renderDepthLabels()}</g>
        {renderNewHeadLabel()}
        {renderCallStack()}
        {renderStatePanel()}
      </svg>
    </div>
  );
};

export default RecursiveCanvas;
