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
      const { graphNodeId, status, codeName, nodeDef = {}, ...options } = n;
      // 强行断言：后端没有定义 UNFINISHED 状态
      let graphNodeStatus = nodeStatus[status || 'STAGING'] as unknown as NodeStatus;
      if (graphNodeStatus === NodeStatus.default) {
        graphNodeStatus = NodeStatus.unfinished;
      }
      const { domain } = nodeDef;
      return {
        ...options,
        codeName,
        id: graphNodeId,
        status: graphNodeStatus,
        // 初始化 只有成功的模型训练并且有输入边才可提交
        styles: {
          isOpaque:
            domain === 'ml.train' &&
            nodehasInputEdge(graphNodeId, edges) &&
            status === 'SUCCEED'
              ? false
              : true,
          isHighlighted: false,
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

const nodehasInputEdge = (nodeId?: string, edges: API.GraphEdge[] = []) => {
  if (!nodeId) return false;
  return edges.some((edge) => edge.target === nodeId);
};
