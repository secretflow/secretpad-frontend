import type { GraphNode } from '@secretflow/dag';

import type {
  AtomicParameterDef,
  AtomicParameterType,
  Attribute,
} from '@/modules/component-tree/component-protocol';

export type AtomicConfigNode = {
  name: string;
  type: AtomicParameterType;
  docString: string;
  isRequired: boolean;
  prefixes?: string[];
  value?: Attribute; //Record<string, any>;
  render?: string; // key in ConfigRenderRegistry for custom render
  col_max_cnt_inclusive?: number;
  col_min_cnt_inclusive?: number;
} & AtomicParameterDef;

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
  'ml.eval/biclassification_eval': 'COL_INPUT',
  'ml.eval/prediction_bias_eval': 'COL_INPUT',
  'preprocessing/psi': 'UNION_KEY_SELECT',
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
  'preprocessing/psi': (upstreamNodes: GraphNodeDetail[]) => {
    return upstreamNodes.map((n) => {
      const { codeName, nodeDef } = n || {};
      if (codeName !== 'read_data/datatable') return;
      const { attrs } = nodeDef;
      if (!attrs) return;
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
