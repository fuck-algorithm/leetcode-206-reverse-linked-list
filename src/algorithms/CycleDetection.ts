import { ListNodeData, CycleAnimationEvent, CycleEventType } from '../types';

/**
 * 环检测算法动画事件生成
 * 使用 Floyd's Tortoise and Hare 算法（快慢指针）
 * 
 * @param nodes 链表节点数组
 * @returns 动画事件数组
 */
export const generateCycleDetectionEvents = (nodes: ListNodeData[]): CycleAnimationEvent[] => {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const events: CycleAnimationEvent[] = [];
  const nodesCopy = JSON.parse(JSON.stringify(nodes)) as ListNodeData[];
  let timestamp = 0;

  // 构建节点 ID 到节点的映射
  const nodeMap = new Map<number, ListNodeData>();
  nodesCopy.forEach(node => nodeMap.set(node.id, node));

  // 获取头节点
  const head = nodesCopy[0];
  if (!head) {
    return [];
  }

  // 事件1: 初始化 - fast = head, slow = head
  events.push({
    type: 'CYCLE_INITIALIZE',
    data: {
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      cyclePointers: {
        fast: head.id,
        slow: head.id
      },
      description: '初始化：fast = head, slow = head（快慢指针都指向头节点）'
    },
    timestamp: timestamp++
  });

  let fast: number | null = head.id;
  let slow: number | null = head.id;

  // 迭代检测环
  while (true) {
    // 检查 fast 是否为 null
    if (fast === null) {
      events.push({
        type: 'NO_CYCLE',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          cyclePointers: { fast: null, slow },
          description: '🔍 fast = null，链表无环，算法结束'
        },
        timestamp: timestamp++
      });
      break;
    }

    const fastNode = nodeMap.get(fast);
    if (!fastNode) {
      break;
    }

    // 检查 fast.next 是否为 null
    events.push({
      type: 'CHECK_NULL',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        cyclePointers: { fast, slow },
        description: `检查 fast.next 是否为 null：fast.next = ${fastNode.next === null ? 'null' : nodeMap.get(fastNode.next)?.value}`
      },
      timestamp: timestamp++
    });

    if (fastNode.next === null) {
      events.push({
        type: 'NO_CYCLE',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          cyclePointers: { fast, slow },
          description: '🔍 fast.next = null，链表无环，算法结束'
        },
        timestamp: timestamp++
      });
      break;
    }

    // slow 移动一步
    const slowNode = nodeMap.get(slow!);
    if (!slowNode) break;
    
    const newSlow = slowNode.next;
    const newSlowNode = newSlow !== null ? nodeMap.get(newSlow) : null;
    
    events.push({
      type: 'SLOW_MOVE',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        cyclePointers: { fast, slow: newSlow },
        description: `🐢 slow 移动一步：slow = slow.next = ${newSlowNode?.value ?? 'null'}`
      },
      timestamp: timestamp++
    });
    slow = newSlow;

    // fast 移动第一步
    const fastNext1 = fastNode.next;
    const fastNext1Node = fastNext1 !== null ? nodeMap.get(fastNext1) : null;
    
    events.push({
      type: 'FAST_MOVE_FIRST',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        cyclePointers: { fast: fastNext1, slow },
        description: `🐰 fast 移动第一步：fast = fast.next = ${fastNext1Node?.value ?? 'null'}`
      },
      timestamp: timestamp++
    });
    fast = fastNext1;

    // 检查 fast 是否为 null（第一步后）
    if (fast === null) {
      events.push({
        type: 'NO_CYCLE',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          cyclePointers: { fast: null, slow },
          description: '🔍 fast = null，链表无环，算法结束'
        },
        timestamp: timestamp++
      });
      break;
    }

    const fastNode2 = nodeMap.get(fast);
    if (!fastNode2) break;

    // 检查 fast.next 是否为 null（第二步前）
    if (fastNode2.next === null) {
      events.push({
        type: 'NO_CYCLE',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          cyclePointers: { fast, slow },
          description: '🔍 fast.next = null，链表无环，算法结束'
        },
        timestamp: timestamp++
      });
      break;
    }

    // fast 移动第二步
    const fastNext2 = fastNode2.next;
    const fastNext2Node = fastNext2 !== null ? nodeMap.get(fastNext2) : null;
    
    events.push({
      type: 'FAST_MOVE_SECOND',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        cyclePointers: { fast: fastNext2, slow },
        description: `🐰 fast 移动第二步：fast = fast.next = ${fastNext2Node?.value ?? 'null'}`
      },
      timestamp: timestamp++
    });
    fast = fastNext2;

    // 比较 fast 和 slow
    events.push({
      type: 'COMPARE_POINTERS',
      data: {
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        cyclePointers: { fast, slow },
        description: `比较指针：fast(${nodeMap.get(fast!)?.value}) ${fast === slow ? '==' : '!='} slow(${nodeMap.get(slow!)?.value})`
      },
      timestamp: timestamp++
    });

    // 检测到环
    if (fast === slow) {
      const meetingNode = nodeMap.get(fast!);
      events.push({
        type: 'CYCLE_DETECTED',
        data: {
          nodes: JSON.parse(JSON.stringify(nodesCopy)),
          cyclePointers: { fast, slow },
          meetingPoint: fast,
          description: `🎉 检测到环！快慢指针在节点 ${meetingNode?.value} 相遇`
        },
        timestamp: timestamp++
      });
      break;
    }
  }

  return events;
};

/**
 * 环检测算法（纯逻辑，不生成事件）
 * @param head 头节点 ID
 * @param nodes 链表节点数组
 * @returns 是否存在环
 */
export const hasCycle = (head: number | null, nodes: ListNodeData[]): boolean => {
  if (head === null || nodes.length === 0) {
    return false;
  }

  const nodeMap = new Map<number, ListNodeData>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  let fast: number | null = head;
  let slow: number | null = head;

  while (fast !== null) {
    const fastNode = nodeMap.get(fast);
    if (!fastNode || fastNode.next === null) {
      return false;
    }

    // slow 移动一步
    const slowNode = nodeMap.get(slow!);
    if (!slowNode) return false;
    slow = slowNode.next;

    // fast 移动两步
    const fastNext1 = fastNode.next;
    const fastNext1Node = fastNext1 !== null ? nodeMap.get(fastNext1) : null;
    if (!fastNext1Node) {
      return false;
    }
    fast = fastNext1Node.next;

    // 检测相遇
    if (fast === slow) {
      return true;
    }
  }

  return false;
};

/**
 * 获取环检测代码行映射
 * @param eventType 事件类型
 * @returns 对应的代码行号
 */
export const getCycleDetectionCodeLine = (eventType: CycleEventType | string): number => {
  const lineMap: Record<string, number> = {
    'CYCLE_INITIALIZE': 2,    // ListNode fast = head, slow = head;
    'CHECK_NULL': 3,          // while(fast != null && fast.next != null)
    'SLOW_MOVE': 5,           // slow = slow.next;
    'FAST_MOVE_FIRST': 4,     // fast = fast.next.next; (第一步)
    'FAST_MOVE_SECOND': 4,    // fast = fast.next.next; (第二步)
    'COMPARE_POINTERS': 6,    // if (fast == slow)
    'CYCLE_DETECTED': 7,      // return true;
    'NO_CYCLE': 10            // return false;
  };
  
  return lineMap[eventType] ?? 1;
};

/**
 * 环检测 Java 代码
 */
export const CYCLE_DETECTION_JAVA_CODE = `public boolean hasCycle(ListNode head) {
    ListNode fast = head, slow = head;
    while(fast != null && fast.next != null) {
        fast = fast.next.next;
        slow = slow.next;
        if (fast == slow) {
            return true;
        }
    }
    return false;
}`;
