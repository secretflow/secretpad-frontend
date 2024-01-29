import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ChangeNodeDataAction extends DAGContext implements ActionProtocol {
  type = ActionType.changeNodeData;
  label = '改变节点参数';
  handle(graph: Graph, dagId: string, nodeId: string, option: any) {
    if (graph) {
      const node = graph.getCellById(nodeId);
      if (!node) return;
      this.context.dataService.changeNode([
        {
          nodeId: node.id,
          meta: option,
        },
      ]);
      node.setData(
        {
          ...node.getData(),
          ...option,
        },
        { overwrite: true, silent: true },
      );
    }
  }
}
