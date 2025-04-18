import { ListNodeData } from '../types';

/**
 * 生成示例链表数据
 * @param length 链表长度
 * @param startValue 起始值
 * @returns 链表节点数组
 */
export const generateLinkedList = (length: number = 5, startValue: number = 1): ListNodeData[] => {
  const nodes: ListNodeData[] = [];
  
  // 创建节点
  for (let i = 0; i < length; i++) {
    const value = startValue + i;
    nodes.push({
      id: value,
      value,
      next: i < length - 1 ? value + 1 : null,
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
  
  // 随机生成起始值
  const startValue = Math.floor(Math.random() * 10) + 1;
  
  return generateLinkedList(length, startValue);
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