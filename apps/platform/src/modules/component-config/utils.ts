import type {
  AtomicParameterList,
  AtomicParameterType,
} from '@/modules/component-tree/component-protocol';

import type { AtomicParameter } from '../component-tree/component-protocol';

import type {
  AtomicConfigNode,
  ConfigItem,
  StructConfigNode,
} from './component-config-protocol';

export function isStructConfigNode(item: ConfigItem): item is StructConfigNode {
  return !!(item as StructConfigNode).children;
}

export function isAtomicConfigNode(
  item: ConfigItem,
  key: keyof AtomicConfigNode,
): item is AtomicConfigNode {
  return !!(item as AtomicConfigNode)[key];
}

export const getDefaultValue = (config: ConfigItem) => {
  if (isAtomicConfigNode(config, 'type')) {
    const { type } = config;
    const key = typesMap[type];

    if (!key) return {};

    const defaultVal =
      (config.value && config.value[key]) ||
      (config.default_value && config.default_value[key as keyof AtomicParameter]);

    return defaultVal;
  } else {
    return null;
  }
};

export const typesMap: Record<AtomicParameterType, keyof AtomicParameter> = {
  AT_BOOL: 'b',
  AT_INT: 'i64',
  AT_FLOAT: 'f',
  AT_STRING: 's',
  AT_BOOLS: 'bs',
  AT_FLOATS: 'fs',
  AT_INTS: 'i64s',
  AT_STRINGS: 'ss',
  AT_PARTY: 'ss',
  AT_SF_TABLE_COL: 'ss',
  AT_UNION_GROUP: 's',
  // AT_UNDEFINED: undefined,
};

export const typeListMap: Record<AtomicParameterType, keyof AtomicParameterList> = {
  AT_BOOL: 'bs',
  AT_INT: 'i64s',
  AT_FLOAT: 'fs',
  AT_STRING: 'ss',
  AT_BOOLS: 'bs',
  AT_FLOATS: 'fs',
  AT_INTS: 'i64s',
  AT_STRINGS: 'ss',
  AT_SF_TABLE_COL: 'ss',
};

export function getValueBound(config: AtomicConfigNode) {
  const { type } = config;
  const key = typesMap[type];
  if (!key) return {};

  let maxVal;
  if (config.upper_bound_enabled) {
    maxVal = config.upper_bound?.[key as keyof AtomicParameter] as number;
  }
  let minVal;
  if (config.lower_bound_enabled) {
    minVal = (config.lower_bound?.[key as keyof AtomicParameter] || 0) as number;
  }

  return {
    maxVal,
    minVal,
    maxInclusive: config.upper_bound_inclusive,
    minInclusive: config.lower_bound_inclusive,
  };
}
