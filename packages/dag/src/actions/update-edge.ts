import type { Graph, Edge } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class UpdateEdgeAction extends DAGContext implements ActionProtocol {
  type = ActionType.updateEdge;
  label = '更新连线终端';

  handle(graph: Graph, dagId: string, edge: Edge) {
    const source = edge.getSourceCellId();
    const sourceAnchor = edge.getSourcePortId();
    const target = edge.getTargetCellId();
    const targetAnchor = edge.getTargetPortId();
    const oldEdgeId = edge.id;
    const newEdgeId = `${sourceAnchor}__${targetAnchor}`;
    const realEdge = graph.createEdge({
      shape: 'dag-edge',
      id: newEdgeId,
      source: {
        cell: source,
        port: sourceAnchor,
      },
      target: {
        cell: target,
        port: targetAnchor,
      },
      data: {
        id: newEdgeId,
        source,
        sourceAnchor,
        target,
        targetAnchor,
      },
      zIndex: -1,
    });
    edge.remove();
    graph.addEdge(realEdge);
    this.context.dataService.changeEdge([
      {
        edgeId: oldEdgeId,
        meta: {
          id: newEdgeId,
          source,
          sourceAnchor,
          target,
          targetAnchor,
        },
      },
    ]);
  }
}
