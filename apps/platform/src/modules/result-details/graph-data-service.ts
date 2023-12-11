import { DefaultDataService } from '@secretflow/dag';

import type { IGraphEdgeType, IGraphNodeType } from '@/modules/main-dag/graph.protocol';
import { nodeStatus } from '@/modules/main-dag/util';

import type { ComputeMode } from '../component-tree/component-protocol';

export class GraphDataService extends DefaultDataService {
  nodes: IGraphNodeType[] = [];
  edges: IGraphEdgeType[] = [];

  highlightNodeId = '';
  mode: ComputeMode | undefined;

  setGraphInfo = ({
    nodes,
    edges,
    highlightNodeId,
    mode,
  }: {
    nodes: IGraphNodeType[];
    edges: IGraphEdgeType[];
    highlightNodeId: string;
    mode: ComputeMode;
  }) => {
    this.nodes = nodes;
    this.edges = edges;
    this.highlightNodeId = highlightNodeId;
    this.mode = mode;
  };

  async fetch() {
    const handledNodes = this.nodes.map((node: IGraphNodeType) => {
      if (this.highlightNodeId === node.taskId) {
        return { ...node, styles: { isHighlighted: true } };
      } else {
        return { ...node, styles: { isHighlighted: false } };
      }
    });

    const handleEdges = this.edges.filter((i: IGraphEdgeType) => {
      return (
        this.nodes.find((node) => node.graphNodeId === i.source) &&
        this.nodes.find((node) => node.graphNodeId === i.target)
      );
    });

    const convertedNodes = handledNodes.map((n) => {
      const { status, graphNodeId, ...options } = n;
      return {
        ...options,
        id: graphNodeId,
        status: nodeStatus[status || 'STAGING'],
      } as unknown as IGraphNodeType;
    });

    const convertedEdges = handleEdges.map((e) => {
      const { edgeId, ...options } = e;
      return { ...options, id: edgeId } as unknown as IGraphEdgeType;
    });

    this.nodes = convertedNodes;
    this.edges = convertedEdges;

    return {
      nodes: convertedNodes,
      edges: convertedEdges,
    };
  }
}
