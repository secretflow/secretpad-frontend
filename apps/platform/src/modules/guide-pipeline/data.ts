export const nodes = [
  {
    id: '1',
    shape: 'guide-node',
    x: 160,
    y: 80,
    data: {
      name: 'alice的节点',
      icon: '',
      description: '可用于存储数据，可执行隐私计算协议或算法逻辑的计算机',
    },
  },
  {
    id: '2',
    shape: 'guide-node',
    x: 160,
    y: 200,
    data: {
      name: 'bob的节点',
      icon: '',
      description: '可用于存储数据，可执行隐私计算协议或算法逻辑的计算机',
    },
  },
  {
    id: '3',
    shape: 'guide-node',
    x: 460,
    y: 140,
    data: {
      name: '1个项目',
      icon: '',
      description: '多方数据主体共同在一个项目空间中进行隐私计算任务',
    },
  },
  {
    id: '4',
    shape: 'guide-node',
    x: 790,
    y: 140,
    data: {
      name: 'n个训练流',
      icon: '',
      description: '多个算子组件通过连线组成的可视化计算过程',
    },
  },
  {
    id: '5',
    shape: 'guide-node',
    x: 1150,
    y: 140,
    data: {
      name: 'n个结果',
      icon: '',
      description: '训练过程中产生的表、模型、规则文件内容',
    },
  },
];

export const edges = [
  {
    id: '1-3',
    shape: 'guide-edge',
    source: '1',
    target: '3',
  },
  {
    id: '2-3',
    shape: 'guide-edge',
    source: '2',
    target: '3',
  },
  {
    id: '3-4',
    shape: 'guide-edge',
    source: '3',
    target: '4',
  },
  {
    id: '4-5',
    shape: 'guide-edge',
    source: '4',
    target: '5',
  },
];
