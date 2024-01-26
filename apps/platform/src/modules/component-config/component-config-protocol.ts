import type { GraphNode } from '@secretflow/dag';

import type {
  AtomicParameterDef,
  AtomicParameterType,
  Attribute,
} from '@/modules/component-tree/component-protocol';

export type AtomicConfigNode = {
  name: string;
  type: AtomicParameterType;
  fromInputIndex?: number;
  docString: string;
  isRequired: boolean;
  prefixes?: string[];
  value?: Attribute; //Record<string, any>;
  render?: string; // key in ConfigRenderRegistry for custom render
  col_max_cnt_inclusive?: number;
  col_min_cnt_inclusive?: number;
} & AtomicParameterDef;

export type CustomConfigNode = {
  name: string;
  type: 'AT_CUSTOM_PROTOBUF';
  custom_protobuf_cls: string;
  prefixes?: string[];
};

export type StructConfigNode = {
  selectedName?: string;
  name: string;
  prefixes?: string[];
  domain?: string;
  version?: string;
  children: ConfigItem[];
};

// 叶子结点：AtomicConfigNode
// 非叶子结点：StructConfigNode
export type ConfigItem = StructConfigNode | AtomicConfigNode;

export type ConfigPrefix = string;

export type ComponentConfigRegistry = {
  root: ConfigItem;
  registerConfigNode: (path: ConfigPrefix[], node: ConfigItem) => void;
  getComponentConfig: (componentName: string) => ConfigItem;
  getNodeByPath: (path: ConfigPrefix[]) => ConfigItem;
};

export const codeNameRenderKey = {
  'read_data/datatable': 'DATA_TABLE_SELECT',
  'data_prep/psi': 'UNION_KEY_SELECT',
  'preprocessing/psi': 'UNION_KEY_SELECT',
  'preprocessing/sqlite': 'SQL',
};

export const codeNameRenderIndex = {
  'preprocessing/binary_op': [0, 2, 1, 3, 4],
};

export interface ComponentConfig {
  projectId: string;
  graphId: string;
  node: GraphNodeInfo;
  isFinished: boolean;
}

export type NodeDef = {
  domain: string;
  name: string;
  version: string;
  attrPaths?: string[];
  attrs?: Attribute[];
};

interface GraphNodeInfo {
  codeName: string;
  graphNodeId: string;
  label?: string;
  x?: number;
  y?: number;
  inputs?: string[];
  outputs?: string[];
  nodeDef: NodeDef;
}

export interface GraphNodeDetail {
  codeName: string;
  graphNodeId: string;
  label: string;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  nodeDef: NodeDef;
  status: GraphNodeTaskStatus;
  /** jobId，这个GraphNode关联的Job，如果没有关联则为空 */
  jobId?: string;
  /** taskId，这个GraphNode关联的Task，如果没有关联则为空 */
  taskId?: string;
  results: ProjectResultBaseVO[];
}

interface ProjectResultBaseVO {
  kind: ResultKind;
  refId: string;
}
type GraphNodeTaskStatus =
  | 'STAGING'
  | 'INITIALIZED'
  | 'RUNNING'
  | 'STOPPED'
  | 'SUCCEED'
  | 'FAILED';

type ResultKind = 'FedTable' | 'Model' | 'Rule' | 'Report';

export const getUpstreamKey = {
  'data_prep/psi': (upstreamNodes: GraphNodeDetail[], graphNode?: GraphNodeDetail) => {
    const { inputs = [] } = graphNode || {};
    return upstreamNodes.map((n, index) => {
      const { codeName, nodeDef } = n || {};
      if (codeName !== 'read_data/datatable') return inputs[index];
      const { attrs } = nodeDef;
      if (!attrs) return inputs[index];
      return attrs[0]?.s;
    });
  },
  'preprocessing/psi': (
    upstreamNodes: GraphNodeDetail[],
    graphNode?: GraphNodeDetail,
  ) => {
    const { inputs = [] } = graphNode || {};
    return upstreamNodes.map((n, index) => {
      const { codeName, nodeDef } = n || {};
      if (codeName !== 'read_data/datatable') return inputs[index];
      const { attrs } = nodeDef;
      if (!attrs) return inputs[index];
      return attrs[0]?.s;
    });
  },
};

export const getInputTables = (inputNodes: GraphNode[]) => {
  return inputNodes?.map((n) => {
    const { codeName, nodeDef } = n || {};
    if (codeName !== 'read_data/datatable') return;
    const { attrs } = nodeDef;
    if (!attrs) return;
    return attrs[0]?.s;
  });
};
