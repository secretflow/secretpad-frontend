import { DagreLayout } from '@antv/layout';
import type { Graph } from '@antv/x6';

import DAGContext from '../context';
import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const tidyLayoutActionHotKey = {
  key: isWindows ? 'ctrl+l' : 'cmd+l',
  text: isWindows ? 'Ctrl L' : '⌘ L',
};
export class TidyLayoutAction extends DAGContext implements ActionProtocol {
  type = ActionType.tidyLayout;
  label = '一键整理';
  hotKey = tidyLayoutActionHotKey;

  handle = (graph: Graph, dagId: string) => {
    const dargeLayout = new DagreLayout({
      type: 'dagre',
      ranksep: 35,
      nodesep: 15,
      nodeSize: [180, 36],
    });

    const model: { nodes: any[]; edges: any[] } = {
      nodes: [],
      edges: [],
    };

    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    nodes.forEach((node) => {
      model.nodes.push(node.getData());
    });
    edges.forEach((edge) => {
      model.edges.push(edge.getData());
    });
    dargeLayout.layout(model);

    model.nodes.forEach((node) => {
      const { id } = node;
      const graphNode = graph.getCellById(id);
      if (graphNode && graphNode.isNode()) {
        graphNode.position(node.x, node.y);
      }
    });
    graph.zoomToFit({ maxScale: 1, minScale: 0.2 });
    graph.centerContent();

    this.context.requestService.saveDag(dagId, model);
  };
}
