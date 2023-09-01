import type { Graph, Node } from '@antv/x6';

import DAGContext from '../context';
import type { GraphNode } from '../types';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class AddNodeAction extends DAGContext implements ActionProtocol {
  type = ActionType.addNode;
  label = '添加节点';

  handle(graph: Graph, dagId: string, node: Node) {
    const nodeData = node.getData<GraphNode>();
    const pos = node.position();
    const meta: GraphNode = {
      id: nodeData.id,
      codeName: nodeData.codeName,
      label: nodeData.label,
      x: pos.x,
      y: pos.y,
      status: nodeData.status,
    };
    this.context.dataService.addNodes([meta]);
  }
}
