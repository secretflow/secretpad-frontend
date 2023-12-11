import type { Node, Cell } from '@antv/x6';

export enum NodeStatus {
  success,
  running,
  failed,
  pending, // intialized
  default, // staging
  stopped,
  unfinished, // 待配置
}

export type GraphNodeOutput = {
  type: string;
  name: string;
  id: string;
};

export type GraphNode = {
  codeName: string;
  id: string;
  taskId: string;
  label: string;
  x: number;
  y: number;
  status: NodeStatus;
  //node meta info and attrs
  nodeDef?: any;
  outputs?: GraphNodeOutput[];
  styles?: {
    isOpaque?: boolean;
    isHighlighted?: boolean;
  };
};

export type GraphEdge = {
  id: string;
  source: string;
  sourceAnchor: string;
  target: string;
  targetAnchor: string;
};

export type GraphPort = {
  id: string;
  group: string;
  type: string[] | string;
  attrs?: {
    circle: {
      magnet: boolean;
    };
  };
};

export type GraphModel = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type { Cell, Node, Edge } from '@antv/x6';

export interface GraphEventHandlerFactory {
  new (): GraphEventHandlerProtocol;
}

export interface GraphEventHandlerProtocol {
  onNodeClick?: (node: Node) => void;
  onBlankClick?: () => void;
  onGraphScale?: (zoom: number) => void;
  onSelectionChanged?: (cells: Cell[]) => void;
  onEdgeUpdated?: () => void;
  onResultClick?: (graphId: string, outputId: string, codeName: string) => void;
  onNodeRunning?: (isRunning: boolean) => void;
  onCopyActionChange?: (isCopied: boolean) => void;
}
