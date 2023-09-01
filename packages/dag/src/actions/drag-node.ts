import type { Graph } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';

import DAGContext from '../context';
import type { GraphNode } from '../types';
import { NodeStatus } from '../types';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class DragNodeAction extends DAGContext implements ActionProtocol {
  type = ActionType.dragNode;
  label = '拖拽节点';
  dnd: Dnd | null = null;

  async handle(
    graph: Graph,
    dagId: string,
    nodeData: Pick<GraphNode, 'codeName' | 'label' | 'status'>,
    e: MouseEvent,
  ) {
    if (!this.dnd) {
      this.dnd = new Dnd({
        target: graph,
        getDragNode: (node) => node.clone({ keepId: true }),
        getDropNode: (node) => node.clone({ keepId: true }),
      });
    }
    const maxNodeIndex = await this.context.requestService.getMaxNodeIndex(dagId);
    const nodeId = `${dagId}-node-${maxNodeIndex + 1}`;
    const { label, codeName, status } = nodeData;
    const outputs = await this.context.hookService.createResult(nodeId, codeName);
    const ports = await this.context.hookService.createPort(nodeId, codeName);
    const node = graph.createNode({
      id: nodeId,
      shape: 'dag-node',
      ports,
      data: {
        id: nodeId,
        codeName,
        label,
        status: status || NodeStatus.default,
        outputs,
      },
    });
    this.dnd.start(node, e);
  }

  cancel() {
    if (this.dnd) {
      this.dnd.dispose();
      this.dnd = null;
    }
  }
}
