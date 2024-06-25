import { CustomAdvancedBtnForSample } from '../../config-form-view';
import type { IComponentPanelStyleConfigs } from '../types';

export const dataFilterSampleConfig: IComponentPanelStyleConfigs = {
  'data_filter/sample': {
    attrs: {
      sample_algorithm: {
        order: 0,
      },
      frac: {
        order: 1,
        style: {
          noWrap: true,
        },
      },
      'sample_algorithm/random/replacement': {
        order: 2,
      },
      'sample_algorithm/random/random_state': {
        order: 3,
        isAdvancedConfig: true,
      },
      'sample_algorithm/stratify/observe_feature': {
        order: 2,
      },
      'sample_algorithm/stratify/quantiles': {
        order: 3,
      },
      'sample_algorithm/stratify/random_state': {
        order: 4,
        isAdvancedConfig: true,
      },
    },
    extraOptions: {
      getCustomAdvancedBtn: () => {
        return CustomAdvancedBtnForSample;
      },
    },
  },
};
