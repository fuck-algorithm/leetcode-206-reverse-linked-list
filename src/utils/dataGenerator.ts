import { ListNodeData } from '../types';

/**
 * 生成示例链表数据
 * @param length 链表长度
 * @param values 可选的自定义值数组
 * @returns 链表节点数组
 */
export const generateLinkedList = (length: number = 5, values?: number[]): ListNodeData[] => {
  const nodes: ListNodeData[] = [];
  
  // 创建节点
  for (let i = 0; i < length; i++) {
    const value = values ? values[i] : i + 1;
    nodes.push({
      id: i + 1,
      value,
      next: i < length - 1 ? i + 2 : null,
      position: { x: 60 + i * 120, y: 200 },
      isActive: false,
      isHighlighted: false
    });
  }
  
  return nodes;
};

/**
 * 生成随机链表数据
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 链表节点数组
 */
export const generateRandomLinkedList = (minLength: number = 3, maxLength: number = 7): ListNodeData[] => {
  // 随机生成链表长度
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  // 随机生成值数组
  const values: number[] = [];
  for (let i = 0; i < length; i++) {
    values.push(Math.floor(Math.random() * 10) + 1);
  }
  
  return generateLinkedList(length, values);
};

/**
 * 根据用户输入创建自定义链表
 * @param values 节点值数组
 * @returns 链表节点数组
 */
export const createCustomLinkedList = (values: number[]): ListNodeData[] => {
  if (!values || values.length === 0) {
    return [];
  }
  
  const nodes: ListNodeData[] = [];
  
  // 创建节点
  for (let i = 0; i < values.length; i++) {
    nodes.push({
      id: i + 1,
      value: values[i],
      next: i < values.length - 1 ? i + 2 : null,
      position: { x: 60 + i * 120, y: 200 },
      isActive: false,
      isHighlighted: false
    });
  }
  
  return nodes;
}; 


// ==================== 环检测相关函数 ====================

import { CyclicListConfig, CyclicListResult } from '../types';

/**
 * 节点数量边界常量
 */
export const CYCLE_NODE_COUNT_MIN = 3;
export const CYCLE_NODE_COUNT_MAX = 10;

/**
 * 限制节点数量在有效范围内
 * @param count 原始节点数量
 * @returns 限制后的节点数量
 */
export const clampNodeCount = (count: number): number => {
  return Math.max(CYCLE_NODE_COUNT_MIN, Math.min(CYCLE_NODE_COUNT_MAX, count));
};

/**
 * 限制环入口索引在有效范围内
 * @param index 原始索引
 * @param nodeCount 节点数量
 * @returns 限制后的索引，null 表示无环
 */
export const clampCycleEntryIndex = (index: number | null, nodeCount: number): number | null => {
  if (index === null || index < 0) {
    return null;
  }
  return Math.min(index, nodeCount - 1);
};

/**
 * 生成带环链表
 * @param config 配置参数
 * @returns 带环链表结果
 */
export const generateCyclicLinkedList = (config: CyclicListConfig): CyclicListResult => {
  // 限制节点数量
  const nodeCount = clampNodeCount(config.nodeCount);
  // 限制环入口索引
  const cycleEntryIndex = clampCycleEntryIndex(config.cycleEntryIndex, nodeCount);
  
  const nodes: ListNodeData[] = [];
  
  // 创建节点
  for (let i = 0; i < nodeCount; i++) {
    const value = i + 1;
    const isInCycle = cycleEntryIndex !== null && i >= cycleEntryIndex;
    const isCycleEntry = cycleEntryIndex !== null && i === cycleEntryIndex;
    
    nodes.push({
      id: value,
      value,
      next: i < nodeCount - 1 ? value + 1 : null, // 暂时设置为线性链表
      position: { x: 0, y: 0 }, // 位置稍后计算
      isActive: false,
      isHighlighted: false,
      isCycleEntry,
      isInCycle
    });
  }
  
  // 如果有环，设置尾节点的 next 指向环入口
  if (cycleEntryIndex !== null && nodes.length > 0) {
    const tailNode = nodes[nodes.length - 1];
    const cycleEntryNode = nodes[cycleEntryIndex];
    tailNode.next = cycleEntryNode.id;
  }
  
  return {
    nodes,
    cycleEntryId: cycleEntryIndex !== null ? nodes[cycleEntryIndex].id : null
  };
};

/**
 * 计算环形布局位置
 * @param nodes 节点数组
 * @param cycleEntryIndex 环入口索引，null 表示无环
 * @param canvasSize 画布尺寸
 * @returns 节点位置映射
 */
export const calculateCyclicLayout = (
  nodes: ListNodeData[],
  cycleEntryIndex: number | null,
  canvasSize: { width: number; height: number }
): Map<number, { x: number; y: number }> => {
  const positions = new Map<number, { x: number; y: number }>();
  
  if (nodes.length === 0) {
    return positions;
  }
  
  const nodeSpacing = 100;
  
  if (cycleEntryIndex === null || cycleEntryIndex >= nodes.length) {
    // 无环：水平线性布局
    const totalWidth = (nodes.length - 1) * nodeSpacing;
    const startX = (canvasSize.width - totalWidth) / 2;
    const centerY = canvasSize.height / 2;
    
    nodes.forEach((node, index) => {
      positions.set(node.id, { x: startX + index * nodeSpacing, y: centerY });
    });
  } else {
    // 有环：线性部分 + 环形部分
    const linearCount = cycleEntryIndex; // 环外节点数量
    const cycleCount = nodes.length - cycleEntryIndex; // 环内节点数量
    
    // 计算环的半径（基于环内节点数量）
    const cycleRadius = Math.max(60, (cycleCount * nodeSpacing) / (2 * Math.PI));
    
    // 计算布局区域
    const linearWidth = linearCount > 0 ? (linearCount - 1) * nodeSpacing : 0;
    const totalWidth = linearWidth + cycleRadius * 2 + nodeSpacing;
    const startX = (canvasSize.width - totalWidth) / 2;
    const centerY = canvasSize.height / 2;
    
    // 环的中心位置
    const cycleCenterX = startX + linearWidth + (linearCount > 0 ? nodeSpacing : 0) + cycleRadius;
    const cycleCenterY = centerY;
    
    nodes.forEach((node, index) => {
      if (index < cycleEntryIndex) {
        // 线性部分：水平排列
        positions.set(node.id, {
          x: startX + index * nodeSpacing,
          y: centerY
        });
      } else {
        // 环形部分：圆形排列
        const cycleIndex = index - cycleEntryIndex;
        // 从右侧开始，顺时针排列
        const angle = -Math.PI / 2 + (cycleIndex / cycleCount) * 2 * Math.PI;
        positions.set(node.id, {
          x: cycleCenterX + cycleRadius * Math.cos(angle),
          y: cycleCenterY + cycleRadius * Math.sin(angle)
        });
      }
    });
  }
  
  return positions;
};

/**
 * 检查节点位置是否形成圆形（用于测试）
 * @param positions 节点位置数组
 * @param tolerance 容差
 * @returns 是否形成圆形
 */
export const arePositionsCircular = (
  positions: Array<{ x: number; y: number }>,
  tolerance: number = 1
): boolean => {
  if (positions.length < 3) {
    return false;
  }
  
  // 计算中心点
  const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
  const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
  
  // 计算每个点到中心的距离
  const distances = positions.map(p => 
    Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
  );
  
  // 检查所有距离是否相等（在容差范围内）
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  return distances.every(d => Math.abs(d - avgDistance) <= tolerance);
};
