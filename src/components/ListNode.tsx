import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ListNodeData } from '../types';

interface ListNodeProps {
  data: ListNodeData;
  nodeRadius?: number;
  onNodeClick?: (node: ListNodeData) => void;
}

const ListNode: React.FC<ListNodeProps> = ({ 
  data, 
  nodeRadius = 30, 
  onNodeClick 
}) => {
  const nodeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;

    const node = d3.select(nodeRef.current);

    // 更新节点位置
    node
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .attr('transform', `translate(${data.position?.x || 0},${data.position?.y || 0})`);

    // 更新节点颜色和边框
    node.select('circle')
      .transition()
      .duration(300)
      .attr('fill', data.isActive ? '#ff8a65' : (data.isHighlighted ? '#80cbc4' : '#4fc3f7'))
      .attr('stroke', data.isActive ? '#d32f2f' : (data.isHighlighted ? '#00897b' : '#0277bd'))
      .attr('stroke-width', data.isActive || data.isHighlighted ? 3 : 2);
  }, [data]);

  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(data);
    }
  };

  return (
    <g 
      ref={nodeRef} 
      className={`list-node ${data.isActive ? 'active' : ''} ${data.isHighlighted ? 'highlighted' : ''}`}
      transform={`translate(${data.position?.x || 0},${data.position?.y || 0})`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <circle 
        r={nodeRadius} 
        fill={data.isActive ? '#ff8a65' : (data.isHighlighted ? '#80cbc4' : '#4fc3f7')}
        stroke={data.isActive ? '#d32f2f' : (data.isHighlighted ? '#00897b' : '#0277bd')}
        strokeWidth={data.isActive || data.isHighlighted ? 3 : 2}
      />
      <text 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="16px"
        fontWeight="bold"
        fill="#212121"
      >
        {data.value}
      </text>
    </g>
  );
};

export default ListNode; 