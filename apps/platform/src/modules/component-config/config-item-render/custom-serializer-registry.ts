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
  unionSerializer,
  unionUnserializer,
} from './custom-render/union-render/serializer';

export const customSerializerRegistry = {
  union: {
    serializer: unionSerializer,
    unserializer: unionUnserializer,
  },
  'case_when_rules_pb2.CaseWhenRule': {
    serializer: caseWhenSerializer,
    unserializer: caseWhenUnserializer,
  },
  Binning_modifications: {
    serializer: binModificationsSerializer,
    unserializer: binModificationsUnSerializer,
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
