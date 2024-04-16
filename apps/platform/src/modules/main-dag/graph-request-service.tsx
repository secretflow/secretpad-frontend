import type { GraphModel, GraphNode } from '@secretflow/dag';
import { NodeStatus } from '@secretflow/dag';
import { DefaultRequestService } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message, Image as AntdImage } from 'antd';
import { parse } from 'query-string';

import localDagSuccessLink from '@/assets/dag-success.png';
import { Platform } from '@/components/platform-wrapper';
import type {
  AtomicConfigNode,
  StructConfigNode,
} from '@/modules/component-config/component-config-protocol';
import { ComponentConfigRegistry } from '@/modules/component-config/component-config-registry';
import { DefaultComponentConfigService } from '@/modules/component-config/component-config-service';
import type {
  Component,
  ComputeMode,
} from '@/modules/component-tree/component-protocol';
import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import {
  fullUpdateGraph,
  getGraphDetail,
  listGraphNodeStatus,
  startGraph,
  stopGraphNode,
  graphNodeMaxIndexRefresh,
} from '@/services/secretpad/GraphController';
import { getImgLink } from '@/util/tracert-helper';
import { getModel } from '@/util/valtio-helper';

import type { User } from '../login/login.service';
import { LoginService } from '../login/login.service';

import type { IGraphEdgeType, IGraphNodeType } from './graph.protocol';
import { nodeStatus } from './util';

type IDagSuccessMapping = Record<
  Platform,
  {
    onlineLink: string;
    localLink: string;
    localStorageKey: string;
  }
>;

// EDGE 不会有 dag 任务
const dagSuccessTracertMapping: Omit<IDagSuccessMapping, 'EDGE'> = {
  [Platform.CENTER]: {
    onlineLink:
      'https://secretflow-public.oss-cn-hangzhou.aliyuncs.com/dag-success.png',
    localLink: localDagSuccessLink,
    localStorageKey: 'dag-task_success',
  },
  [Platform.AUTONOMY]: {
    onlineLink:
      'https://secretflow-public.oss-cn-hangzhou.aliyuncs.com/autonomy_dag-success.png',
    localLink: localDagSuccessLink,
    localStorageKey: 'autonomy_dag-success',
  },
};

export class GraphRequestService extends DefaultRequestService {
  // 只有画布更新了，queryDag才会去重新请求接口
  graphUpdated = true;

  graphData = {};

  loginService = getModel(LoginService);
  componentTreeService = getModel(DefaultComponentTreeService);
  componentConfigRegistry = getModel(ComponentConfigRegistry);
  componentConfigService = getModel(DefaultComponentConfigService);

  onNodeStatusChangedEmitter = new Emitter<API.GraphStatus>();
  onNodeStatusChanged = this.onNodeStatusChangedEmitter.on;

  onNodeChangedEmitter = new Emitter<IGraphNodeType[]>();
  onNodeChanged = this.onNodeChangedEmitter.on;

  async queryStatus(dagId: string) {
    const { data } = await listGraphNodeStatus({
      projectId: getProjectId(),
      graphId: dagId,
    });
    if (!data)
      return {
        nodeStatus: [],
        finished: true,
      };

    const { nodes, finished } = data;

    const isAllNodeStatusSuccess =
      nodes && nodes.length > 0 && nodes.every((node) => node.status === 'SUCCEED');
    if (isAllNodeStatusSuccess) {
      this.logDagSuccess();
    }
    // 将状态传过去，用于判断模型提交按钮能否置灰
    this.onNodeStatusChangedEmitter.fire({
      nodes,
      finished,
    });

    return {
      nodeStatus:
        nodes?.map(({ graphNodeId, status }) => ({
          nodeId: graphNodeId as string,
          status: nodeStatus[status || 'STAGING'] as unknown as NodeStatus,
        })) || [],
      finished: finished as boolean,
    };
  }

  logDagSuccess() {
    const platformType = this.loginService?.userInfo?.platformType as Exclude<
      User['platformType'],
      'EDGE'
    >;

    if (platformType) {
      const dagSuccessInfo = dagSuccessTracertMapping[platformType];

      const imgLink = getImgLink(dagSuccessInfo);

      message.info({
        icon: (
          <span style={{ marginRight: 6, display: 'inline-block' }}>
            <AntdImage
              width={20}
              preview={false}
              src={imgLink}
              fallback={dagSuccessInfo.localLink}
            />
          </span>
        ),
        content: '任务执行成功',
      });
    }
  }

  async queryDag(dagId: string) {
    const { mode } = parse(window.location.search);
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
      const { graphNodeId, status, codeName, ...options } = n;
      const configs =
        (this.componentConfigService.getComponentConfig(
          {
            name: codeName as string,
          },
          mode as ComputeMode,
        ) as AtomicConfigNode[]) || [];

      const isFinished = isConfigFinished(n, configs);

      // 强行断言：后端没有定义 UNFINISHED 状态
      let graphNodeStatus = nodeStatus[status || 'STAGING'] as unknown as NodeStatus;
      if (graphNodeStatus === NodeStatus.default && !isFinished) {
        graphNodeStatus = NodeStatus.unfinished;
      }

      return {
        ...options,
        codeName,
        id: graphNodeId,
        status: graphNodeStatus,
      };
    });

    const convertedEdges =
      edges?.map((e) => {
        const { edgeId, ...options } = e;
        return { id: edgeId, ...options };
      }) || [];

    const convertedData = {
      nodes: convertedNodes as IGraphNodeType[],
      edges: convertedEdges as IGraphEdgeType[],
    };

    // 将节点数据传过去，用于判断模型提交按钮能否置灰
    this.onNodeChangedEmitter.fire(convertedNodes as IGraphNodeType[]);

    this.graphData = convertedData;
    this.graphUpdated = false;
    return convertedData;
  }

  async saveDag(dagId: string, model: GraphModel) {
    const { nodes: n, edges: e } = model;
    const { mode } = parse(window.location.search);

    const nodes = await Promise.all(
      n.map(async (i) => {
        const { id, codeName, nodeDef, ...restNodes } = i;
        const config = this.componentConfigRegistry.getComponentConfig(
          codeName,
          mode as ComputeMode,
        );
        const { version, domain } = config as StructConfigNode;

        const [, name] = codeName.split('/');
        const component = await this.componentTreeService.getComponentConfig(
          {
            domain: domain || '',
            name,
          },
          mode as ComputeMode,
        );

        const { outputs } = component as Component;
        const outputPorts = outputs?.map((_, index) => `${id}-output-${index}`);

        return id
          ? {
              ...restNodes,
              graphNodeId: id,
              codeName,
              inputs: [],
              outputs: outputPorts,
              nodeDef: nodeDef || { domain, name, version },
            }
          : i;
      }),
    );

    const edges = e.map((i) => {
      const { id, ...restEdges } = i;
      const { sourceAnchor, target, targetAnchor } = i;
      // update io info in node
      const inputIndexLs = targetAnchor.split('-');
      const inputIndex = inputIndexLs[inputIndexLs.length - 1];
      const downstreamNode = nodes?.find(
        (node) => (node as { graphNodeId: string }).graphNodeId === target,
      ) as GraphNode & { inputs: string[] };

      if (!downstreamNode?.inputs[Number(inputIndex)]) {
        downstreamNode.inputs[Number(inputIndex)] = sourceAnchor;
      }

      return id ? { ...restEdges, edgeId: id } : i;
    });

    await fullUpdateGraph({
      projectId: getProjectId(),
      graphId: dagId,
      nodes: nodes as API.GraphNodeInfo[],
      edges,
    });
    this.graphUpdated = true;
  }

  async startRun(dagId: string, componentIds: string[]) {
    const { status } = await startGraph({
      projectId: getProjectId(),
      graphId: dagId,
      nodes: componentIds,
    });

    if (status?.code === 0) {
      message.success('开始执行');
    } else {
      message.error(status?.msg || '执行失败');
    }
  }

  async stopRun(dagId: string, componentId?: string) {
    let res;
    if (componentId) {
      res = await stopGraphNode({
        projectId: getProjectId(),
        graphId: dagId,
        graphNodeId: componentId,
      });
    } else {
      res = await stopGraphNode({
        projectId: getProjectId(),
        graphId: dagId,
      });
    }

    const { status } = res;

    if (status?.code === 0) {
      message.success('已停止执行');
    } else {
      message.error(status?.msg || '停止执行失败');
    }
  }

  async getMaxNodeIndex(dagId: string) {
    let currentIndex = undefined;
    const { data: graphData = {} } = await getGraphDetail({
      projectId: getProjectId(),
      graphId: dagId,
    });
    const nodeIndices = graphData?.nodes?.map((node) => {
      const { graphNodeId } = node;
      if (!graphNodeId) return 0;
      const [, , id] = graphNodeId.split('-');
      return parseInt(id) || 0;
    });
    if (nodeIndices && nodeIndices.length !== 0) {
      currentIndex = Math.max(...nodeIndices);
    }
    const { data = {} } = await graphNodeMaxIndexRefresh({
      projectId: getProjectId(),
      graphId: dagId,
      currentIndex,
    });
    const { maxIndex } = data;
    // 与服务端约定默认值从32开始，即使通过模版创建训练流，最大ID也会超出模版算子的ID
    return maxIndex || 32;
  }

  async fetchGraph() {
    const { search } = window.location;
    const { projectId, dagId } = parse(search);

    const { data, status } = await getGraphDetail({
      projectId: projectId as string,
      graphId: dagId as string,
    });

    if (!data || status?.code !== 0) {
      return;
    }

    return data;
  }

  async getGraphNode(nodeId: string) {
    const { search } = window.location;
    const { projectId, dagId } = parse(search);

    const { data } = await getGraphDetail({
      projectId: projectId as string,
      graphId: dagId as string,
    });
    if (!data) {
      return;
    }

    const { nodes } = data;
    const node = nodes?.find((n) => n.graphNodeId === nodeId);
    return node;
  }
}

const getProjectId = () => {
  const { search } = window.location;
  const { projectId } = parse(search);
  return projectId as string;
};

const isConfigFinished = (node: API.GraphNodeDetail, configs: AtomicConfigNode[]) => {
  const { nodeDef } = node;
  const { attrPaths = [], attrs = [] } = nodeDef || {};

  const isFinished = true;
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    if (config.isRequired) {
      const { prefixes = [], name } = config;
      const configName =
        prefixes && prefixes.length > 0 ? prefixes.join('/') + '/' + name : name;
      const attrIdx = (attrPaths as string[]).indexOf(configName);
      if (attrIdx < 0) {
        return false;
      }

      const attrVal = attrs[attrIdx];
      if (!attrVal) return false;
      const { is_na = false } = attrVal;
      if (is_na) return false;
    }
  }

  return isFinished;
};
