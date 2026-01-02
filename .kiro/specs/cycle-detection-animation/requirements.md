# Requirements Document

## Introduction

本功能为算法动画演示工具添加链表环检测（Cycle Detection）算法的可视化演示。使用经典的快慢指针（Floyd's Tortoise and Hare）算法，通过动画展示 fast 和 slow 指针如何在链表中移动，以及如何检测到环的存在。该功能遵循"动画优先"原则，用视觉元素替代文字说明，让算法逻辑"动起来"。

## Glossary

- **Animation_System**: 动画控制系统，负责管理动画播放、暂停、步进等操作
- **Cycle_Detection_Algorithm**: 环检测算法模块，生成快慢指针遍历链表的动画事件序列
- **Canvas_Renderer**: 画布渲染器，使用 D3.js 渲染链表节点、指针和连接线
- **Fast_Pointer**: 快指针，每次移动两步
- **Slow_Pointer**: 慢指针，每次移动一步
- **Cyclic_Linked_List**: 带环链表，尾节点的 next 指向链表中某个节点形成环
- **Meeting_Point**: 相遇点，快慢指针在环中相遇的节点位置
- **Animation_Event**: 动画事件，描述单个动画步骤的数据结构

## Requirements

### Requirement 1: 带环链表数据生成

**User Story:** As a user, I want to generate linked lists with cycles, so that I can visualize the cycle detection algorithm.

#### Acceptance Criteria

1. WHEN the user selects cycle detection mode, THE Data_Generator SHALL create a linked list with a configurable cycle
2. WHEN generating a cyclic list, THE Data_Generator SHALL allow specifying the cycle entry point (which node the tail connects to)
3. WHEN the cycle entry point is set to -1 or null, THE Data_Generator SHALL create a non-cyclic linked list for comparison
4. THE Data_Generator SHALL support linked lists with 3 to 10 nodes for clear visualization
5. WHEN a cyclic list is generated, THE Data_Generator SHALL calculate node positions that clearly show the cycle structure (circular layout for cycle portion)

### Requirement 2: 环检测算法动画事件生成

**User Story:** As a user, I want to see step-by-step animation of the cycle detection algorithm, so that I can understand how fast and slow pointers work.

#### Acceptance Criteria

1. WHEN the animation starts, THE Cycle_Detection_Algorithm SHALL initialize both fast and slow pointers at the head node
2. WHEN stepping through the algorithm, THE Cycle_Detection_Algorithm SHALL move slow pointer one step and fast pointer two steps per iteration
3. WHEN fast pointer reaches null or fast.next is null, THE Cycle_Detection_Algorithm SHALL conclude no cycle exists and generate completion event
4. WHEN fast and slow pointers meet at the same node, THE Cycle_Detection_Algorithm SHALL generate a "cycle detected" event with the meeting point
5. THE Cycle_Detection_Algorithm SHALL generate distinct event types for: initialization, slow pointer move, fast pointer move, pointer comparison, cycle detection, and completion
6. WHEN generating events, THE Cycle_Detection_Algorithm SHALL include descriptive text explaining each step in Chinese

### Requirement 3: 环形链表画布渲染

**User Story:** As a user, I want to see the cyclic linked list rendered clearly on canvas, so that I can visually understand the cycle structure.

#### Acceptance Criteria

1. WHEN rendering a cyclic linked list, THE Canvas_Renderer SHALL display the cycle portion in a circular or semi-circular layout
2. WHEN rendering the cycle connection (tail to cycle entry), THE Canvas_Renderer SHALL use a curved arrow with distinct styling (e.g., dashed line, different color)
3. THE Canvas_Renderer SHALL display fast pointer label in one color (e.g., red) and slow pointer label in another color (e.g., blue)
4. WHEN both pointers are on the same node, THE Canvas_Renderer SHALL display both labels with smart positioning to avoid overlap
5. WHEN pointers move, THE Canvas_Renderer SHALL animate the movement with smooth transitions
6. THE Canvas_Renderer SHALL display a state panel showing current values of fast and slow pointers

### Requirement 4: 指针移动动画效果

**User Story:** As a user, I want to see smooth pointer movement animations, so that I can track how each pointer traverses the list.

#### Acceptance Criteria

1. WHEN slow pointer moves, THE Canvas_Renderer SHALL animate it moving to the next node with a blue trail effect
2. WHEN fast pointer moves, THE Canvas_Renderer SHALL animate it moving two nodes with a red trail effect, showing intermediate position briefly
3. WHEN a pointer visits a node, THE Canvas_Renderer SHALL highlight that node with a pulse animation
4. WHEN cycle is detected (pointers meet), THE Canvas_Renderer SHALL display a celebration animation at the meeting point
5. WHEN no cycle is found, THE Canvas_Renderer SHALL display a completion indicator showing fast pointer reached null

### Requirement 5: 环检测页面集成

**User Story:** As a user, I want to access the cycle detection animation from the navigation, so that I can easily switch between different algorithm visualizations.

#### Acceptance Criteria

1. WHEN the application loads, THE Navigation_Bar SHALL include a "环检测" (Cycle Detection) menu item
2. WHEN user clicks the cycle detection menu item, THE Router SHALL navigate to the cycle detection page
3. THE Cycle_Detection_Page SHALL include the animation canvas, control panel, and Java code viewer
4. THE Control_Panel SHALL provide play, pause, step forward, step backward, and reset controls
5. THE Java_Code_Viewer SHALL display the cycle detection algorithm code with current line highlighting synchronized to animation steps

### Requirement 6: 动画控制与同步

**User Story:** As a user, I want to control the animation playback and see synchronized code highlighting, so that I can learn at my own pace.

#### Acceptance Criteria

1. WHEN user clicks play, THE Animation_System SHALL automatically advance through animation steps at the configured speed
2. WHEN user clicks pause, THE Animation_System SHALL stop automatic advancement while preserving current state
3. WHEN user clicks step forward, THE Animation_System SHALL advance exactly one animation event
4. WHEN user clicks step backward, THE Animation_System SHALL revert to the previous animation event state
5. WHEN user clicks reset, THE Animation_System SHALL return to the initial state with both pointers at head
6. WHEN animation step changes, THE Java_Code_Viewer SHALL highlight the corresponding code line based on event type
7. THE Animation_System SHALL support animation speed adjustment from 0.5x to 2x

### Requirement 7: 环入口点配置

**User Story:** As a user, I want to configure where the cycle starts in the linked list, so that I can explore different cycle scenarios.

#### Acceptance Criteria

1. THE Control_Panel SHALL provide a dropdown or slider to select the cycle entry point (0 to n-1, or "no cycle")
2. WHEN user changes the cycle entry point, THE Animation_System SHALL reset and regenerate the linked list with the new configuration
3. THE Canvas_Renderer SHALL visually indicate the cycle entry node with a distinct marker or label
4. WHEN "no cycle" is selected, THE Animation_System SHALL demonstrate the algorithm correctly detecting no cycle exists
