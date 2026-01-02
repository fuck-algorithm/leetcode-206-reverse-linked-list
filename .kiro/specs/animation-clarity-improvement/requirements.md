# Requirements Document

## Introduction

本功能旨在改进链表反转动画演示的可理解性，让用户能够更清晰地理解迭代法和递归法的执行过程。当前动画存在步骤说明不够直观、指针变化过程不够清晰、缺少分步引导等问题。

## Glossary

- **Animation_System**: 链表反转动画演示系统，负责展示算法执行过程
- **Step_Explanation_Panel**: 步骤说明面板，显示当前步骤的详细解释
- **Pointer_Indicator**: 指针指示器，用于标识 prev/curr/next 等指针的位置
- **Code_Highlighter**: 代码高亮器，同步高亮当前执行的代码行
- **Progress_Tracker**: 进度追踪器，显示当前步骤在整体流程中的位置
- **Node_Connection**: 节点连接线，表示链表节点之间的指向关系

## Requirements

### Requirement 1: 增强步骤说明面板

**User Story:** As a 学习者, I want 看到每一步操作的详细解释, so that 我能理解每个操作的目的和效果。

#### Acceptance Criteria

1. WHEN 动画执行到任意步骤时, THE Step_Explanation_Panel SHALL 在画布上方显示当前步骤的详细说明
2. WHEN 步骤说明显示时, THE Step_Explanation_Panel SHALL 包含操作名称、操作目的、操作效果三个部分
3. WHEN 指针发生变化时, THE Step_Explanation_Panel SHALL 使用"之前 → 之后"的格式展示变化
4. THE Step_Explanation_Panel SHALL 使用与指针颜色一致的颜色标记相关变量名

### Requirement 2: 改进指针可视化

**User Story:** As a 学习者, I want 清晰地看到指针的移动过程, so that 我能理解指针是如何一步步变化的。

#### Acceptance Criteria

1. WHEN 指针移动时, THE Pointer_Indicator SHALL 显示移动动画而非瞬间跳转
2. WHEN 多个指针指向同一节点时, THE Animation_System SHALL 将指针标签错开显示避免重叠
3. WHEN prev 指针为 null 时, THE Animation_System SHALL 在链表左侧显示一个明确的 null 标记
4. THE Pointer_Indicator SHALL 使用不同颜色区分 prev(紫色)、curr(蓝色)、next(橙色) 指针

### Requirement 3: 添加操作进度指示

**User Story:** As a 学习者, I want 知道当前在整个算法的哪个阶段, so that 我能把握整体流程。

#### Acceptance Criteria

1. THE Progress_Tracker SHALL 显示当前步骤编号和总步骤数
2. WHEN 动画播放时, THE Progress_Tracker SHALL 显示一个进度条指示完成百分比
3. THE Progress_Tracker SHALL 将步骤分组显示（如：初始化、第1轮循环、第2轮循环...、完成）

### Requirement 4: 增强节点连接可视化

**User Story:** As a 学习者, I want 清楚地看到节点之间的连接变化, so that 我能理解指针反转的过程。

#### Acceptance Criteria

1. WHEN 节点连接被断开时, THE Node_Connection SHALL 显示断开动画和"断开"标记
2. WHEN 新连接建立时, THE Node_Connection SHALL 使用虚线动画显示新建连接过程
3. WHEN 连接方向反转后, THE Node_Connection SHALL 使用绿色标记已反转的连接
4. THE Animation_System SHALL 使用曲线而非直线显示反向连接，避免与正向连接重叠

### Requirement 5: 代码与动画同步高亮

**User Story:** As a 学习者, I want 代码高亮与动画步骤完全同步, so that 我能对应代码理解每一步操作。

#### Acceptance Criteria

1. WHEN 动画执行到某步骤时, THE Code_Highlighter SHALL 高亮对应的代码行
2. THE Code_Highlighter SHALL 在高亮行旁边显示当前变量的实际值
3. WHEN 用户点击代码行时, THE Animation_System SHALL 跳转到对应的动画步骤
4. THE Code_Highlighter SHALL 使用与指针相同的颜色标记代码中的变量名

### Requirement 6: 添加算法阶段说明

**User Story:** As a 学习者, I want 了解算法的整体思路和各阶段目标, so that 我能从宏观上理解算法。

#### Acceptance Criteria

1. THE Animation_System SHALL 在页面顶部显示算法的核心思想概述
2. WHEN 进入新的循环轮次时, THE Animation_System SHALL 显示当前轮次的目标说明
3. THE Animation_System SHALL 提供"算法思路"按钮，点击后显示完整的算法步骤说明

### Requirement 7: 改进递归法可视化

**User Story:** As a 学习者, I want 清晰地理解递归调用和回溯过程, so that 我能理解递归法的执行流程。

#### Acceptance Criteria

1. THE Animation_System SHALL 在左侧显示递归调用栈，栈顶在上方
2. WHEN 递归调用时, THE Animation_System SHALL 显示"递归深入"动画和箭头指示
3. WHEN 递归回溯时, THE Animation_System SHALL 显示"回溯返回"动画和返回值
4. THE Animation_System SHALL 用不同颜色区分"递归深入"阶段和"回溯反转"阶段
5. WHEN 回溯过程中反转指针时, THE Animation_System SHALL 高亮显示 head.next.next = head 的执行效果
