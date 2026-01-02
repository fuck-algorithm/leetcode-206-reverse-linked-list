# Implementation Plan: Cycle Detection Animation

## Overview

本实现计划将环检测算法动画功能分解为可执行的编码任务。每个任务构建在前一个任务之上，确保增量开发和持续验证。使用 TypeScript + React + D3.js 技术栈，复用现有的动画控制系统。

## Tasks

- [x] 1. 扩展类型定义和 Redux 状态
  - [x] 1.1 扩展 src/types/index.ts 添加环检测相关类型
    - 添加 CycleEventType 类型定义
    - 添加 CycleAnimationEvent 接口
    - 添加 CyclicListConfig 和 CyclicListResult 接口
    - 扩展 ListNodeData 添加 isCycleEntry 和 isInCycle 字段
    - _Requirements: 2.5_

  - [x] 1.2 扩展 src/store/animationSlice.ts 添加环检测状态
    - 添加 cyclePointers: { fast, slow } 状态
    - 添加 cycleConfig: { entryPoint, nodeCount } 状态
    - 添加 meetingPoint 和 cycleDetected 状态
    - 添加对应的 reducer actions
    - _Requirements: 6.1, 6.2_

- [x] 2. 实现带环链表数据生成
  - [x] 2.1 扩展 src/utils/dataGenerator.ts 添加环形链表生成函数
    - 实现 generateCyclicLinkedList(config) 函数
    - 支持 cycleEntryIndex 参数指定环入口
    - 当 cycleEntryIndex 为 null 时生成无环链表
    - 限制节点数量在 [3, 10] 范围内
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 编写属性测试：环配置正确性
    - **Property 1: Cycle Configuration Correctness**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 实现环形布局计算函数
    - 实现 calculateCyclicLayout(nodes, cycleEntryIndex, canvasSize) 函数
    - 环外节点水平排列
    - 环内节点圆形排列，等距分布
    - _Requirements: 1.5_

  - [x] 2.4 编写属性测试：环形布局几何
    - **Property 3: Cyclic Layout Geometry**
    - **Validates: Requirements 1.5**

- [x] 3. Checkpoint - 数据层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 实现环检测算法动画事件生成
  - [x] 4.1 创建 src/algorithms/CycleDetection.ts 算法模块
    - 实现 generateCycleDetectionEvents(nodes, cycleEntryIndex) 函数
    - 生成 INITIALIZE 事件：fast=head, slow=head
    - 生成 SLOW_MOVE, FAST_MOVE_FIRST, FAST_MOVE_SECOND 事件
    - 生成 COMPARE_POINTERS 事件
    - 生成 CYCLE_DETECTED 或 NO_CYCLE 终止事件
    - 每个事件包含中文描述
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.2 编写属性测试：指针移动不变量
    - **Property 4: Pointer Movement Invariant**
    - **Validates: Requirements 2.2**

  - [x] 4.3 编写属性测试：非环终止条件
    - **Property 5: Non-Cyclic Termination**
    - **Validates: Requirements 2.3**

  - [x] 4.4 编写属性测试：环检测保证
    - **Property 6: Cycle Detection Guarantee**
    - **Validates: Requirements 2.4**

  - [x] 4.5 编写属性测试：事件描述完整性
    - **Property 7: Event Description Completeness**
    - **Validates: Requirements 2.6**

- [x] 5. Checkpoint - 算法层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 6. 实现环检测画布组件
  - [x] 6.1 创建 src/components/CycleDetectionCanvas.tsx 组件
    - 使用 D3.js 渲染 SVG 画布
    - 实现 renderCyclicLayout() 渲染环形布局
    - 实现 renderConnections() 渲染节点连接线
    - 实现环连接（尾到环入口）使用曲线和虚线样式
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 实现指针标签渲染
    - 实现 renderPointerLabels() 渲染 fast/slow 指针
    - fast 指针使用红色，slow 指针使用蓝色
    - 当两指针在同一节点时智能避让
    - 实现 renderStatePanel() 显示变量状态
    - _Requirements: 3.3, 3.4, 3.6_

  - [x] 6.3 实现指针移动动画效果
    - slow 指针移动时显示蓝色轨迹
    - fast 指针移动时显示红色轨迹，展示中间位置
    - 节点访问时脉冲高亮
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.4 实现检测结果动画
    - 环检测成功时显示相遇庆祝动画
    - 无环时显示完成指示器
    - 标记环入口节点
    - _Requirements: 4.4, 4.5, 7.3_

- [x] 7. 实现环检测页面和路由
  - [x] 7.1 创建 src/pages/CycleDetectionPage.tsx 页面组件
    - 组合 CycleDetectionCanvas, ControlPanel, JavaCodeViewer
    - 使用 AnimationControllerContext 管理动画
    - 添加环入口点配置控件（下拉选择）
    - _Requirements: 5.3, 7.1_

  - [x] 7.2 更新 src/App.tsx 添加路由
    - 添加 /cycle-detection 路由
    - 导入 CycleDetectionPage 组件
    - _Requirements: 5.2_

  - [x] 7.3 更新 src/components/Navbar.tsx 添加导航项
    - 添加"环检测"菜单项
    - 链接到 /cycle-detection 路由
    - _Requirements: 5.1_

- [x] 8. 实现代码高亮同步
  - [x] 8.1 创建环检测 Java 代码常量和行映射
    - 定义 CYCLE_DETECTION_JAVA_CODE 常量
    - 实现 getCycleDetectionCodeLine(eventType) 映射函数
    - _Requirements: 5.5, 6.6_

  - [x] 8.2 编写属性测试：事件到代码行映射
    - **Property 8: Event-to-Code Line Mapping**
    - **Validates: Requirements 5.5, 6.6**

- [x] 9. 实现动画控制集成
  - [x] 9.1 创建 src/controllers/CycleDetectionController.ts
    - 扩展或创建控制器处理环检测动画
    - 实现 play, pause, stepForward, stepBackward, reset 方法
    - 实现速度调节（0.5x - 2x）
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

  - [x] 9.2 编写属性测试：步进导航一致性
    - **Property 9: Step Navigation Consistency**
    - **Validates: Requirements 6.3, 6.4**

  - [x] 9.3 编写属性测试：动画速度边界
    - **Property 10: Animation Speed Bounds**
    - **Validates: Requirements 6.7**

  - [x] 9.4 实现配置变更处理
    - 当环入口点改变时重置动画
    - 重新生成链表数据
    - _Requirements: 7.2_

  - [x] 9.5 编写属性测试：配置变更重置
    - **Property 11: Configuration Change Reset**
    - **Validates: Requirements 7.2**

- [x] 10. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证页面渲染正确
  - 验证动画流程完整
  - 如有问题请询问用户

## Notes

- All tasks are required, including property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- 使用 fast-check 库进行属性测试，每个测试至少运行 100 次迭代
