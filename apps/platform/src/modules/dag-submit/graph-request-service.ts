import type { GraphModel } from '@secretflow/dag';
import { NodeStatus } from '@secretflow/dag';
import { parse } from 'query-string';

import { GraphRequestService } from '@/modules/main-dag/graph-request-service';
import { nodeStatus } from '@/modules/main-dag/util';
import { getGraphDetail } from '@/services/secretpad/GraphController';

export class GraphSubmitRequestService extends GraphRequestService {
  graphData = {};

  async saveDag(dagId: string, model: GraphModel): Promise<void> {
    return;
  }

  async queryStatus(dagId: string) {
    return {
      nodeStatus: [],
      finished: true,
    };
  }
  // startRun: (dagId: string, componentIds: string[]) => Promise<void>;
  // stopRun: (dagId: string, componentId: string) => Promise<void>;
  // getMaxNodeIndex: (dagId: string) => Promise<number>;

  async queryDag(dagId: string) {
    this.graphData = { nodes: [], edges: [] };

    if (!dagId) {
      return this.graphData as GraphModel;
    }

    // 获取 graph 数据
    const { data } = await getGraphDetail({
      projectId: getProjectId(),
      graphId: dagId,
    });
    if (!data) {
      return this.graphData as GraphModel;
    }

    const { nodes, edges } = data;
    const convertedNodes = nodes?.map((n) => {
      const {
        graphNodeId,
        status,
        codeName,
        nodeDef = {},
        parties = [],
        ...options
      } = n;
      // 强行断言：后端没有定义 UNFINISHED 状态
      let graphNodeStatus = nodeStatus[status || 'STAGING'] as unknown as NodeStatus;
      if (graphNodeStatus === NodeStatus.default) {
        graphNodeStatus = NodeStatus.unfinished;
      }
      return {
        ...options,
        codeName,
        id: graphNodeId,
        status: graphNodeStatus,
        /**
         * 初始化可以点击提交的算子
         *   1. 成功的模型训练并且有输入边
         *   2. 成功的模型预测并且有输入边并且上游还有线性模型参数修改算子
         *   3. 成功的模型预测并且有输入边并且下游还有后处理算子
         * 注意：目前模型提交逻辑，能提交 模型训练算子和 模型预测算子
         * 提交模型训练算子，自动勾选上游预处理组件
         * 提交模型预测算子，自动勾选上游的线性模型参数修改算子，以及模型训练算子上游的预处理组件算子, 和模型预测算子下游的后处理算子
         * 目前（评分卡转换） 属于模型预测后面连接的后处理算子
         *  */
        styles: {
          isOpaque: !nodeCanOpaque(n, nodes),
          isHighlighted: false,
          nodeParties: parties,
        },
        nodeDef,
      };
    });

    const convertedEdges =
      edges?.map((e) => {
        const { edgeId, ...options } = e;
        return {
          id: edgeId,
          ...options,
          styles: {
            isOpaque: true,
          },
        };
      }) || [];

    const convertedData = {
      nodes: convertedNodes,
      edges: convertedEdges,
    };
    this.graphData = convertedData;
    return convertedData;
  }
}

const getProjectId = () => {
  const { search } = window.location;
  const { projectId } = parse(search);
  return projectId as string;
};

const nodeCanOpaque = (node: API.GraphNodeDetail, nodes: API.GraphNode[]) => {
  const { inputs = [], outputs = [], nodeDef = {}, status } = node;
  const { domain } = nodeDef;

  if (status !== 'SUCCEED' || inputs.length === 0) return false;
  if (domain === 'ml.predict') {
    // 判断上游有没有线性模型参数修改
    const inputId = inputs[0].split('-').slice(0, 3).join('-');
    const modelParamsModificationNode = nodes.find(
      (item) => item.graphNodeId === inputId,
    ) as API.GraphNodeDetail;
    if (!modelParamsModificationNode) return false;
    const { status: modelParamsStatus, nodeDef: modelParamsNodeDef } =
      modelParamsModificationNode;
    if (
      modelParamsStatus === 'SUCCEED' &&
      modelParamsNodeDef?.name === 'model_param_modifications'
    ) {
      return true;
    }

    // 判断下游有没有后处理算子
    const outputSlot = outputs[0];
    const postNode = nodes.find((item: API.GraphNodeDetail) =>
      (item?.inputs || []).includes(outputSlot),
    ) as API.GraphNodeDetail;
    if (!postNode) return false;
    const { status: postNodeStatus, nodeDef: postNodeNodeDef } = postNode;
    if (postNodeStatus === 'SUCCEED' && postNodeNodeDef?.domain === 'postprocessing') {
      return true;
    }
    return false;
  }
  return domain === 'ml.train';
};
