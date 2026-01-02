import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import { ListNodeData } from '../types';

const IterativeCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentNodeData, pointers, currentEventType } = useSelector(
    (state: RootState) => state.animation
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const nodeSpacing = 110;

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

  // 渲染变量状态面板
  const renderStatePanel = () => {
    const panelX = canvasSize.width - 130;
    return (
      <g className="state-panel">
        <rect x={panelX - 10} y={15} width={120} height={90} rx={6} fill="#f8f9fa" stroke="#dee2e6" />
        <text x={panelX} y={35} fontSize="12px" fontWeight="bold" fill="#495057">变量状态</text>
        <text x={panelX} y={55} fontSize="12px" fontFamily="monospace">
          <tspan fill="#9c27b0">prev</tspan>
          <tspan fill="#333"> = {getNodeValue(pointers.prev)}</tspan>
        </text>
        <text x={panelX} y={73} fontSize="12px" fontFamily="monospace">
          <tspan fill="#2196f3">curr</tspan>
          <tspan fill="#333"> = {getNodeValue(pointers.curr)}</tspan>
        </text>
        <text x={panelX} y={91} fontSize="12px" fontFamily="monospace">
          <tspan fill="#ff9800">next</tspan>
          <tspan fill="#333"> = {getNodeValue(pointers.next)}</tspan>
        </text>
      </g>
    );
  };

  // 渲染操作标签 - 放在链表上方居中位置，包含完整的操作说明
  const renderActionLabel = () => {
    if (!currentEventType) return null;
    
    // 计算链表的中心位置
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    // 标签放在链表上方
    const labelY = centerY - 120;
    
    // 根据操作类型生成完整的说明文字
    let icon = '';
    let title = '';
    let detail = '';
    let color = '#666';
    
    switch (currentEventType) {
      case 'INITIALIZE':
        icon = '🚀';
        title = '初始化';
        detail = 'prev = null, curr = head';
        color = '#4caf50';
        break;
      case 'HIGHLIGHT_NODE':
        icon = '🔄';
        title = '进入循环';
        detail = `curr(${getNodeValue(pointers.curr)}) != null，继续循环`;
        color = '#2196f3';
        break;
      case 'SET_NEXT_POINTER':
        icon = '📌';
        title = '保存下一节点';
        detail = `next = curr.next → next 指向节点 ${getNodeValue(pointers.next)}`;
        color = '#ff9800';
        break;
      case 'REVERSE_POINTER':
        icon = '↩️';
        title = '反转指针';
        detail = `curr.next = prev → 节点 ${getNodeValue(pointers.curr)} 指向 ${getNodeValue(pointers.prev)}`;
        color = '#f44336';
        break;
      case 'MOVE_PREV':
        icon = '➡️';
        title = 'prev 前移';
        detail = `prev = curr → prev 移动到节点 ${getNodeValue(pointers.prev)}`;
        color = '#9c27b0';
        break;
      case 'MOVE_CURR':
        icon = '➡️';
        title = 'curr 前移';
        detail = `curr = next → curr 移动到节点 ${getNodeValue(pointers.curr)}`;
        color = '#2196f3';
        break;
      case 'COMPLETE':
        icon = '✅';
        title = '反转完成';
        detail = `curr = null，循环结束，返回 prev`;
        color = '#4caf50';
        break;
      default:
        return null;
    }
    
    const boxWidth = Math.max(detail.length * 10 + 40, 200);
    
    return (
      <g className="action-label">
        <rect x={centerX - boxWidth / 2} y={labelY} width={boxWidth} height={48} rx={8} fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} />
        <text x={centerX} y={labelY + 18} textAnchor="middle" fontSize="14px" fontWeight="bold" fill={color}>
          {icon} {title}
        </text>
        <text x={centerX} y={labelY + 38} textAnchor="middle" fontSize="12px" fill={color} opacity={0.9}>
          {detail}
        </text>
      </g>
    );
  };

  // 渲染指针标签
  const renderPointerLabels = () => {
    const labels: React.ReactElement[] = [];
    const nodePointers: Map<number, string[]> = new Map();

    if (pointers.prev !== null) {
      const arr = nodePointers.get(pointers.prev) || [];
      arr.push('prev');
      nodePointers.set(pointers.prev, arr);
    }
    if (pointers.curr !== null) {
      const arr = nodePointers.get(pointers.curr) || [];
      arr.push('curr');
      nodePointers.set(pointers.curr, arr);
    }
    if (pointers.next !== null) {
      const arr = nodePointers.get(pointers.next) || [];
      arr.push('next');
      nodePointers.set(pointers.next, arr);
    }

    nodePointers.forEach((names, nodeId) => {
      const pos = nodePositions.get(nodeId);
      if (!pos) return;
      names.forEach((name, i) => {
        const color = name === 'prev' ? '#9c27b0' : name === 'curr' ? '#2196f3' : '#ff9800';
        const xOff = (i - (names.length - 1) / 2) * 45;
        labels.push(
          <g key={`ptr-${name}-${nodeId}`}>
            <text x={pos.x + xOff} y={pos.y - 58} textAnchor="middle" fontSize="14px" fontWeight="bold" fill={color}>
              {name}
            </text>
            <line x1={pos.x + xOff} y1={pos.y - 52} x2={pos.x + xOff} y2={pos.y - 35} stroke={color} strokeWidth="2" markerEnd={`url(#arr-${name})`} />
          </g>
        );
      });
    });
    return labels;
  };

  // 渲染连接线（带方向指示）
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

      if (isReversed) {
        const midY = p1.y + 55;
        connections.push(
          <g key={`conn-${node.id}`}>
            <path
              d={`M ${p1.x - 20} ${p1.y + 25} Q ${(p1.x + p2.x) / 2} ${midY} ${p2.x + 20} ${p2.y + 25}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd="url(#arr-reversed)"
            />
            <text x={(p1.x + p2.x) / 2} y={midY + 18} textAnchor="middle" fontSize="11px" fill="#4caf50" fontWeight="600">
              已反转
            </text>
          </g>
        );
      } else {
        connections.push(
          <line key={`conn-${node.id}`} x1={p1.x + 32} y1={p1.y} x2={p2.x - 32} y2={p2.y}
            stroke={strokeColor} strokeWidth={strokeWidth} markerEnd="url(#arr-conn)" />
        );
      }
    });
    return connections;
  };

  // 渲染断开连接的X标记
  const renderBreakIndicator = () => {
    if (currentEventType !== 'REVERSE_POINTER' || pointers.curr === null || pointers.next === null) return null;
    
    const currPos = nodePositions.get(pointers.curr);
    const nextPos = nodePositions.get(pointers.next);
    if (!currPos || !nextPos) return null;

    const midX = (currPos.x + nextPos.x) / 2;
    return (
      <g className="break-indicator">
        {/* X标记 */}
        <line x1={midX - 10} y1={currPos.y - 10} x2={midX + 10} y2={currPos.y + 10}
          stroke="#f44336" strokeWidth="4" strokeLinecap="round" />
        <line x1={midX - 10} y1={currPos.y + 10} x2={midX + 10} y2={currPos.y - 10}
          stroke="#f44336" strokeWidth="4" strokeLinecap="round" />
        <text x={midX} y={currPos.y + 35} textAnchor="middle" fontSize="12px" fill="#f44336" fontWeight="bold">
          断开
        </text>
      </g>
    );
  };

  // 渲染新建连接指示（curr.next = prev）
  const renderNewConnectionIndicator = () => {
    if (currentEventType !== 'REVERSE_POINTER' || pointers.curr === null) return null;
    
    const currPos = nodePositions.get(pointers.curr);
    const prevPos = pointers.prev !== null ? nodePositions.get(pointers.prev) : null;
    if (!currPos) return null;

    if (prevPos) {
      // 显示新建的反转连接
      const midY = currPos.y + 55;
      return (
        <g className="new-connection">
          <path
            d={`M ${currPos.x - 20} ${currPos.y + 25} Q ${(currPos.x + prevPos.x) / 2} ${midY} ${prevPos.x + 20} ${prevPos.y + 25}`}
            fill="none"
            stroke="#f44336"
            strokeWidth="3"
            strokeDasharray="8,4"
            markerEnd="url(#arr-new)"
          />
          <text x={(currPos.x + prevPos.x) / 2} y={midY + 18} textAnchor="middle" fontSize="11px" fill="#f44336" fontWeight="600">
            新建连接
          </text>
        </g>
      );
    } else {
      // prev是null，显示指向null
      return (
        <g className="new-connection-null">
          <line x1={currPos.x - 32} y1={currPos.y} x2={currPos.x - 60} y2={currPos.y}
            stroke="#f44336" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arr-new)" />
          <text x={currPos.x - 75} y={currPos.y + 20} textAnchor="middle" fontSize="10px" fill="#f44336" fontWeight="600">
            → null
          </text>
        </g>
      );
    }
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

    return (
      <g className="null-indicator">
        <rect x={leftmostX - 85} y={leftmostY - 18} width={45} height={36} rx={6}
          fill="#fafafa" stroke="#e0e0e0" strokeDasharray="4,2" />
        <text x={leftmostX - 62} y={leftmostY + 6} textAnchor="middle" fontSize="13px" fill="#9e9e9e" fontWeight="600">
          null
        </text>
        {/* prev指向null的箭头 */}
        {pointers.prev === null && pointers.curr !== null && (
          <g>
            <line x1={leftmostX - 40} y1={leftmostY - 30} x2={leftmostX - 62} y2={leftmostY - 20}
              stroke="#9c27b0" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arr-prev)" />
            <text x={leftmostX - 50} y={leftmostY - 38} textAnchor="middle" fontSize="10px" fill="#9c27b0">
              prev
            </text>
          </g>
        )}
      </g>
    );
  };

  // 渲染移动指示箭头
  const renderMoveIndicator = () => {
    if (currentEventType !== 'MOVE_PREV' && currentEventType !== 'MOVE_CURR') return null;
    
    const color = currentEventType === 'MOVE_PREV' ? '#9c27b0' : '#2196f3';
    const label = currentEventType === 'MOVE_PREV' ? 'prev' : 'curr';
    
    // 找到当前指针位置
    const targetId = currentEventType === 'MOVE_PREV' ? pointers.prev : pointers.curr;
    if (targetId === null) return null;
    
    const pos = nodePositions.get(targetId);
    if (!pos) return null;

    return (
      <g className="move-indicator">
        <circle cx={pos.x} cy={pos.y - 70} r={18} fill={color} opacity={0.2} />
        <text x={pos.x} y={pos.y - 66} textAnchor="middle" fontSize="11px" fill={color} fontWeight="bold">
          {label}
        </text>
        <text x={pos.x} y={pos.y - 80} textAnchor="middle" fontSize="16px">
          ⬇️
        </text>
      </g>
    );
  };

  // 渲染每个节点左右两侧的 prev/next 指针状态
  // 每个节点自己的 prev 在自己左边，自己的 next 在自己右边
  const renderNodePointerStates = () => {
    const states: React.ReactElement[] = [];
    const nodeRadius = 28;
    const boxSize = 24;
    const offset = nodeRadius + 22; // 距离节点中心的距离
    
    currentNodeData.forEach((node: ListNodeData) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      // 获取该节点的 prev 值（指向它的前一个节点）
      const prevNode = currentNodeData.find((n: ListNodeData) => n.next === node.id);
      const prevValue = prevNode ? prevNode.value : null;
      
      // 获取该节点的 next 值
      const nextNode = node.next !== null ? currentNodeData.find((n: ListNodeData) => n.id === node.next) : null;
      const nextValue = nextNode ? nextNode.value : null;
      
      // prev 在节点左边
      const prevX = pos.x - offset;
      // next 在节点右边
      const nextX = pos.x + offset;
      
      states.push(
        <g key={`node-state-${node.id}`} className="node-pointer-state">
          {/* prev 值 - 节点左边 */}
          <g className="prev-indicator">
            <rect 
              x={prevX - boxSize / 2} 
              y={pos.y - boxSize / 2} 
              width={boxSize} 
              height={boxSize} 
              rx={4} 
              fill={prevValue === null ? '#ffebee' : '#f3e5f5'}
              stroke={prevValue === null ? '#f44336' : '#9c27b0'}
              strokeWidth={1.5}
            />
            <text 
              x={prevX} 
              y={pos.y + 5} 
              textAnchor="middle" 
              fontSize="12px" 
              fontFamily="monospace"
              fill={prevValue === null ? '#f44336' : '#9c27b0'}
              fontWeight="bold"
            >
              {prevValue === null ? '∅' : prevValue}
            </text>
          </g>
          
          {/* next 值 - 节点右边 */}
          <g className="next-indicator">
            <rect 
              x={nextX - boxSize / 2} 
              y={pos.y - boxSize / 2} 
              width={boxSize} 
              height={boxSize} 
              rx={4} 
              fill={nextValue === null ? '#ffebee' : '#fff3e0'}
              stroke={nextValue === null ? '#f44336' : '#ff9800'}
              strokeWidth={1.5}
            />
            <text 
              x={nextX} 
              y={pos.y + 5} 
              textAnchor="middle" 
              fontSize="12px" 
              fontFamily="monospace"
              fill={nextValue === null ? '#f44336' : '#ff9800'}
              fontWeight="bold"
            >
              {nextValue === null ? '∅' : nextValue}
            </text>
          </g>
        </g>
      );
    });
    
    return states;
  };

  // 渲染完成状态 - 已合并到 renderActionLabel 中，保留空函数避免调用错误
  const renderCompleteIndicator = () => {
    return null;
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height}>
        <defs>
          <marker id="arr-prev" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#9c27b0" />
          </marker>
          <marker id="arr-curr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2196f3" />
          </marker>
          <marker id="arr-next" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff9800" />
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
        </defs>
        {renderActionLabel()}
        {renderNullIndicator()}
        <g className="connections">{renderConnections()}</g>
        {renderBreakIndicator()}
        {renderNewConnectionIndicator()}
        <g className="nodes">
          {currentNodeData.map(node => {
            const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
            return <ListNode key={node.id} data={{ ...node, position: pos }} nodeRadius={28} />;
          })}
        </g>
        <g className="node-pointer-states">{renderNodePointerStates()}</g>
        <g className="pointers">{renderPointerLabels()}</g>
        {renderMoveIndicator()}
        {renderStatePanel()}
        {renderCompleteIndicator()}
      </svg>
    </div>
  );
};

export default IterativeCanvas;
