import type { Attribute, ValueOf } from '@/modules/component-tree/component-protocol';

import type { AtomicConfigNode } from '../component-config-protocol';

export type ConfigRenderProtocol = {
  registerConfigRenders: () => ConfigRender[];
};

export type RenderProp<T> = {
  docString?: string;
  type: AtomicConfigNode['type'];
  value: T;
  defaultVal: T;
  node: AtomicConfigNode;
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
