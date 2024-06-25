import type { IComponentPanelStyleConfigs } from '../types';

export const dataPrepPsiConfig: IComponentPanelStyleConfigs = {
  'data_prep/psi': {
    attrs: {
      'allow_duplicate_keys/no/check_hash_digest': {
        isShow: false,
      },
      allow_duplicate_keys: {
        order: 3,
      },
      sort_result: {
        isAdvancedConfig: true,
      },
      fill_value_int: {
        isAdvancedConfig: true,
      },
      ecdh_curve: {
        isAdvancedConfig: true,
      },
    },
  },
};
