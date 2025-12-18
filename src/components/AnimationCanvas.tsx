import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import { ListNodeData } from '../types';

interface AnimationCanvasProps {
  width?: number;
  height?: number;
  nodeSpacing?: number;
  onNodeClick?: (node: ListNodeData) => void;
}

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  width = 800,
  height = 400,
  nodeSpacing = 120,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentNodeData, pointers, animationMethod, callStack } = useSelector(
    (state: RootState) => state.animation
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  // 响应式调整画布大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 8; // 减去 padding
        const containerHeight = container.clientHeight - 8;
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

  // 初始化D3画布
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr('width', canvasSize.width).attr('height', canvasSize.height);

    setCanvasReady(true);
  }, [canvasSize.width, canvasSize.height]);

  // 计算节点位置 - 使用本地状态存储位置信息
  const [nodePositions, setNodePositions] = React.useState<Map<number, { x: number; y: number }>>(new Map());

  useEffect(() => {
    if (!canvasReady || currentNodeData.length === 0) return;

    // 计算节点位置
    const positions = new Map<number, { x: number; y: number }>();
    
    // 计算链表总宽度，用于居中
    const totalWidth = (currentNodeData.length - 1) * nodeSpacing;
    const startX = (canvasSize.width - totalWidth) / 2;
    const centerY = canvasSize.height / 2;
    
    currentNodeData.forEach((node: ListNodeData, index: number) => {
      // 计算居中位置
      let x = startX + index * nodeSpacing;
      let y = centerY;

      // 递归法时的特殊位置处理
      if (animationMethod === 'recursive' && callStack && callStack.length > 0) {
        // 如果是递归调用中的节点，根据调用栈深度调整位置
        const isInStack = callStack.some((frame: { params: { head: number | null }; returnValue: number | null }) => frame.params.head === node.id);
        if (isInStack) {
          // 计算栈中的位置
          const stackIndex = callStack.findIndex((frame: { params: { head: number | null }; returnValue: number | null }) => frame.params.head === node.id);
          if (stackIndex >= 0) {
            // 向右上方偏移
            x += stackIndex * 20;
            y -= stackIndex * 30;
          }
        }
      }

      // 存储位置到 Map 中
      positions.set(node.id, { x, y });
    });

    setNodePositions(positions);
  }, [currentNodeData, canvasReady, nodeSpacing, animationMethod, callStack, canvasSize.width, canvasSize.height]);

  // 渲染变量状态面板（右上角）
  const renderAnnotations = () => {
    const panelX = canvasSize.width - 140;
    const panelY = 20;
    
    if (animationMethod === 'iterative') {
      return (
        <g className="annotations">
          {/* 背景面板 */}
          <rect
            x={panelX - 10}
            y={panelY - 5}
            width={130}
            height={100}
            rx={6}
            fill="#f5f5f5"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          <text x={panelX} y={panelY + 18} fontSize="13px" fontFamily="monospace" fontWeight="bold" fill="#546e7a">
            变量状态
          </text>
          <text x={panelX} y={panelY + 42} fontSize="13px" fontFamily="monospace">
            <tspan fill="#9c27b0">prev</tspan>
            <tspan fill="#333"> = {pointers.prev === null ? 'null' : pointers.prev}</tspan>
          </text>
          <text x={panelX} y={panelY + 62} fontSize="13px" fontFamily="monospace">
            <tspan fill="#2196f3">curr</tspan>
            <tspan fill="#333"> = {pointers.curr === null ? 'null' : pointers.curr}</tspan>
          </text>
          <text x={panelX} y={panelY + 82} fontSize="13px" fontFamily="monospace">
            <tspan fill="#ff9800">next</tspan>
            <tspan fill="#333"> = {pointers.next === null ? 'null' : pointers.next}</tspan>
          </text>
        </g>
      );
    } else {
      return (
        <g className="annotations">
          <rect
            x={panelX - 10}
            y={panelY - 5}
            width={130}
            height={70}
            rx={6}
            fill="#f5f5f5"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          <text x={panelX} y={panelY + 18} fontSize="13px" fontFamily="monospace" fontWeight="bold" fill="#546e7a">
            递归状态
          </text>
          <text x={panelX} y={panelY + 42} fontSize="13px" fontFamily="monospace" fill="#333">
            栈深度: {callStack?.length || 0}
          </text>
          <text x={panelX} y={panelY + 62} fontSize="13px" fontFamily="monospace" fill="#333">
            newHead = {pointers.newHead === null ? 'null' : pointers.newHead}
          </text>
        </g>
      );
    }
  };

  // 渲染指针标签（简洁的垂直箭头指向节点）
  const renderPointerLabels = () => {
    const labels: React.ReactNode[] = [];

    // 收集所有指向同一节点的指针
    const nodePointers: Map<number, string[]> = new Map();
    
    if (pointers.prev !== null) {
      const existing = nodePointers.get(pointers.prev) || [];
      existing.push('prev');
      nodePointers.set(pointers.prev, existing);
    }
    if (pointers.curr !== null) {
      const existing = nodePointers.get(pointers.curr) || [];
      existing.push('curr');
      nodePointers.set(pointers.curr, existing);
    }
    if (pointers.next !== null) {
      const existing = nodePointers.get(pointers.next) || [];
      existing.push('next');
      nodePointers.set(pointers.next, existing);
    }

    // 为每个节点渲染指针标签
    nodePointers.forEach((pointerNames, nodeId) => {
      const position = nodePositions.get(nodeId);
      if (!position) return;

      pointerNames.forEach((name, index) => {
        const color = name === 'prev' ? '#9c27b0' : name === 'curr' ? '#2196f3' : '#ff9800';
        const xOffset = (index - (pointerNames.length - 1) / 2) * 40; // 均匀分布
        
        labels.push(
          <g key={`label-${name}-${nodeId}`}>
            {/* 指针标签 */}
            <text
              x={position.x + xOffset}
              y={position.y - 55}
              textAnchor="middle"
              fontSize="14px"
              fontWeight="bold"
              fill={color}
            >
              {name}
            </text>
            {/* 垂直箭头 */}
            <line
              x1={position.x + xOffset}
              y1={position.y - 50}
              x2={position.x + xOffset}
              y2={position.y - 35}
              stroke={color}
              strokeWidth="2"
              markerEnd={`url(#arrow-${name})`}
            />
          </g>
        );
      });
    });

    return labels;
  };

  // 渲染节点之间的连接（简洁的水平箭头）
  const renderConnections = () => {
    return currentNodeData.map((node: ListNodeData) => {
      if (node.next !== null) {
        const nextNode = currentNodeData.find((n: ListNodeData) => n.id === node.next);
        if (nextNode) {
          const nodePos = nodePositions.get(node.id);
          const nextPos = nodePositions.get(nextNode.id);
          if (nodePos && nextPos) {
            // 简洁的水平连接线
            return (
              <g key={`connection-${node.id}-${nextNode.id}`}>
                <line
                  x1={nodePos.x + 32}
                  y1={nodePos.y}
                  x2={nextPos.x - 32}
                  y2={nextPos.y}
                  stroke="#78909c"
                  strokeWidth="2"
                  markerEnd="url(#arrow-connection)"
                />
              </g>
            );
          }
        }
      }
      return null;
    });
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg ref={svgRef} className="animation-canvas" width={canvasSize.width} height={canvasSize.height}>
        {/* 定义箭头标记 */}
        <defs>
          <marker id="arrow-prev" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#9c27b0" />
          </marker>
          <marker id="arrow-curr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2196f3" />
          </marker>
          <marker id="arrow-next" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff9800" />
          </marker>
          <marker id="arrow-connection" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#78909c" />
          </marker>
        </defs>
        
        <g className="connections">
          {renderConnections()}
        </g>
        <g className="nodes">
          {currentNodeData.map(node => {
            const position = nodePositions.get(node.id) || node.position || { x: 0, y: 0 };
            return (
              <ListNode
                key={node.id}
                data={{ ...node, position }}
                onNodeClick={onNodeClick}
              />
            );
          })}
        </g>
        <g className="pointer-labels">
          {renderPointerLabels()}
        </g>
        {renderAnnotations()}
      </svg>
    </div>
  );
};

export default AnimationCanvas; 