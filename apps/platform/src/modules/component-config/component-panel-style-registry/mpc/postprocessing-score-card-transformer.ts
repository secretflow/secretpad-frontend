import type { IComponentPanelStyleConfigs } from '../types';

export const postprocessingScoreCardTransformerConfig: IComponentPanelStyleConfigs = {
  'postprocessing/score_card_transformer': {
    attrs: {
      scaled_value: {
        style: { noWrap: true },
      },
      odd_base: {
        style: { noWrap: true },
      },
      pdo: {
        style: { noWrap: true },
      },
      min_score: {
        isAdvancedConfig: true,
        style: { noWrap: true },
      },
      max_score: {
        isAdvancedConfig: true,
        style: { noWrap: true },
      },
    },
  },
};
