import { ListNodeData, AnimationEvent } from '../types';

/**
 * 递归法实现链表反转的动画事件生成
 * @param nodes 链表节点数组
 * @returns 动画事件数组
 */
export const generateRecursiveReverseEvents = (nodes: ListNodeData[]): AnimationEvent[] => {
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
        newHead: null
      },
      callStack: []
    },
    timestamp: timestamp++
  });

  // 递归调用
  const generateRecursiveEvents = (head: number | null, depth: number): number | null => {
    // 如果头节点为空或者是最后一个节点，则返回
    if (head === null) {
      // 递归基础情况: 空链表
      events.push({
        type: 'RECURSIVE_BASE_NULL',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          pointers: {
            newHead: null
          },
          callStack: generateCallStack(depth, head, null)
        },
        timestamp: timestamp++
      });
      return null;
    }

    const headNode = nodesCopy.find(node => node.id === head);
    if (!headNode) return null;

    // 如果是最后一个节点（无下一个节点）
    if (headNode.next === null) {
      // 递归基础情况: 到达链表末尾
      events.push({
        type: 'RECURSIVE_BASE_LAST',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          pointers: {
            newHead: head
          },
          callStack: generateCallStack(depth, head, head),
          currentNode: head
        },
        timestamp: timestamp++
      });
      return head;
    }

    // 当前节点被激活
    headNode.isActive = true;
    events.push({
      type: 'HIGHLIGHT_NODE',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead: null
        },
        callStack: generateCallStack(depth, head, null),
        currentNode: head
      },
      timestamp: timestamp++
    });

    // 向下递归前保存next节点
    const nextNode = headNode.next;
    events.push({
      type: 'RECURSIVE_CALL',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead: null
        },
        callStack: generateCallStack(depth + 1, nextNode, null),
        currentNode: nextNode
      },
      timestamp: timestamp++
    });

    // 递归调用，返回新的头节点
    const newHead = generateRecursiveEvents(nextNode, depth + 1);

    // 递归回溯，反转当前节点的下一个节点的指针
    if (nextNode !== null) {
      const nextNodeObj = nodesCopy.find(node => node.id === nextNode);
      if (nextNodeObj) {
        nextNodeObj.next = head;
        headNode.isActive = false;
        nextNodeObj.isActive = true;

        events.push({
          type: 'REVERSE_POINTER',
          data: {
            nodes: JSON.parse(JSON.stringify(nodesCopy)),
            pointers: {
              newHead
            },
            callStack: generateCallStack(depth, head, newHead),
            currentNode: nextNode,
            reversedNode: head
          },
          timestamp: timestamp++
        });
      }
    }

    // 将当前节点的next指向null（切断原有连接）
    headNode.next = null;
    headNode.isActive = true;
    events.push({
      type: 'SET_NULL_POINTER',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead
        },
        callStack: generateCallStack(depth, head, newHead),
        currentNode: head
      },
      timestamp: timestamp++
    });

    // 递归回溯
    events.push({
      type: 'RECURSIVE_RETURN',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead
        },
        callStack: generateCallStack(depth - 1, null, newHead),
        currentNode: head
      },
      timestamp: timestamp++
    });

    // 重置当前节点状态
    headNode.isActive = false;

    return newHead;
  };

  // 生成调用栈数据
  const generateCallStack = (depth: number, head: number | null, returnValue: number | null) => {
    const stack = [];
    for (let i = 0; i <= depth; i++) {
      stack.push({
        params: { head: i === depth ? head : null },
        returnValue: i === depth ? returnValue : null
      });
    }
    return stack;
  };

  // 开始递归生成事件
  const newHead = generateRecursiveEvents(nodesCopy[0].id, 0);

  // 完成反转
  events.push({
    type: 'COMPLETE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      pointers: {
        newHead
      },
      callStack: []
    },
    timestamp: timestamp++
  });

  return events;
};

/**
 * 递归法实现链表反转算法
 * @param head 头节点ID
 * @param nodes 链表节点数组
 * @returns 反转后的头节点ID
 */
export const reverseLinkedListRecursive = (
  head: number | null,
  nodes: ListNodeData[]
): number | null => {
  // 基本情况：空链表或只有一个节点的链表
  if (head === null) {
    return null;
  }

  const headNode = nodes.find(node => node.id === head);
  if (!headNode) {
    return null;
  }

  // 如果已经到达最后一个节点
  if (headNode.next === null) {
    return head;
  }

  // 递归反转剩余部分
  const restHead = headNode.next;
  const newHead = reverseLinkedListRecursive(restHead, nodes);

  // 找到restHead对应的节点
  const restHeadNode = nodes.find(node => node.id === restHead);
  if (restHeadNode) {
    // 反转指针
    restHeadNode.next = head;
    headNode.next = null;
  }

  // 返回新的头节点
  return newHead;
}; 