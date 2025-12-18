import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import { ListNodeData } from '../types';

const RecursiveCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentNodeData, pointers, callStack } = useSelector((state: RootState) => state.animation);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const nodeSpacing = 100;

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

  // 渲染递归调用栈可视化（栈顶在上方）
  const renderCallStack = () => {
    if (!callStack || callStack.length === 0) return null;
    
    const stackX = 20;
    const stackY = 20;
    const itemHeight = 28;
    const stackWidth = 140;
    
    // 反转数组，让最新的调用（栈顶）显示在最上面
    const reversedStack = [...callStack].reverse();
    
    return (
      <g className="call-stack">
        <text x={stackX} y={stackY} fontSize="12px" fontWeight="bold" fill="#495057">递归调用栈 (栈顶↓)</text>
        {reversedStack.map((frame: { params: { head: number | null }; returnValue: number | null }, i: number) => {
          const y = stackY + 15 + i * itemHeight;
          const isTop = i === 0; // 反转后，索引0是栈顶
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
              <text x={stackX + 8} y={y + 17} fontSize="11px" fontFamily="monospace" fill="#333">
                reverseList({frame.params.head ?? 'null'})
              </text>
              {frame.returnValue !== null && (
                <text x={stackX + stackWidth - 8} y={y + 17} fontSize="10px" fill="#4caf50" textAnchor="end">
                  → {frame.returnValue}
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
        <rect x={panelX - 10} y={15} width={120} height={70} rx={6} fill="#f8f9fa" stroke="#dee2e6" />
        <text x={panelX} y={35} fontSize="12px" fontWeight="bold" fill="#495057">递归状态</text>
        <text x={panelX} y={55} fontSize="12px" fontFamily="monospace" fill="#333">
          栈深度: {callStack?.length || 0}
        </text>
        <text x={panelX} y={73} fontSize="12px" fontFamily="monospace" fill="#333">
          newHead = {pointers.newHead ?? 'null'}
        </text>
      </g>
    );
  };

  // 渲染当前处理节点的标记
  const renderCurrentMarker = () => {
    if (!callStack || callStack.length === 0) return null;
    const topFrame = callStack[callStack.length - 1];
    if (topFrame.params.head === null) return null;
    
    const pos = nodePositions.get(topFrame.params.head);
    if (!pos) return null;
    
    return (
      <g>
        <text x={pos.x} y={pos.y - 50} textAnchor="middle" fontSize="13px" fontWeight="bold" fill="#2196f3">
          head
        </text>
        <line x1={pos.x} y1={pos.y - 45} x2={pos.x} y2={pos.y - 33} stroke="#2196f3" strokeWidth="2" markerEnd="url(#arr-head)" />
      </g>
    );
  };

  // 渲染连接线
  const renderConnections = () => {
    return currentNodeData.map((node: ListNodeData) => {
      if (node.next === null) return null;
      const nextNode = currentNodeData.find((n: ListNodeData) => n.id === node.next);
      if (!nextNode) return null;
      const p1 = nodePositions.get(node.id);
      const p2 = nodePositions.get(nextNode.id);
      if (!p1 || !p2) return null;
      return (
        <line key={`conn-${node.id}`} x1={p1.x + 28} y1={p1.y} x2={p2.x - 28} y2={p2.y} stroke="#90a4ae" strokeWidth="2" markerEnd="url(#arr-conn)" />
      );
    });
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg ref={svgRef} width={canvasSize.width} height={canvasSize.height}>
        <defs>
          <marker id="arr-head" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2196f3" />
          </marker>
          <marker id="arr-conn" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#90a4ae" />
          </marker>
        </defs>
        <g className="connections">{renderConnections()}</g>
        <g className="nodes">
          {currentNodeData.map(node => {
            const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
            return <ListNode key={node.id} data={{ ...node, position: pos }} nodeRadius={26} />;
          })}
        </g>
        {renderCurrentMarker()}
        {renderCallStack()}
        {renderStatePanel()}
      </svg>
    </div>
  );
};

export default RecursiveCanvas;
