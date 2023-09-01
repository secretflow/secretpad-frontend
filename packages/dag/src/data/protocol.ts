import type { GraphModel, GraphNode, GraphEdge } from '../types';

export type DataService = {
  close: () => void;
  setGraphInfo?: (...arg: any) => void;

  fetch: () => Promise<GraphModel>;

  get: () => GraphModel;
  getNodes: () => GraphNode[];
  getEdges: () => GraphEdge[];

  addNodes: (nodes: GraphNode[]) => Promise<void>;
  addEdges: (edges: GraphEdge[]) => Promise<void>;
  removeNodesOrEdges: (nodeIds: string[], edgeIds: string[]) => Promise<void>;
  changeNode: (
    changed: { nodeId: string; meta: Partial<GraphNode> }[],
  ) => Promise<void>;
  changeEdge: (
    changed: { edgeId: string; meta: Partial<GraphEdge> }[],
  ) => Promise<void>;
};
