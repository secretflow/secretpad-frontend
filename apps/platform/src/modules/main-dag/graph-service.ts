import type { Edge, Graph } from '@antv/x6';
import { ActionType, NodeStatus } from '@secretflow/dag';
import type { GraphNode, Node, GraphEventHandlerProtocol } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message } from 'antd';
import { parse } from 'query-string';

import {
  fullUpdateGraph,
  getGraphNodeOutput,
} from '@/services/secretpad/GraphController';
import { updateGraphNode } from '@/services/secretpad/GraphController';
import { getModel } from '@/util/valtio-helper';

import type { ComponentConfig } from '../component-config/component-config-protocol';
import { ComponentConfigRegistry } from '../component-config/component-config-registry';
import { DefaultComponentConfigService } from '../component-config/component-config-service';
import { componentConfigDrawer } from '../component-config/config-modal';
import { DefaultComponentInterpreterService } from '../component-interpreter/component-interpreter-service';
import type { Component, ComputeMode } from '../component-tree/component-protocol';
import { DefaultComponentTreeService } from '../component-tree/component-tree-service';
import type { LogParam } from '../dag-log/dag-log.service';
import { DagLogService } from '../dag-log/dag-log.service';
import { dagLogDrawer } from '../dag-log/log.drawer.layout';
import { DefaultModalManager } from '../dag-modal-manager';
import { resultDrawer } from '../dag-result/result-modal';
import { getPipelineTemplates } from '../pipeline';
import type {
  PipelineTemplateContribution,
  PipelineTemplateType,
} from '../pipeline/pipeline-protocol';

import mainDag from './dag';

export class GraphService implements GraphEventHandlerProtocol {
  protected nodeRunningEmitter = new Emitter<boolean>();
  onNodeRunningEvent = this.nodeRunningEmitter.on;

  protected nodeStatusEmitter = new Emitter<{ nodeId: string; status: NodeStatus }[]>();
  onNodeStatusChangedEvent = this.nodeStatusEmitter.on;

  componentService = getModel(DefaultComponentTreeService);
  componentInterpreter = getModel(DefaultComponentInterpreterService);
  componentConfigRegistry = getModel(ComponentConfigRegistry);
  componentConfigService = getModel(DefaultComponentConfigService);
  logService = getModel(DagLogService);

  modalManager = getModel(DefaultModalManager);

  constructor() {
    this.componentService.onComponentDragged(this.onComponentDrag.bind(this));
    this.componentConfigService.onConfigChanged(this.saveNodeConfig.bind(this));
    this.componentConfigService.onQuickConfigSaved(
      this.saveTemplateQuickConfig.bind(this),
    );
  }

  onComponentDrag({
    component,
    status,
    e,
  }: {
    component: Component;
    status: NodeStatus;
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
  }) {
    const { search } = window.location;
    const { mode } = parse(search);
    const { domain, name, version, outputs } = component;
    const nodeOutputs = outputs?.map((o) => {
      const { types } = o;
      const type = types[0];
      const resultType = type.split('.')[1];
      return { ...o, type: resultType };
    });

    const interpretion = this.componentInterpreter.getComponentTranslationMap(
      {
        domain,
        name,
        version,
      },
      mode as ComputeMode,
    );
    mainDag.graphManager.executeAction(
      ActionType.dragNode,
      {
        id: `test-node-${Date.now()}`,
        label: (interpretion && interpretion[name]) || name,
        codeName: `${component.domain}/${component.name}`,
        version: component.version,
        outputs: nodeOutputs,
        status,
      },
      e.nativeEvent,
    );
  }

  onNodeClick: ((node: Node<Node.Properties>) => void) | undefined = async (node) => {
    if (this.modalManager.modals['component-result']) {
      this.modalManager.closeModal(resultDrawer.id);
    }

    this.logService.cancel();

    const data = node.getData<GraphNode>();
    const logparam: LogParam = {
      nodeData: data,
      from: 'pipeline',
    };

    if (
      data.status === NodeStatus.success ||
      data.status === NodeStatus.failed ||
      data.status === NodeStatus.running ||
      data.status === NodeStatus.stopped
    ) {
      this.modalManager.openModal(dagLogDrawer.id, logparam);
    } else {
      this.logService.cancel();
      this.modalManager.closeModal(dagLogDrawer.id);
    }
    const { id } = data;

    const graphNode = await mainDag.requestService.getGraphNode(id);
    const inputNodes = await mainDag.dataService.getInputsNodes();
    const upstreamNodes = await mainDag.dataService.getUpstreamNodes(id);
    this.modalManager.openModal(componentConfigDrawer.id, {
      ...data,
      graphNode,
      upstreamNodes,
      inputNodes,
    });
  };

  async onResultClick(graphId: string, outputId: string, codeName: string) {
    const { search } = window.location;
    const { projectId } = parse(search);
    const [, nodeId] = outputId.match(/(.*)-output-([0-9]+)$/) || [];
    if (!nodeId) return;
    const { data, status } = await getGraphNodeOutput({
      projectId: projectId as string,
      graphId,
      graphNodeId: nodeId,
      outputId,
    });
    if (status?.code !== 0) {
      message.error('结果不存在');
      return;
    }

    if (data) {
      this.modalManager.openModal(resultDrawer.id, {
        data,
        outputId,
        codeName,
      });
    }
  }

  onBlankClick() {
    this.logService.cancel();
    this.modalManager.closeAllModals();
  }

  onEdgeUpdated() {
    this.logService.cancel();
    this.modalManager.closeModal(componentConfigDrawer.id);
  }

  async onEdgeConnected(edge: Edge) {
    /**
     * 特殊处理，每当「重新连接」下游的分箱修改算子时
     * 就清空分箱修改算子「codeName = feature/binning_modifications」的配置「nodeDef」
     *
     * 若不清空，就无法再次拿到最新的上游
     * TODO: 长期。需引擎支持上游输出分箱结果表
     */
    const componentId = edge?.store?.data?.target?.cell;
    const sourcePortId = edge?.store?.data?.source?.port;
    if (componentId && sourcePortId) {
      const { search } = window.location;
      const { projectId, dagId } = parse(search);
      const node = await mainDag.requestService.getGraphNode(componentId);
      if (node?.codeName === 'feature/binning_modifications') {
        const { attrs, attrPaths, ...restNodeDef } = node.nodeDef || {};
        const updatedNode = {
          ...node,
          inputs: [sourcePortId],
          nodeDef: {
            ...restNodeDef,
          },
        };
        await updateGraphNode({
          projectId: projectId as string,
          graphId: dagId as string,
          node: updatedNode,
        });

        mainDag.dataService.fetch();
      }
    }
  }

  onNodeRunning(isRunning: boolean) {
    this.nodeRunningEmitter.fire(isRunning);
  }

  onNodeStatusChanged(status: { nodeId: string; status: NodeStatus }[]) {
    this.nodeStatusEmitter.fire(status);
  }

  async onNodesPasted(nodes: Node[]) {
    /**
     * 特殊处理，情况同 onEdgeConnected
     */
    const binningModificationNodeIds = nodes
      .filter((node) => node?.codeName === 'feature/binning_modifications')
      .map((node) => node.id);

    this.cleanNodeDef(binningModificationNodeIds);
  }

  async cleanNodeDef(nodeIds: string[]) {
    if (!nodeIds?.length) {
      return;
    }

    const { search } = window.location;
    const { projectId, dagId } = parse(search);

    const graph = await mainDag.requestService.fetchGraph();

    const nodes = graph?.nodes?.map((node) => {
      if (nodeIds.includes(node?.graphNodeId)) {
        const { attrs, attrPaths, ...restNodeDef } = node?.nodeDef || {};
        return {
          ...node,
          nodeDef: {
            ...restNodeDef,
          },
        };
      } else {
        return node;
      }
    });

    await fullUpdateGraph({
      projectId: projectId as string,
      graphId: dagId as string,
      edges: graph?.edges,
      nodes: nodes,
    });

    // 更新最新的 nodes
    mainDag.dataService.fetch();
  }

  saveTemplateQuickConfig = async (quickConfig: {
    type: PipelineTemplateType;
    options: any;
  }) => {
    const { search } = window.location;
    const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };
    const { type, options } = quickConfig;
    const templates = getPipelineTemplates() as PipelineTemplateContribution[];
    const template = templates.find(
      (t: PipelineTemplateContribution) => t.type === type,
    );
    if (template) {
      const { content } = template;

      const { nodes, edges } = content(dagId, options);
      const { status } = await fullUpdateGraph({
        projectId,
        graphId: dagId,
        nodes,
        edges,
      });
      if (status && status.code === 0) {
        message.success('保存成功');

        mainDag.graphManager.executeAction(ActionType.render);
      } else {
        message.error(status?.msg || '操作失败');
      }
    }
  };

  saveNodeConfig = async (nodeInfo: ComponentConfig) => {
    const { node, isFinished } = nodeInfo;
    const { nodeDef, graphNodeId } = node;
    const { status } = await updateGraphNode(nodeInfo);
    if (status && status.code === 0) {
      message.success('保存成功');
      mainDag.graphManager.executeAction(ActionType.changeNodeData, graphNodeId, {
        nodeDef,
      });

      if (isFinished) {
        mainDag.graphManager.executeAction(ActionType.changeStatus, {
          nodeId: graphNodeId,
          status: NodeStatus.default,
        });
      } else {
        mainDag.graphManager.executeAction(ActionType.changeStatus, {
          nodeId: graphNodeId,
          status: NodeStatus.unfinished,
        });
      }

      /**
       * 特殊处理，情况同 onEdgeConnected
       */
      const subNodeIdSet = this.getSubNodeIds(
        mainDag.graphManager.graph as Graph,
        node.graphNodeId,
      );

      const binningModificationNodeIds = Array.from(subNodeIdSet)
        .filter((id) => id !== node.graphNodeId)
        .map((id) => {
          return mainDag.graphManager.graph?.getCellById(id).store.data.data;
        })
        .filter((node) => node?.codeName === 'feature/binning_modifications')
        .map((node) => node.id);

      this.cleanNodeDef(binningModificationNodeIds);
    } else {
      message.error(status?.msg || '操作失败');
    }
  };

  getSubNodeIds(graph: Graph, nodeId: string, nodeIds: Set<string> = new Set()) {
    nodeIds.add(nodeId);
    const outgoingEdges = graph.getOutgoingEdges(nodeId);
    outgoingEdges?.forEach((edge) => {
      const data = edge.getData();
      const { target } = data;
      this.getSubNodeIds(graph, target, nodeIds);
    });
    return nodeIds;
  }
}

mainDag.addGraphEvents(getModel(GraphService));
