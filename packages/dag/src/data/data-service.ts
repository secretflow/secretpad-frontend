import DAGContext from '../context';
import type { GraphEdge, GraphNode } from '../types';

import type { DataService } from './protocol';

export class DefaultDataService extends DAGContext implements DataService {
  nodes: GraphNode[] = [];
  edges: GraphEdge[] = [];

  async fetch() {
    const { nodes, edges } = await this.context.requestService.queryDag(
      this.context.dagId,
    );
    this.nodes = nodes;
    this.edges = edges;
    return {
      nodes,
      edges,
    };
  }

  get() {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  getNodes() {
    return this.nodes;
  }

  getEdges() {
    return this.edges;
  }

  async addNodes(nodes: GraphNode[]) {
    this.nodes.push(...nodes);
    await this.context.requestService.saveDag(this.context.dagId, {
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  async addEdges(edges: GraphEdge[]) {
    this.edges.push(...edges);
    await this.context.requestService.saveDag(this.context.dagId, {
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  async removeNodesOrEdges(nodeIds: string[], edgeIds: string[]) {
    this.nodes = this.nodes.filter((node) => !nodeIds.includes(node.id));
    this.edges = this.edges.filter((edge) => !edgeIds.includes(edge.id));
    this.context.requestService.saveDag(this.context.dagId, {
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  async changeNode(changed: { nodeId: string; meta: Partial<GraphNode> }[]) {
    changed.forEach(({ nodeId, meta }) => {
      const node = this.nodes.find((item) => item.id === nodeId);
      if (node) {
        Object.keys(meta).forEach((key) => {
          const str = key as keyof GraphNode;
          node[str] = meta[str] as never;
        });
      }
    });
    this.context.requestService.saveDag(this.context.dagId, {
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  async changeEdge(changed: { edgeId: string; meta: Partial<GraphEdge> }[]) {
    changed.forEach(({ edgeId, meta }) => {
      const edge = this.edges.find((item) => item.id === edgeId);
      if (edge) {
        Object.keys(meta).forEach((key) => {
          const str = key as keyof GraphEdge;
          edge[str] = meta[str] as never;
        });
      }
    });
    this.context.requestService.saveDag(this.context.dagId, {
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  close() {
    this.nodes = [];
    this.edges = [];
  }
}
