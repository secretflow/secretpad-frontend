[English (US)](README.md) | 简体中文

# SecretPad Frontend DAG SDK

画布模块设计

![image](https://github.com/secretflow/secretpad-frontend/assets/46579290/bc56b079-0b79-4305-8406-3181a4fd0620)

- Util: 图相关的工具方法
- 图形：图形注册
- 数据管理：图本地数据存储以及增删改，通过数据适配层与业务数据打通
- 行为管理：枚举画布上所有操作，统一管理，每一种操作都会有相应的快捷键、是否能历史回退等
  信息
- 状态管理：管理画布上节点、边的状态
- 工具栏：将画布行为渲染出来
- 画布：画布内容初始化、刷新、重置
- 训练画布胶水层：打通画布基础能力与业务能力的桥梁
- 历史画布胶水层：支持和历史预览画布能力

画布数据流

![image](https://github.com/secretflow/secretpad-frontend/assets/46579290/9b9374e0-dbe0-4258-8f03-f309fd350e40)
