import type { Graph } from '@antv/x6';

import { NodeStatus } from '../types';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ClearStatusAction implements ActionProtocol {
  type = ActionType.clearStatus;
  label = '清除运行状态';

  handle(graph: Graph) {
    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      node.setData({
        ...node.getData(),
        status: NodeStatus.default,
      });
    });
    const edges = graph.getEdges();
    edges.forEach((edge) => {
      edge.attr('line/strokeDasharray', '');
      edge.attr('line/style/animation', '');
    });
  }
}
