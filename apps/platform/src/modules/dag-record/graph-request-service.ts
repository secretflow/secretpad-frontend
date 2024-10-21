import type { GraphModel, NodeStatus } from '@secretflow/dag';
import { parse } from 'query-string';
import { history } from 'umi';

import { ComponentConfigRegistry } from '@/modules/component-config/component-config-registry';
import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import { GraphRequestService } from '@/modules/main-dag/graph-request-service';
import { nodeStatus } from '@/modules/main-dag/util';
import { PeriodicDetailType } from '@/modules/periodic-task/type';
import { DefaultRecordService } from '@/modules/pipeline-record-list/record-service';
import { getJob } from '@/services/secretpad/ProjectController';
import { info, taskInfo } from '@/services/secretpad/ScheduledController';
import { getModel } from '@/util/valtio-helper';

export class GraphRecordRequestService extends GraphRequestService {
  filtered: any[] = [];
  originalNodes: any[] = [];

  recordService = getModel(DefaultRecordService);

  componentService = getModel(DefaultComponentTreeService);
  componentConfigRegistry = getModel(ComponentConfigRegistry);

  async saveDag(dagId: string, model: GraphModel): Promise<void> {
    return;
  }
  // startRun: (dagId: string, componentIds: string[]) => Promise<void>;
  // stopRun: (dagId: string, componentId: string) => Promise<void>;
  // getMaxNodeIndex: (dagId: string) => Promise<number>;
  async queryStatus(dagId: string) {
    const { data } = await getInfoQuery(dagId);
    const { graph, finished } = data || {};
    if (!graph)
      return {
        nodeStatus: [],
        finished: true,
      };

    const { nodes } = graph;
    const convertedNodes = nodes?.map((n) => {
      const { graphNodeId, status } = n;
      return {
        nodeId: graphNodeId as string,
        status: nodeStatus[status || 'STAGING'] as unknown as NodeStatus,
      };
    });
    return { nodeStatus: convertedNodes || [], finished: finished as boolean };
  }

  async queryDag(dagId: string) {
    const { data } = await getInfoQuery(dagId);
    const { graph } = data || {};
    if (!graph) return { nodes: [], edges: [] };
    const graphData: { nodes: any[]; edges: any[] } = {} as any;
    const { nodes, edges } = graph;
    const convertedNodes = nodes?.map((n) => {
      const { graphNodeId, status, ...options } = n;
      return { ...options, id: graphNodeId, status: nodeStatus[status || 'STAGING'] };
    });

    const convertedEdges = edges
      ?.map((e) => {
        const { edgeId, ...options } = e;
        return { id: edgeId, ...options };
      })
      .filter((i) => {
        return (
          convertedNodes?.find((node) => node.id === i.source) &&
          convertedNodes?.find((node) => node.id === i.target)
        );
      });

    graphData['nodes'] = convertedNodes || [];
    graphData['edges'] = convertedEdges || [];
    this.recordService.setCurrentRecordGraph(graphData);
    this.originalNodes = convertedNodes || [];
    return graphData;
  }

  async getGraphNode(nodeId: string) {
    const { search } = window.location;
    const { projectId, dagId } = parse(search);
    if (!projectId || !dagId) return;
    const { data } = await getInfoQuery(dagId as string);
    const { graph = {} } = data || {};
    const { nodes } = graph;
    const node = nodes?.find((n) => n.graphNodeId === nodeId);
    return node;
  }

  // 获取算子参与方
  async getNodeParties(graphNodeId: string) {
    const { search } = window.location;
    const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };
    if (!graphNodeId || !projectId || !dagId) return [];
    const { data } = await getInfoQuery(dagId, graphNodeId);
    const nodes = data?.graph?.nodes || [];
    return nodes.find((item) => item.graphNodeId === graphNodeId)?.parties || [];
  }
}

const getProjectId = () => {
  const { search } = window.location;
  const { projectId } = parse(search);
  return projectId as string;
};

const getInfoQuery = async (dagId: string, graphNodeId?: string) => {
  let queryDagInfo;
  // periodicType 存在证明是从周期任务那边跳转过来
  const { periodicType, scheduleId } = getPeriodicHistoryState();
  if (periodicType && periodicType === PeriodicDetailType.TASK) {
    // 周期任务
    queryDagInfo = await info({
      scheduleId: dagId,
    });
  } else if (periodicType === PeriodicDetailType.CHILDTASK) {
    // 周期子任务
    queryDagInfo = await taskInfo({
      scheduleId,
      scheduleTaskId: dagId,
    });
  } else {
    // record 详情
    queryDagInfo = await getJob({
      projectId: getProjectId(),
      jobId: dagId,
      graphNodeId,
    });
  }
  return queryDagInfo;
};

/**
 * periodicType 周期任务类型
 * scheduleId 周期任务主任务ID
 * scheduleTaskId 周期任务子任务ID
 * historyDagId 点击周期任务详情跳转前url上的dagID
 * periodicJobId 周期任务详情实际的jobID
 * periodicGraphId  周期任务详情实际的画布ID
 */
export const getPeriodicHistoryState = () => {
  const {
    periodicType,
    scheduleId,
    scheduleTaskId,
    historyDagId,
    periodicJobId,
    periodicGraphId,
  } = (history.location.state || {}) as {
    periodicType: PeriodicDetailType | undefined;
    scheduleId: string | undefined;
    scheduleTaskId: string | undefined;
    historyDagId: string | undefined;
    periodicJobId: string | undefined;
    periodicGraphId: string | undefined;
  };
  return {
    periodicType,
    scheduleId,
    scheduleTaskId,
    historyDagId,
    periodicJobId,
    periodicGraphId,
  };
};
