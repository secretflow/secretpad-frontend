import {
  binModificationsSerializer,
  binModificationsUnSerializer,
} from './custom-render/binning-modification';
import {
  calculateSerializer,
  calculateUnserializer,
} from './custom-render/calculate-op-render';
import {
  caseWhenSerializer,
  caseWhenUnserializer,
} from './custom-render/case-when-render';
import {
  groupbySerializer,
  groupbyUnserializer,
} from './custom-render/groupby-render/serializer';
import {
  modelModificationsSerializer,
  modelModificationsUnSerializer,
} from './custom-render/linear-model-parameters-modification';
import {
  upstreamOutputFeatureSerializer,
  upstreamOutputFeatureUnserializer,
} from './custom-render/upstream-feature-render';

export const customSerializerRegistry = {
  'feature_column_config_pb2.FeatureColumnConfig': {
    serializer: upstreamOutputFeatureSerializer,
    unserializer: upstreamOutputFeatureUnserializer,
  },
  'case_when_rules_pb2.CaseWhenRule': {
    serializer: caseWhenSerializer,
    unserializer: caseWhenUnserializer,
  },
  Binning_modifications: {
    serializer: binModificationsSerializer,
    unserializer: binModificationsUnSerializer,
  },
  linear_model_pb2: {
    serializer: modelModificationsSerializer,
    unserializer: modelModificationsUnSerializer,
  },
  'calculate_rules_pb2.CalculateOpRules': {
    serializer: calculateSerializer,
    unserializer: calculateUnserializer,
  },
  'groupby_aggregation_config_pb2.GroupbyAggregationConfig': {
    serializer: groupbySerializer,
    unserializer: groupbyUnserializer,
  },
};
