import type { Graph, Edge } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class AddEdgeAction extends DAGContext implements ActionProtocol {
  type = ActionType.addEdge;
  label = '添加边';

  handle(graph: Graph, dagId: string, edge: Edge) {
    const sourceId = edge.getSourceCellId();
    const targetId = edge.getTargetCellId();
    const sourcePortId = edge.getSourcePortId();
    const targetPortId = edge.getTargetPortId();
    if (sourcePortId && targetPortId) {
      const edgeId = `${sourcePortId}__${targetPortId}`;
      const meta = {
        id: edgeId,
        source: sourceId,
        target: targetId,
        sourceAnchor: sourcePortId,
        targetAnchor: targetPortId,
      };
      const realEdge = graph.createEdge({
        shape: 'dag-edge',
        id: edgeId,
        source: {
          cell: sourceId,
          port: sourcePortId,
        },
        target: {
          cell: targetId,
          port: targetPortId,
        },
        data: {
          id: edge.id,
          source: sourceId,
          sourceAnchor: sourcePortId,
          target: targetId,
          targetAnchor: targetPortId,
        },
        zIndex: -1,
      });
      edge.remove();
      graph.addEdge(realEdge);
      this.context.dataService.addEdges([meta]);
    }
  }
}
