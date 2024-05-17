import { NodeStatus } from '@secretflow/dag';
import type { Cell, GraphNode, Node } from '@secretflow/dag';
import type { GraphEventHandlerProtocol } from '@secretflow/dag';
import { message } from 'antd';
import { parse } from 'query-string';

import { componentConfigDrawer } from '@/modules/component-config/config-modal';
import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import type { LogParam } from '@/modules/dag-log/dag-log.service';
import { dagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { resultDrawer } from '@/modules/dag-result/result-modal';
import { DefaultRecordService } from '@/modules/pipeline-record-list/record-service';
import { getJobTaskOutput } from '@/services/secretpad/ProjectController';
import { getModel, Model } from '@/util/valtio-helper';

import mainDag from './dag';

export class RecordGraphService extends Model implements GraphEventHandlerProtocol {
  componentService = getModel(DefaultComponentTreeService);

  graphManager = mainDag.graphManager;
  recordService = getModel(DefaultRecordService);
  dataService = mainDag.dataService;
  graphRecordRequestService = mainDag.requestService;
  modalManager = getModel(DefaultModalManager);

  onGraphScale?: ((zoom: number) => void) | undefined;
  onSelectionChanged?: ((cells: Cell<Cell.Properties>[]) => void) | undefined;
  onEdgeUpdated?: (() => void) | undefined;

  async onResultClick(graphId: string, outputId: string, codeName: string) {
    const { search } = window.location;
    const { projectId } = parse(search);
    const [, nodeId] = outputId.match(/(.*)-output-([0-9]+)$/) || [];
    if (!nodeId) return;
    const { data, status } = await getJobTaskOutput({
      projectId: projectId as string,
      jobId: graphId,
      taskId: `${graphId}-${nodeId}`,
      outputId,
    });

    if (status?.code !== 0) {
      message.error('结果不存在');
      return;
    }

    if (data) {
      if (this.modalManager.modals[componentConfigDrawer.id].visible) {
        this.modalManager.closeModal(componentConfigDrawer.id);
      }
      this.modalManager.openModal(resultDrawer.id, {
        data,
        outputId,
        codeName,
      });
    }
  }

  onNodeClick: ((node: Node<Node.Properties>) => void) | undefined = async (node) => {
    if (this.modalManager.modals[resultDrawer.id]) {
      this.modalManager.closeModal(resultDrawer.id);
    }
    const data = node.getData<GraphNode>();
    const { id } = data;

    const graphNode = await this.graphRecordRequestService.getGraphNode(id);
    const nodeParties = await this.graphRecordRequestService.getNodeParties(id);

    const logparam: LogParam = {
      nodeData: { ...data, id: graphNode?.taskId as string },
      from: 'record',
      nodeParties,
    };

    if (
      data.status === NodeStatus.success ||
      data.status === NodeStatus.failed ||
      data.status === NodeStatus.running
    ) {
      this.modalManager.openModal(dagLogDrawer.id, logparam);
    } else {
      this.modalManager.closeModal(dagLogDrawer.id);
    }

    const upstreamNodes = await this.dataService.getUpstreamNodes(id);
    const inputNodes = await this.dataService.getInputsNodes();
    this.modalManager.openModal(componentConfigDrawer.id, {
      ...data,
      graphNode,
      upstreamNodes,
      inputNodes,
    });
  };

  onBlankClick() {
    this.modalManager.closeModal(componentConfigDrawer.id);
    this.modalManager.closeModal(dagLogDrawer.id);
    this.modalManager.closeModal(resultDrawer.id);
    this.recordService.setResultType();
  }
}

mainDag.addGraphEvents(getModel(RecordGraphService));
