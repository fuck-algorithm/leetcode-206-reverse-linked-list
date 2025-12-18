import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PointerProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  label: string;
  color?: string;
  animated?: boolean;
  curved?: boolean;
}

const Pointer: React.FC<PointerProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  color = '#d32f2f',
  animated = false,
  curved = false
}) => {
  const pointerRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!pointerRef.current) return;

    const pointerGroup = d3.select(pointerRef.current);
    const arrowPath = pointerGroup.select('path');
    const labelText = pointerGroup.select('text');

    // 计算箭头路径
    let path;
    if (curved) {
      // 曲线路径，用于next指针
      const midX = (sourceX + targetX) / 2;
      const midY = sourceY - 40; // 弯曲向上
      path = `M${sourceX},${sourceY} Q${midX},${midY} ${targetX},${targetY}`;
    } else {
      // 直线路径，用于prev/curr指针
      path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
    }

    // 计算箭头方向 (unused but kept for potential future use)
    // const dx = targetX - sourceX;
    // const dy = targetY - sourceY;
    // const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 更新路径
    arrowPath
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .attr('d', path);

    // 更新标签位置
    const labelX = curved ? (sourceX + targetX) / 2 : (sourceX + targetX) / 2;
    const labelY = curved ? sourceY - 50 : (sourceY + targetY) / 2 - 10;

    labelText
      .transition()
      .duration(500)
      .attr('x', labelX)
      .attr('y', labelY);

    // 添加动画效果
    if (animated) {
      arrowPath
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-dashoffset', 0)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 10)
        .on('end', function repeat() {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const element = this;
          d3.select(element)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on('end', repeat);
        });
    } else {
      arrowPath.attr('stroke-dasharray', null);
    }
  }, [sourceX, sourceY, targetX, targetY, curved, animated, color]);

  // 计算初始路径
  let initialPath;
  if (curved) {
    const midX = (sourceX + targetX) / 2;
    const midY = sourceY - 40;
    initialPath = `M${sourceX},${sourceY} Q${midX},${midY} ${targetX},${targetY}`;
  } else {
    initialPath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  }

  // 计算标签位置
  const labelX = curved ? (sourceX + targetX) / 2 : (sourceX + targetX) / 2;
  const labelY = curved ? sourceY - 50 : (sourceY + targetY) / 2 - 10;

  return (
    <g ref={pointerRef} className="pointer" id={id}>
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <path
        d={initialPath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrowhead-${id})`}
        strokeDasharray={animated ? '5,5' : ''}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize="14px"
        fontWeight="bold"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
};

export default Pointer; 