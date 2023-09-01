import type { Graph, Node } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class MoveNodeAction extends DAGContext implements ActionProtocol {
  type = ActionType.moveNode;
  label = '移动节点';

  handle(graph: Graph, dagId: string, node: Node) {
    const { x, y } = node.position();
    this.context.dataService.changeNode([
      {
        nodeId: node.id,
        meta: {
          x,
          y,
        },
      },
    ]);
  }
}
