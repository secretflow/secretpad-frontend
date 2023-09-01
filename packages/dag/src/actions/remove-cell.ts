import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const removeCellActionHotKey = {
  key: ['delete', 'backspace'],
  text: 'Delete',
};
export class RemoveCellAction extends DAGContext implements ActionProtocol {
  type = ActionType.removeCell;
  label = '删除';
  hotKey = removeCellActionHotKey;

  handle(graph: Graph, dagId: string, nodeIds: string[] = [], edgeIds: string[] = []) {
    nodeIds.forEach((nodeId) => {
      const node = graph.getCellById(nodeId);
      if (node) {
        const connectedEdges = graph.getConnectedEdges(node);
        connectedEdges.forEach((c) => {
          edgeIds.push(c.id);
        });
      }
    });
    if (nodeIds.length > 0 || edgeIds.length > 0) {
      graph.removeCells([...nodeIds, ...edgeIds]);
      this.context.dataService.removeNodesOrEdges(nodeIds, edgeIds);
    }
  }
}
