import { type GroupByConfig } from './types';

export const groupbySerializer = (val: GroupByConfig, clsName: string) => {
  const { column_queries } = val;
  return {
    ...{ custom_value: { column_queries } },
    custom_protobuf_cls: clsName,
  };
};
export const groupbyUnserializer = (val?: {
  custom_value: GroupByConfig;
  custom_protobuf_cls: string;
}) => {
  if (!val) {
    return { column_queries: [{}, {}] };
  }
  const { custom_value } = val || {};
  return { ...custom_value };
};
