import type { GraphNode } from '@secretflow/dag';

import type { Attribute, ValueOf } from '@/modules/component-tree/component-protocol';

import type { AtomicConfigNode, GraphNodeDetail } from '../component-config-protocol';

export type ConfigRenderProtocol = {
  registerConfigRenders: () => ConfigRender[];
};

export interface NodeAllInfo {
  nodeId: string;
  name: string;
  upstreamNodes: GraphNodeDetail[];
  graphNode: GraphNodeDetail;
  inputNodes: GraphNode[];
}

export type RenderProp<T> = {
  docString?: string;
  type: AtomicConfigNode['type'];
  value: T;
  defaultVal: T;
  node: AtomicConfigNode;
  nodeAllInfo: NodeAllInfo;
  onChange: (val: ValueOf<Attribute> | undefined | null) => void;
  translation: Record<string, string>;
  disabled: boolean;
  index: number;
  upstreamTables?: [string, string];
};

export type ConfigRender<T = any> = {
  canHandle: (config: AtomicConfigNode, renderKey?: string) => false | number;
  component: React.ComponentType<RenderProp<T>>;
};
