import type { Node } from '@secretflow/dag';

import mainDag from './dag';

/** 判断是不是模型训练算子 */
export const isModel = (node: Node) => {
  const { nodeDef = {} } = node.getData();
  const { domain } = nodeDef;
  return domain === 'ml.train';
};

/** 判断是不是模型预测算子 */
export const isPredict = (node: Node) => {
  const { nodeDef = {} } = node.getData();
  const { domain } = nodeDef;
  return domain === 'ml.predict';
};

/** 判断是不是前处理算子 */
export const isPre = (node: Node) => {
  const { nodeDef = {} } = node.getData();
  const { domain } = nodeDef;
  return domain === 'preprocessing';
};

/** 判断是不是后处理算子 */
export const isPost = (node: Node) => {
  const { nodeDef = {} } = node.getData();
  const { domain } = nodeDef;
  // TODO: 后处理算子类型（目前暂无）
  return domain === 'postprocessing';
};

/** 判断是不是线性模型参数修改算子 */
export const isModelParamsModification = (node: Node) => {
  const { nodeDef = {} } = node.getData();
  const { name } = nodeDef;
  return name === 'model_param_modifications';
};

/** 将模型算子进行前后排序 */
export const sortNodes = (nodes: Node[]) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return nodes;
  nodes.sort((a, b) => {
    if (graph.isPredecessor(a, b)) {
      return 1;
    } else if (graph.isSuccessor(a, b)) {
      return -1;
    } else {
      return 0;
    }
  });
  return nodes;
};

/** 根据 id 高亮节点 */
export const highlightSelectionByIds = (ids: string[]) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return;
  const graphNodeList = graph.getNodes();
  graphNodeList.forEach((node) => {
    const nodeData = node.getData();
    const data = {
      ...nodeData,
      styles: {
        ...nodeData.styles,
        isHighlighted: ids.includes(nodeData.id),
      },
    };
    node.setData(data);
  });
};

/**
 * 重置画布展示样式
 * 可点击的高亮算子
 *  1. 成功的模型训练算子
 *  2. 成功的模型预测算子并且上游有线性模型参数修改算子
 *  3. 成功的模型预测算子并且下游有成功的后处理算子
 * */
export const resetGraphStyles = () => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return;
  const graphNodeList = graph.getNodes();
  graphNodeList.forEach((node) => {
    const nodeData = node.getData();
    const data = {
      ...nodeData,
      styles: {
        isOpaque: !nodeCanOpaque(node),
        isHighlighted: false,
      },
    };
    node.setData(data);
  });
};

/**
 * 成功的模型训练算子高亮
 * 成功的模型预测算子并且上游有线性模型参数修改算子高亮
 * 成功的模型预测算子并且下游有后处理算子高亮
 */
export const nodeCanOpaque = (node: Node) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return;
  const nodeData = node.getData();
  const {
    status,
    nodeDef: { domain },
  } = nodeData;
  if (status !== 0 || (graph.getIncomingEdges(node) || []).length === 0) return false;
  if (domain === 'ml.predict') {
    const predecessors = graph.getPredecessors(node) || [];
    const modelParamsModificationNode = predecessors.find(
      (item) =>
        item.getData().nodeDef?.name === 'model_param_modifications' &&
        item.getData().status === 0,
    );

    // 获取后处理算子
    const postNodesResult = getPostNodes(node);

    return !!modelParamsModificationNode || postNodesResult.length !== 0;
  }
  return domain === 'ml.train';
};

/**
 * 更新画布节点样式
 */
export const updateGraphNodesStyles = (nodes: Node[], options: Record<string, any>) => {
  nodes.forEach((node) => {
    const nodeData = node.getData();
    const data = {
      ...nodeData,
      styles: {
        ...nodeData.styles,
        ...options,
        isOpaque: false,
      },
    };
    node.setData(data);
  });
};

/**
 * 获取目标算子的前处理算子,并且是从 table 类型桩连接下来的算子
 * 状态是成功的算子
 * */
export const getPreNodes = (node: Node) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return [];
  const predecessors = graph.getPredecessors(node) || [];
  const result: Node[] = [];
  predecessors.forEach((n) => {
    const { status, codeName } = n.getData();
    const omitNodeCodeName: string[] = [
      // 'preprocessing/substitution',
      // 'preprocessing/vert_bin_substitution',
    ];
    if (
      status === 0 &&
      isPre(n as Node) &&
      !omitNodeCodeName.includes(codeName) &&
      isTableAnchorOutputConnectModel(node, n as Node)
    ) {
      result.push(n as Node);
    }
  });
  return result;
};

/**
 * 获取目标算子的后处理算子,并且是从 table 类型桩连接下来的后处理算子
 * 状态是成功的算子
 * */
export const getPostNodes = (node: Node) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return [];
  const successors = graph.getSuccessors(node) || [];
  const result: Node[] = [];
  successors.forEach((n) => {
    const { status } = n.getData();
    if (
      status === 0 &&
      isPost(n as Node) &&
      isTableAnchorOutputConnectModel(n as Node, node)
    ) {
      result.push(n as Node);
    }
  });
  return result;
};

/**
 * 判断 targetNode 是不是通过 table 类型的连接桩一直连到 模型训练算子
 * 存在一条路径可以连接到模型训练算子 则返回 true，否则返回 false。
 */
export const isTableAnchorOutputConnectModel = (
  modelNode: Node,
  targetNode: Node,
  visitedNodes = new Set<string>(),
): boolean => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return false;

  // 如果目标节点已经被访问过，说明存在循环连接，直接返回 false
  if (visitedNodes.has(targetNode.id)) {
    return false;
  }
  visitedNodes.add(targetNode.id);

  // 获取目标节点的输出连接桩
  const { outputs } = targetNode.getData();
  const outputsTable = outputs.filter(
    (item: { type: string }) => item.type === 'table',
  );
  // 获取目标节点的输出边
  const allOutputEdges = graph.getOutgoingEdges(targetNode) || [];

  for (const edge of allOutputEdges) {
    const anchor = edge.getData().sourceAnchor;
    const isTableEdge = outputsTable.some(
      (output: { id: string }) => output.id === anchor,
    );
    if (isTableEdge) {
      const nextNodeId = edge.getData().target;
      const nextNode = graph.getNodes().find((node) => node.id === nextNodeId);
      if (nextNode && nextNode.id === modelNode.id) {
        return true; // 如果找到连接到模型节点的路径，返回 true
      } else {
        if (nextNode && graph.isPredecessor(modelNode, nextNode)) {
          // 如果下一个节点是模型节点的前序节点，递归继续查找
          if (isTableAnchorOutputConnectModel(modelNode, nextNode, visitedNodes)) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

/** 获取模型训练算子或者模型预测算子的上下游组件 */
export const getModelSameBranchNodes = (node: Node) => {
  const graph = mainDag.graphManager.getGraphInstance();
  if (!graph) return;
  const result: {
    modelNode: Node[];
    predictNode: Node[];
    preNodes: Node[];
    nextNodes: Node[];
  } = {
    preNodes: [],
    modelNode: [],
    predictNode: [],
    nextNodes: [],
  };

  // 模型训练算子
  if (isModel(node)) {
    result.modelNode.push(node);
    const preNodesResult = getPreNodes(node);
    result.preNodes = [...result.preNodes, ...preNodesResult];

    // 后面有模型预测算子，才能去获取后处理算子
    const successors = graph.getSuccessors(node) || [];
    const predictNode = successors.find((n) => {
      const { status } = n.getData();
      if (status === 0 && isPredict(n as Node)) return n;
    });
    if (predictNode) {
      result.predictNode.push(predictNode as Node);
      // 获取后处理算子
      const postNodesResult = getPostNodes(predictNode);
      result.nextNodes = [...result.nextNodes, ...postNodesResult];
    }
  } else if (isPredict(node)) {
    // 模型预测算子
    result.predictNode.push(node);
    const predecessors = graph.getPredecessors(node) || [];

    // 前面有模型训练算子，才能去获取前处理算子
    const modelNode = predecessors.find((n) => {
      const { status } = n.getData();
      if (status === 0 && isModel(n as Node)) return n;
    });
    if (modelNode) {
      result.modelNode.push(modelNode as Node);
      // 获取前处理算子
      const preNodesResult = getPreNodes(modelNode as Node);
      result.preNodes = [...result.preNodes, ...preNodesResult];
      // 获取线性模型参数修改,将其也作为前处理提交
      const modelParamsModificationList = predecessors.filter((n) => {
        const { status } = n.getData();
        if (status === 0 && isModelParamsModification(n as Node)) return n;
      }) as Node[];
      if (modelParamsModificationList.length !== 0) {
        result.preNodes = [...result.preNodes, ...modelParamsModificationList];
      }
    }

    // 获取后处理算子 只有模型预测算子，才可以获取后处理算子
    const postNodesResult = getPostNodes(node);
    result.nextNodes = [...result.nextNodes, ...postNodesResult];
  }
  return result;
};
