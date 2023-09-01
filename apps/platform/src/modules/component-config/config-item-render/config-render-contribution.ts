import type { AtomicConfigNode } from '../component-config-protocol';

import type { ConfigRenderProtocol } from './config-render-protocol';
import { DefaultColSelection } from './defalt-col-selection-template';
import { DefaultMultiTableFeatureSelection } from './default-feature-selection/default-feature-selection';
import { DefaultNodeSelect } from './default-node-selection-template';
import {
  DefaultInputNumber,
  DefaultSwitch,
  DefaultInput,
  DefaultSelect,
} from './default-render-template';
import { DefaultTableSelect } from './default-table-selection-temple';

export class DefaultConfigRender implements ConfigRenderProtocol {
  registerConfigRenders() {
    return [
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
          return renderKey === 'COL_INPUT' && node.type === 'AT_SF_TABLE_COL'
            ? 3
            : false;
        },
        component: DefaultInput,
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
    ];
  }
}
