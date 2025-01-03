import type { AtomicConfigNode, CustomConfigNode } from '../component-config-protocol';

import type { ConfigRenderProtocol } from './config-render-protocol';
import { BinModificationsRender } from './custom-render/binning-modification';
import { CalculateOpRender } from './custom-render/calculate-op-render';
import { CaseWhenRender } from './custom-render/case-when-render';
import { GroupByRender } from './custom-render/groupby-render';
import { LinearModelParametersModificationRender } from './custom-render/linear-model-parameters-modification';
import ObservationsQuantilesRender from './custom-render/observations-quantiles-render';
import { AnalyzeSQLEditor } from './custom-render/scql-editor/scql-editor-content';
import { UpstreamOutputFeatureRender } from './custom-render/upstream-feature-render';
import { DefaultColSelection } from './default-col-selection-template';
import { DefaultMultiTableFeatureSelection } from './default-feature-selection/default-feature-selection';
import { DefaultJoinNodeSelect } from './default-join-node-selection-template';
import { DefaultModelSelect } from './default-model-selection-template';
import { DefaultNodeSelect } from './default-node-selection-template';
import {
  DefaultInputNumber,
  DefaultSwitch,
  DefaultInput,
  DefaultSelect,
  DefaultUnion,
  DefaultStruct,
  DefaultEmpty,
} from './default-render-template';
import { DefaultSQLEditor } from './default-sql-editor';
import { DefaultTableSelect } from './default-table-selection-temple';
import { nodePartiesByUpstreamOutputSelect } from './node-parties-by-upstream-output';
import { UnbalancePsiColSelect } from './unbalance-psi-custom/query-col-selection';
import { UnbalancePsiCustomSelect } from './unbalance-psi-custom/result-receive-select';

export class DefaultConfigRender implements ConfigRenderProtocol {
  registerConfigRenders() {
    return [
      {
        canHandle: (node: AtomicConfigNode) => {
          return node.type === 'AT_UNION_GROUP' ? 1 : false;
        },
        component: DefaultUnion,
      },
      {
        canHandle: (node: AtomicConfigNode) => {
          return node.type === 'AT_STRUCT_GROUP' ? 1 : false;
        },
        component: DefaultStruct,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls === 'Binning_modifications'
            ? 1
            : false,
        component: BinModificationsRender,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls === 'linear_model_pb2'
            ? 1
            : false,
        component: LinearModelParametersModificationRender,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls === 'feature_column_config_pb2.FeatureColumnConfig'
            ? 1
            : false,
        component: UpstreamOutputFeatureRender,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls === 'case_when_rules_pb2.CaseWhenRule'
            ? 1
            : false,
        component: CaseWhenRender,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls === 'calculate_rules_pb2.CalculateOpRules'
            ? 1
            : false,
        component: CalculateOpRender,
      },
      {
        canHandle: (node: CustomConfigNode) =>
          node.type === 'AT_CUSTOM_PROTOBUF' &&
          node.custom_protobuf_cls ===
            'groupby_aggregation_config_pb2.GroupbyAggregationConfig'
            ? 1
            : false,
        component: GroupByRender,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_STRING' &&
          node.name === 'script_input' &&
          renderKey === 'SQL_ANALYSIS'
            ? 1
            : false,
        component: AnalyzeSQLEditor,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_PARTY' &&
          node.name === 'task_initiator' &&
          renderKey === 'SQL_ANALYSIS'
            ? 1
            : false,
        component: nodePartiesByUpstreamOutputSelect,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) => {
          return renderKey === 'UNION_KEY_SELECT' && node.type === 'AT_SF_TABLE_COL'
            ? 3
            : false;
        },
        component: DefaultColSelection,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) => {
          //  非平衡 PSI 求交键
          return renderKey === 'UNBALANCE_PSI' && node.type === 'AT_SF_TABLE_COL'
            ? 1
            : false;
        },
        component: UnbalancePsiColSelect,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) => {
          //  非平衡 PSI 结果接收方
          return renderKey === 'UNBALANCE_PSI' && node.type === 'AT_PARTY' ? 1 : false;
        },
        component: UnbalancePsiCustomSelect,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) => {
          // 非平衡 PSI 密文缓存
          return node.type === 'AT_PARTY' && renderKey === 'UNBALANCE_PSI_CACHE'
            ? 1
            : false;
        },
        component: DefaultJoinNodeSelect,
      },
      {
        canHandle: (node: AtomicConfigNode) => {
          return node.name === 'receiver' ? 3 : false;
        },
        component: DefaultNodeSelect,
      },
      {
        canHandle: (_node: AtomicConfigNode, renderKey?: string) => {
          return renderKey === 'DATA_TABLE_SELECT' ? 3 : false;
        },
        component: DefaultTableSelect,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) => {
          return renderKey === 'MODEL_SELECT' ? 3 : false;
        },
        component: DefaultModelSelect,
      },
      {
        canHandle: (node: AtomicConfigNode) => {
          return node.allowed_values ? 2 : false;
        },
        component: DefaultSelect,
      },
      {
        canHandle: (node: AtomicConfigNode) =>
          node.type === 'AT_SF_TABLE_COL' ? 1 : false,
        component: DefaultMultiTableFeatureSelection,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_STRING' &&
          node.name === 'sql' &&
          renderKey === 'SQL_PROCESSOR'
            ? 1
            : false,
        component: DefaultSQLEditor,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_STRING' && node.name === 'sql' && renderKey === 'SQL'
            ? 1
            : false,
        component: DefaultSQLEditor,
      },
      {
        canHandle: (node: AtomicConfigNode) => (node.type === 'AT_BOOL' ? 1 : false),
        component: DefaultSwitch,
      },
      {
        canHandle: (node: AtomicConfigNode) =>
          node.type === 'AT_INT' || node.type === 'AT_FLOAT' ? 1 : false,
        component: DefaultInputNumber,
      },
      {
        canHandle: (node: AtomicConfigNode) => (node.type === 'AT_STRING' ? 1 : false),
        component: DefaultInput,
      },
      {
        canHandle: (node: AtomicConfigNode) => (node.type === 'AT_PARTY' ? 1 : false),
        component: DefaultNodeSelect,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_FLOATS' &&
          node.name === 'quantiles' &&
          renderKey === 'SAMPLE'
            ? 1
            : false,
        component: ObservationsQuantilesRender,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_BOOLS' &&
          node.name === 'replacements' &&
          renderKey === 'SAMPLE'
            ? 1
            : false,
        component: DefaultEmpty,
      },
      {
        canHandle: (node: AtomicConfigNode, renderKey?: string) =>
          node.type === 'AT_FLOATS' && node.name === 'weights' && renderKey === 'SAMPLE'
            ? 1
            : false,
        component: DefaultEmpty,
      },
    ];
  }
}
