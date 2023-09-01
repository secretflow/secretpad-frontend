import type { Graph } from '@antv/x6';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class SelectNodeAction implements ActionProtocol {
  type = ActionType.selectNode;
  label = '选择';

  handle(graph: Graph, dagId: string, nodeId: string) {
    graph.resetSelection(nodeId);
  }
}
