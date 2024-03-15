import type { Graph } from '@antv/x6';

import DAGContext from '../context';
import type { GraphNode, GraphEdge } from '../types';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class RenderAction extends DAGContext implements ActionProtocol {
  type = ActionType.render;
  label = 'render';

  async handle(graph: Graph) {
    const { nodes, edges } = await this.context.dataService.fetch();
    if (nodes.length > 0) graph.drawBackground();
    graph.clearCells();
    const x6Nodes = await Promise.all(
      nodes.map(async (node) => await this.createX6Node(node)),
    );
    const x6Edges = edges.map((edge) => this.createX6Edge(edge));
    graph.addNodes(x6Nodes, { dry: true });
    graph.addEdges(x6Edges, { dry: true });
    graph.zoomToFit({ maxScale: 1, minScale: 0.6 });
    graph.centerContent();
  }

  async createX6Node(node: GraphNode) {
    const outputs = await this.context.hookService.createResult(node.id, node.codeName);
    const ports = await this.context.hookService.createPort(node.id, node.codeName);
    return {
      id: node.id,
      x: node.x,
      y: node.y,
      shape: 'dag-node',
      data: {
        id: node.id,
        codeName: node.codeName,
        label: node.label,
        status: node.status,
        outputs,
        styles: node.styles,
        nodeDef: node.nodeDef,
      },
      ports,
    };
  }

  createX6Edge(edge: GraphEdge) {
    return {
      shape: 'dag-edge',
      id: edge.id,
      source: {
        cell: edge.source,
        port: edge.sourceAnchor,
      },
      target: {
        cell: edge.target,
        port: edge.targetAnchor,
      },
      data: {
        id: edge.id,
        source: edge.source,
        sourceAnchor: edge.sourceAnchor,
        target: edge.target,
        targetAnchor: edge.targetAnchor,
      },
      attrs: {
        line: {
          stroke: '#C2C8D5',
          strokeWidth: 1,
          targetMarker: null,
          opacity: edge?.styles?.isOpaque ? 0.25 : 1,
        },
      },
      zIndex: -1,
    };
  }
}
