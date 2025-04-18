import { ListNodeData, AnimationEvent } from '../types';

/**
 * 迭代法实现链表反转的动画事件生成
 * @param nodes 链表节点数组
 * @returns 动画事件数组
 */
export const generateIterativeReverseEvents = (nodes: ListNodeData[]): AnimationEvent[] => {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const events: AnimationEvent[] = [];
  const nodesCopy = JSON.parse(JSON.stringify(nodes)) as ListNodeData[];
  let timestamp = 0;

  // 事件1: 初始化
  events.push({
    type: 'INITIALIZE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      pointers: {
        prev: null,
        curr: nodesCopy[0].id,
        next: null
      }
    },
    timestamp: timestamp++
  });

  // 启动迭代过程
  let prev: number | null = null;
  let curr: number | null = nodesCopy[0].id;

  // 迭代反转
  while (curr !== null) {
    // 当前节点被激活
    const currNode = nodesCopy.find(node => node.id === curr);
    if (!currNode) break;

    // 更新当前节点状态为激活
    currNode.isActive = true;
    events.push({
      type: 'HIGHLIGHT_NODE',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          prev,
          curr,
          next: null
        }
      },
      timestamp: timestamp++
    });

    // 保存next指针
    const next = currNode.next;
    events.push({
      type: 'SET_NEXT_POINTER',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          prev,
          curr,
          next
        }
      },
      timestamp: timestamp++
    });

    // 反转curr的next指针指向prev
    currNode.next = prev;
    events.push({
      type: 'REVERSE_POINTER',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          prev,
          curr,
          next
        },
        reversedNode: curr
      },
      timestamp: timestamp++
    });

    // 移动prev指针到curr
    prev = curr;
    events.push({
      type: 'MOVE_PREV',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          prev,
          curr,
          next
        }
      },
      timestamp: timestamp++
    });

    // 移动curr指针到next
    curr = next;
    // 重置之前激活的节点
    if (currNode) {
      currNode.isActive = false;
    }
    events.push({
      type: 'MOVE_CURR',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          prev,
          curr,
          next: null
        }
      },
      timestamp: timestamp++
    });
  }

  // 完成反转
  events.push({
    type: 'COMPLETE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      pointers: {
        prev,
        curr: null,
        next: null,
        newHead: prev
      }
    },
    timestamp: timestamp++
  });

  return events;
};

/**
 * 迭代法实现链表反转算法
 * @param head 头节点ID
 * @param nodes 链表节点数组
 * @returns 反转后的头节点ID
 */
export const reverseLinkedListIterative = (
  head: number | null,
  nodes: ListNodeData[]
): number | null => {
  if (head === null || nodes.length === 0) {
    return null;
  }

  let prev: number | null = null;
  let curr = head;
  let next: number | null = null;

  while (curr !== null) {
    const currentNode = nodes.find(node => node.id === curr);
    if (!currentNode) break;

    next = currentNode.next;
    currentNode.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}; 