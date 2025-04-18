import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../store';
import ListNode from './ListNode';
import Pointer from './Pointer';
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
  const { currentNodeData, pointers, animationMethod, callStack } = useSelector(
    (state: RootState) => state.animation
  );
  const dispatch = useDispatch();
  const [canvasReady, setCanvasReady] = useState(false);

  // 初始化D3画布
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    setCanvasReady(true);
  }, [width, height]);

  // 计算节点位置
  useEffect(() => {
    if (!canvasReady || currentNodeData.length === 0) return;

    // 更新节点位置
    const updatedNodes = currentNodeData.map((node, index) => {
      // 计算初始位置
      let x = 60 + index * nodeSpacing;
      let y = 200;

      // 递归法时的特殊位置处理
      if (animationMethod === 'recursive' && callStack && callStack.length > 0) {
        // 如果是递归调用中的节点，根据调用栈深度调整位置
        const isInStack = callStack.some(frame => frame.params.head === node.id);
        if (isInStack) {
          // 计算栈中的位置
          const stackIndex = callStack.findIndex(frame => frame.params.head === node.id);
          if (stackIndex >= 0) {
            // 向右上方偏移
            x += stackIndex * 20;
            y -= stackIndex * 30;
          }
        }
      }

      return {
        ...node,
        position: { x, y }
      };
    });

    return () => {
      // 清理函数
    };
  }, [currentNodeData, canvasReady, nodeSpacing, animationMethod, callStack]);

  // 渲染注释和标记
  const renderAnnotations = () => {
    if (animationMethod === 'iterative') {
      // 迭代法的注释
      return (
        <g className="annotations">
          <text x={width - 300} y={50} fontSize="16px" fontFamily="monospace">
            prev = {pointers.prev === null ? 'null' : pointers.prev}
          </text>
          <text x={width - 300} y={80} fontSize="16px" fontFamily="monospace">
            curr = {pointers.curr === null ? 'null' : pointers.curr}
          </text>
          <text x={width - 300} y={110} fontSize="16px" fontFamily="monospace">
            next = {pointers.next === null ? 'null' : pointers.next}
          </text>
        </g>
      );
    } else {
      // 递归法的注释
      return (
        <g className="annotations">
          <text x={width - 300} y={50} fontSize="16px" fontFamily="monospace">
            递归调用栈深度: {callStack?.length || 0}
          </text>
          <text x={width - 300} y={80} fontSize="16px" fontFamily="monospace">
            newHead = {pointers.newHead === null ? 'null' : pointers.newHead}
          </text>
        </g>
      );
    }
  };

  // 渲染指针
  const renderPointers = () => {
    const pointerElements = [];

    if (pointers.prev !== null) {
      const prevNode = currentNodeData.find(node => node.id === pointers.prev);
      if (prevNode && prevNode.position) {
        pointerElements.push(
          <Pointer
            key="prev-pointer"
            id="prev-pointer"
            sourceX={60}
            sourceY={100}
            targetX={prevNode.position.x}
            targetY={prevNode.position.y - 30}
            label="prev"
            color="#9c27b0"
          />
        );
      }
    }

    if (pointers.curr !== null) {
      const currNode = currentNodeData.find(node => node.id === pointers.curr);
      if (currNode && currNode.position) {
        pointerElements.push(
          <Pointer
            key="curr-pointer"
            id="curr-pointer"
            sourceX={60}
            sourceY={130}
            targetX={currNode.position.x}
            targetY={currNode.position.y - 30}
            label="curr"
            color="#2196f3"
          />
        );
      }
    }

    if (pointers.next !== null) {
      const nextNode = currentNodeData.find(node => node.id === pointers.next);
      if (nextNode && nextNode.position) {
        pointerElements.push(
          <Pointer
            key="next-pointer"
            id="next-pointer"
            sourceX={60}
            sourceY={160}
            targetX={nextNode.position.x}
            targetY={nextNode.position.y - 30}
            label="next"
            color="#ff9800"
          />
        );
      }
    }

    return pointerElements;
  };

  // 渲染节点之间的连接
  const renderConnections = () => {
    return currentNodeData.map(node => {
      if (node.next !== null) {
        const nextNode = currentNodeData.find(n => n.id === node.next);
        if (nextNode && node.position && nextNode.position) {
          return (
            <Pointer
              key={`connection-${node.id}-${nextNode.id}`}
              id={`connection-${node.id}-${nextNode.id}`}
              sourceX={node.position.x + 30}
              sourceY={node.position.y}
              targetX={nextNode.position.x - 30}
              targetY={nextNode.position.y}
              label=""
              color="#616161"
              curved={true}
            />
          );
        }
      }
      return null;
    });
  };

  return (
    <svg ref={svgRef} className="animation-canvas" width={width} height={height}>
      <g className="nodes">
        {currentNodeData.map(node => (
          <ListNode
            key={node.id}
            data={node}
            onNodeClick={onNodeClick}
          />
        ))}
      </g>
      <g className="connections">
        {renderConnections()}
      </g>
      <g className="pointers">
        {renderPointers()}
      </g>
      {renderAnnotations()}
    </svg>
  );
};

export default AnimationCanvas; 