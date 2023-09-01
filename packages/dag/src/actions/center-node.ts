import type { Graph } from '@antv/x6';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class CenterNodeAction implements ActionProtocol {
  type = ActionType.centerNode;
  label = '居中';

  handle(graph: Graph, dagId: string, nodeId?: string) {
    if (!nodeId) {
      graph.centerContent();
    } else {
      graph.centerCell(graph.getCellById(nodeId));
    }
  }
}
