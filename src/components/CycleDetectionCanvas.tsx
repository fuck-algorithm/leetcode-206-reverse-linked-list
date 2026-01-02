import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import { ListNodeData } from '../types';
import { calculateCyclicLayout } from '../utils/dataGenerator';

const CycleDetectionCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentNodeData, cyclePointers, cycleConfig, meetingPoint, cycleDetected, currentEventType } = useSelector(
    (state: RootState) => state.animation
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 8;
        const containerHeight = containerRef.current.clientHeight - 8;
        setCanvasSize({
          width: Math.max(containerWidth, 600),
          height: Math.max(containerHeight, 300)
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
    
    // 找到环入口索引
    let cycleEntryIndex: number | null = null;
    if (cycleConfig.entryPoint !== null) {
      cycleEntryIndex = currentNodeData.findIndex(n => n.id === cycleConfig.entryPoint! + 1);
      if (cycleEntryIndex === -1) cycleEntryIndex = null;
    }
    
    const positions = calculateCyclicLayout(currentNodeData, cycleEntryIndex, canvasSize);
    setNodePositions(positions);
  }, [currentNodeData, canvasReady, canvasSize, cycleConfig.entryPoint]);

  // 获取节点值
  const getNodeValue = (id: number | null) => {
    if (id === null) return 'null';
    const node = currentNodeData.find(n => n.id === id);
    return node ? node.value : 'null';
  };

  // 获取当前操作的描述标签
  const getActionLabel = (): { text: string; color: string; icon: string } | null => {
    switch (currentEventType) {
      case 'CYCLE_INITIALIZE':
        return { text: '初始化指针', color: '#4caf50', icon: '🚀' };
      case 'CHECK_NULL':
        return { text: '检查空指针', color: '#ff9800', icon: '🔍' };
      case 'SLOW_MOVE':
        return { text: 'slow 移动', color: '#2196f3', icon: '🐢' };
      case 'FAST_MOVE_FIRST':
        return { text: 'fast 第一步', color: '#f44336', icon: '🐰' };
      case 'FAST_MOVE_SECOND':
        return { text: 'fast 第二步', color: '#f44336', icon: '🐰' };
      case 'COMPARE_POINTERS':
        return { text: '比较指针', color: '#9c27b0', icon: '⚖️' };
      case 'CYCLE_DETECTED':
        return { text: '检测到环！', color: '#4caf50', icon: '🎉' };
      case 'NO_CYCLE':
        return { text: '无环', color: '#607d8b', icon: '✅' };
      default:
        return null;
    }
  };

  // 渲染变量状态面板
  const renderStatePanel = () => {
    const panelX = canvasSize.width - 130;
    return (
      <g className="state-panel">
        <rect x={panelX - 10} y={15} width={120} height={75} rx={6} fill="#f8f9fa" stroke="#dee2e6" />
        <text x={panelX} y={35} fontSize="12px" fontWeight="bold" fill="#495057">变量状态</text>
        <text x={panelX} y={55} fontSize="12px" fontFamily="monospace">
          <tspan fill="#f44336">fast</tspan>
          <tspan fill="#333"> = {getNodeValue(cyclePointers.fast)}</tspan>
        </text>
        <text x={panelX} y={73} fontSize="12px" fontFamily="monospace">
          <tspan fill="#2196f3">slow</tspan>
          <tspan fill="#333"> = {getNodeValue(cyclePointers.slow)}</tspan>
        </text>
      </g>
    );
  };

  // 渲染操作标签
  const renderActionLabel = () => {
    const action = getActionLabel();
    if (!action) return null;
    return (
      <g className="action-label">
        <rect x={20} y={15} width={160} height={32} rx={6} fill={action.color} opacity={0.15} stroke={action.color} />
        <text x={100} y={36} textAnchor="middle" fontSize="14px" fontWeight="bold" fill={action.color}>
          {action.icon} {action.text}
        </text>
      </g>
    );
  };

  // 渲染指针标签
  const renderPointerLabels = () => {
    const labels: React.ReactElement[] = [];
    const nodePointers: Map<number, string[]> = new Map();

    if (cyclePointers.fast !== null) {
      const arr = nodePointers.get(cyclePointers.fast) || [];
      arr.push('fast');
      nodePointers.set(cyclePointers.fast, arr);
    }
    if (cyclePointers.slow !== null) {
      const arr = nodePointers.get(cyclePointers.slow) || [];
      arr.push('slow');
      nodePointers.set(cyclePointers.slow, arr);
    }

    nodePointers.forEach((names, nodeId) => {
      const pos = nodePositions.get(nodeId);
      if (!pos) return;
      names.forEach((name, i) => {
        const color = name === 'fast' ? '#f44336' : '#2196f3';
        const icon = name === 'fast' ? '🐰' : '🐢';
        const xOff = (i - (names.length - 1) / 2) * 50;
        labels.push(
          <g key={`ptr-${name}-${nodeId}`}>
            <text x={pos.x + xOff} y={pos.y - 55} textAnchor="middle" fontSize="16px">
              {icon}
            </text>
            <text x={pos.x + xOff} y={pos.y - 40} textAnchor="middle" fontSize="12px" fontWeight="bold" fill={color}>
              {name}
            </text>
            <line x1={pos.x + xOff} y1={pos.y - 35} x2={pos.x + xOff} y2={pos.y - 30} stroke={color} strokeWidth="2" markerEnd={`url(#arr-${name})`} />
          </g>
        );
      });
    });
    return labels;
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

      // 检查是否是环连接（尾节点到环入口）
      const isLastNode = node === currentNodeData[currentNodeData.length - 1];
      const isCycleConnection = isLastNode && node.next !== null && 
        currentNodeData.findIndex(n => n.id === node.next) < currentNodeData.length - 1;

      if (isCycleConnection) {
        // 环连接：使用曲线
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 计算控制点（向外弯曲）
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const perpX = -dy / dist * 60;
        const perpY = dx / dist * 60;
        const ctrlX = midX + perpX;
        const ctrlY = midY + perpY;

        connections.push(
          <g key={`conn-cycle-${node.id}`}>
            <path
              d={`M ${p1.x} ${p1.y + 28} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y + 28}`}
              fill="none"
              stroke="#4caf50"
              strokeWidth="3"
              strokeDasharray="8,4"
              markerEnd="url(#arr-cycle)"
            />
            <text x={ctrlX} y={ctrlY + 20} textAnchor="middle" fontSize="11px" fill="#4caf50" fontWeight="600">
              环连接
            </text>
          </g>
        );
      } else {
        // 普通连接
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const startX = p1.x + 28 * Math.cos(angle);
        const startY = p1.y + 28 * Math.sin(angle);
        const endX = p2.x - 28 * Math.cos(angle);
        const endY = p2.y - 28 * Math.sin(angle);

        connections.push(
          <line 
            key={`conn-${node.id}`} 
            x1={startX} 
            y1={startY} 
            x2={endX} 
            y2={endY}
            stroke="#90a4ae" 
            strokeWidth={2} 
            markerEnd="url(#arr-conn)" 
          />
        );
      }
    });
    return connections;
  };

  // 渲染环入口标记
  const renderCycleEntryMarker = () => {
    if (cycleConfig.entryPoint === null) return null;
    
    const entryNode = currentNodeData.find(n => n.isCycleEntry);
    if (!entryNode) return null;
    
    const pos = nodePositions.get(entryNode.id);
    if (!pos) return null;

    return (
      <g className="cycle-entry-marker">
        <circle cx={pos.x} cy={pos.y} r={35} fill="none" stroke="#4caf50" strokeWidth="2" strokeDasharray="4,2" />
        <text x={pos.x} y={pos.y + 50} textAnchor="middle" fontSize="11px" fill="#4caf50" fontWeight="600">
          环入口
        </text>
      </g>
    );
  };

  // 渲染相遇动画
  const renderMeetingAnimation = () => {
    if (!cycleDetected || meetingPoint === null) return null;
    
    const pos = nodePositions.get(meetingPoint);
    if (!pos) return null;

    return (
      <g className="meeting-animation">
        <circle cx={pos.x} cy={pos.y} r={45} fill="#4caf50" opacity={0.2}>
          <animate attributeName="r" values="35;50;35" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x={pos.x} y={pos.y - 65} textAnchor="middle" fontSize="20px">
          🎉
        </text>
      </g>
    );
  };

  // 渲染完成状态
  const renderCompleteIndicator = () => {
    if (currentEventType !== 'CYCLE_DETECTED' && currentEventType !== 'NO_CYCLE') return null;
    
    const isCycle = currentEventType === 'CYCLE_DETECTED';
    const color = isCycle ? '#4caf50' : '#607d8b';
    const text = isCycle ? '🎉 检测到环！' : '✅ 链表无环';
    
    return (
      <g className="complete-indicator">
        <rect x={canvasSize.width / 2 - 80} y={20} width={160} height={40} rx={8}
          fill={color} opacity={0.9} />
        <text x={canvasSize.width / 2} y={46} textAnchor="middle" fontSize="16px" fill="white" fontWeight="bold">
          {text}
        </text>
      </g>
    );
  };

  // 渲染移动轨迹
  const renderMoveTrail = () => {
    if (currentEventType !== 'SLOW_MOVE' && 
        currentEventType !== 'FAST_MOVE_FIRST' && 
        currentEventType !== 'FAST_MOVE_SECOND') {
      return null;
    }

    const isFast = currentEventType.startsWith('FAST');
    const pointerId = isFast ? cyclePointers.fast : cyclePointers.slow;
    if (pointerId === null) return null;

    const pos = nodePositions.get(pointerId);
    if (!pos) return null;

    const color = isFast ? '#f44336' : '#2196f3';

    return (
      <g className="move-trail">
        <circle cx={pos.x} cy={pos.y} r={35} fill={color} opacity={0.15}>
          <animate attributeName="r" values="28;40;28" dur="0.5s" repeatCount="1" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="0.5s" repeatCount="1" />
        </circle>
      </g>
    );
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height}>
        <defs>
          <marker id="arr-fast" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#f44336" />
          </marker>
          <marker id="arr-slow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2196f3" />
          </marker>
          <marker id="arr-conn" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#90a4ae" />
          </marker>
          <marker id="arr-cycle" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#4caf50" />
          </marker>
        </defs>
        {renderActionLabel()}
        {renderCycleEntryMarker()}
        <g className="connections">{renderConnections()}</g>
        {renderMoveTrail()}
        <g className="nodes">
          {currentNodeData.map(node => {
            const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
            const isAtPointer = node.id === cyclePointers.fast || node.id === cyclePointers.slow;
            return (
              <ListNode 
                key={node.id} 
                data={{ 
                  ...node, 
                  position: pos,
                  isActive: isAtPointer,
                  isHighlighted: node.isCycleEntry
                }} 
                nodeRadius={28} 
              />
            );
          })}
        </g>
        <g className="pointers">{renderPointerLabels()}</g>
        {renderMeetingAnimation()}
        {renderStatePanel()}
        {renderCompleteIndicator()}
      </svg>
    </div>
  );
};

export default CycleDetectionCanvas;
