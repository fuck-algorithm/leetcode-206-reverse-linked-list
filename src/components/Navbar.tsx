import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getGitHubStars } from '../utils/githubStars';
import '../styles/Navbar.css';

// 算法思路内容
const ALGORITHM_THOUGHTS: Record<string, { title: string; content: string }> = {
  iterative: {
    title: '迭代法思路',
    content: `迭代法反转链表的核心思想是使用三个指针：

1. prev：指向已反转部分的头节点（初始为 null）
2. curr：指向当前正在处理的节点（初始为 head）
3. next：临时保存 curr 的下一个节点

每次迭代执行以下步骤：
① 保存 next = curr.next（防止断链后丢失后续节点）
② 反转指针 curr.next = prev
③ 移动 prev = curr
④ 移动 curr = next

时间复杂度：O(n)，遍历一次链表
空间复杂度：O(1)，只使用常数个指针`
  },
  recursive: {
    title: '递归法思路',
    content: `递归法反转链表的核心思想是：

1. 递归到链表末尾，找到新的头节点
2. 回溯时，将每个节点的 next 指针反转

递归过程：
① 基准条件：head 为空或只有一个节点，直接返回
② 递归调用：newHead = reverseList(head.next)
③ 反转指针：head.next.next = head
④ 断开原连接：head.next = null
⑤ 返回新头节点：return newHead

时间复杂度：O(n)，递归遍历每个节点
空间复杂度：O(n)，递归调用栈深度`
  },
  'cycle-detection': {
    title: '环检测思路',
    content: `Floyd 快慢指针算法（龟兔赛跑算法）：

1. 使用两个指针：slow（慢指针）和 fast（快指针）
2. slow 每次移动一步，fast 每次移动两步
3. 如果存在环，fast 最终会追上 slow

原理：
- 如果链表有环，fast 会先进入环
- 由于 fast 比 slow 快，它们最终会在环内相遇
- 如果链表无环，fast 会先到达 null

时间复杂度：O(n)
空间复杂度：O(1)`
  }
};

const Navbar: React.FC = () => {
  const [stars, setStars] = useState<number>(0);
  const [showThoughts, setShowThoughts] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 获取 GitHub Star 数
    getGitHubStars('fuck-algorithm', 'leetcode-206-reverse-linked-list')
      .then(setStars)
      .catch(() => setStars(0));
  }, []);

  // 获取当前算法类型
  const getCurrentAlgorithm = (): string => {
    const path = location.pathname;
    if (path.includes('recursive')) return 'recursive';
    if (path.includes('cycle-detection')) return 'cycle-detection';
    return 'iterative';
  };

  const currentThoughts = ALGORITHM_THOUGHTS[getCurrentAlgorithm()];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <a 
            href="https://fuck-algorithm.github.io/leetcode-hot-100/"
            target="_blank"
            rel="noopener noreferrer"
            className="back-link"
          >
            ← LeetCode Hot 100
          </a>
        </div>

        <div className="navbar-brand">
          <a 
            href="https://leetcode.cn/problems/reverse-linked-list/description/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="navbar-title-link"
          >
            <span className="leetcode-badge">206</span>
            <span className="navbar-title">反转链表</span>
            <span className="difficulty-tag easy">简单</span>
          </a>
        </div>

        <div className="navbar-menu">
          <NavLink 
            to="/iterative" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            迭代法
          </NavLink>
          <NavLink 
            to="/recursive" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            递归法
          </NavLink>
          <NavLink 
            to="/cycle-detection" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            环检测
          </NavLink>
        </div>

        <div className="navbar-right">
          <button 
            className="thoughts-btn"
            onClick={() => setShowThoughts(true)}
            title="查看算法思路"
          >
            💡 思路
          </button>
          
          <a 
            href="https://github.com/fuck-algorithm/leetcode-206-reverse-linked-list" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="去 GitHub 仓库 Star 支持一下"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="star-count">
              <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
              </svg>
              {stars}
            </span>
          </a>
        </div>
      </nav>

      {/* 算法思路弹窗 */}
      {showThoughts && (
        <div className="thoughts-modal-overlay" onClick={() => setShowThoughts(false)}>
          <div className="thoughts-modal" onClick={e => e.stopPropagation()}>
            <div className="thoughts-header">
              <h3>{currentThoughts.title}</h3>
              <button className="close-btn" onClick={() => setShowThoughts(false)}>×</button>
            </div>
            <div className="thoughts-content">
              <pre>{currentThoughts.content}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
