import { ListNodeData, AnimationEvent } from '../types';

// 调用栈帧类型
interface CallStackFrame {
  params: { head: number | null };
  returnValue: number | null;
}

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
  
  // 维护实际的调用栈状态
  const callStackState: CallStackFrame[] = [];
  
  // 深拷贝当前调用栈状态
  const cloneCallStack = (): CallStackFrame[] => {
    return JSON.parse(JSON.stringify(callStackState));
  };

  // 事件1: 初始化
  events.push({
    type: 'INITIALIZE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      pointers: {
        newHead: null
      },
      callStack: [],
      description: '开始递归反转链表，从头节点开始'
    },
    timestamp: timestamp++
  });

  // 递归调用
  const generateRecursiveEvents = (head: number | null): number | null => {
    // 如果头节点为空
    if (head === null) {
      // 递归基础情况: 空链表
      events.push({
        type: 'RECURSIVE_BASE_NULL',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          pointers: {
            newHead: null
          },
          callStack: cloneCallStack(),
          description: '遇到空节点，返回 null'
        },
        timestamp: timestamp++
      });
      return null;
    }

    const headNode = nodesCopy.find(node => node.id === head);
    if (!headNode) return null;

    // 压入调用栈
    callStackState.push({ params: { head }, returnValue: null });

    // 如果是最后一个节点（无下一个节点）
    if (headNode.next === null) {
      // 设置返回值
      callStackState[callStackState.length - 1].returnValue = head;
      
      // 递归基础情况: 到达链表末尾
      events.push({
        type: 'RECURSIVE_BASE_LAST',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          pointers: {
            newHead: head
          },
          callStack: cloneCallStack(),
          currentNode: head,
          description: `到达链表末尾！节点 ${headNode.value} 是最后一个节点，它将成为新的头节点 (newHead = ${headNode.value})`
        },
        timestamp: timestamp++
      });
      
      // 弹出调用栈
      callStackState.pop();
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
        callStack: cloneCallStack(),
        currentNode: head,
        description: `进入 reverseList(${headNode.value})，当前处理节点 ${headNode.value}`
      },
      timestamp: timestamp++
    });

    // 向下递归前保存next节点
    const nextNode = headNode.next;
    const nextNodeObj = nodesCopy.find(n => n.id === nextNode);
    events.push({
      type: 'RECURSIVE_CALL',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead: null
        },
        callStack: cloneCallStack(),
        currentNode: nextNode,
        description: `递归调用 reverseList(${nextNodeObj?.value})，先处理后面的节点`
      },
      timestamp: timestamp++
    });

    // 递归调用，返回新的头节点
    const newHead = generateRecursiveEvents(nextNode);

    // 更新当前栈帧的返回值
    if (callStackState.length > 0) {
      callStackState[callStackState.length - 1].returnValue = newHead;
    }

    // 递归回溯，反转当前节点的下一个节点的指针
    if (nextNode !== null) {
      const nextNodeObjForReverse = nodesCopy.find(node => node.id === nextNode);
      if (nextNodeObjForReverse) {
        nextNodeObjForReverse.next = head;
        headNode.isActive = false;
        nextNodeObjForReverse.isActive = true;

        events.push({
          type: 'REVERSE_POINTER',
          data: {
            nodes: JSON.parse(JSON.stringify(nodesCopy)),
            pointers: {
              newHead
            },
            callStack: cloneCallStack(),
            currentNode: nextNode,
            reversedNode: head,
            description: `回溯中：执行 head.next.next = head，即 ${nextNodeObjForReverse.value}.next = ${headNode.value}，反转指针方向`
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
        callStack: cloneCallStack(),
        currentNode: head,
        description: `执行 head.next = null，即 ${headNode.value}.next = null，切断原来的连接`
      },
      timestamp: timestamp++
    });

    // 弹出调用栈
    callStackState.pop();

    // 递归回溯
    const newHeadNode = nodesCopy.find(n => n.id === newHead);
    events.push({
      type: 'RECURSIVE_RETURN',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        pointers: {
          newHead
        },
        callStack: cloneCallStack(),
        currentNode: head,
        description: `返回 newHead = ${newHeadNode?.value}，继续回溯到上一层`
      },
      timestamp: timestamp++
    });

    // 重置当前节点状态
    headNode.isActive = false;

    return newHead;
  };

  // 开始递归生成事件
  const newHead = generateRecursiveEvents(nodesCopy[0].id);

  // 完成反转
  const finalHeadNode = nodesCopy.find(n => n.id === newHead);
  events.push({
    type: 'COMPLETE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      pointers: {
        newHead
      },
      callStack: [],
      description: `🎉 反转完成！新的头节点是 ${finalHeadNode?.value}`
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