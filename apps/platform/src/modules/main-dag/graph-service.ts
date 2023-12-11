import { ActionType, NodeStatus } from '@secretflow/dag';
import type { GraphNode, Node, GraphEventHandlerProtocol } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message } from 'antd';
import { parse } from 'query-string';

import {
  fullUpdateGraph,
  getGraphNodeOutput,
  updateGraphNode,
} from '@/services/secretpad/GraphController';
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
    const { data } = await getGraphNodeOutput({
      projectId: projectId as string,
      graphId,
      graphNodeId: nodeId,
      outputId,
    });

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

  onNodeRunning(isRunning: boolean) {
    this.nodeRunningEmitter.fire(isRunning);
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
    } else {
      message.error(status?.msg || '操作失败');
    }
  };
}

mainDag.addGraphEvents(getModel(GraphService));
