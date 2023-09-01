import type { GraphEdge, GraphModel, GraphNode } from '@secretflow/dag';

type Override<P, S> = Omit<P, keyof S> & S;
export type IGraphNodeType = Override<API.GraphNodeDetail, GraphNode>;
export type IGraphEdgeType = Override<API.GraphEdge, GraphEdge>;

export type IGraphModel = Override<
  {
    nodes: IGraphNodeType[];
    edges: IGraphEdgeType[];
  },
  GraphModel
>;
