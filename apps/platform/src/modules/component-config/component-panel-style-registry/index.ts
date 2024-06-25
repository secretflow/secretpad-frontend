import type { ComputeMode } from '../../component-tree/component-protocol';
import { ComputeModeEnum } from '../../component-tree/component-protocol';

import { dataFilterSampleConfig } from './mpc/data-filter-sample';
import { dataPrepPsiConfig } from './mpc/data-prep-psi';
import { postprocessingScoreCardTransformerConfig } from './mpc/postprocessing-score-card-transformer';
import { preprocessingBinaryOpConfig } from './mpc/preprocessing-binary-op';
import type { IComponentPanelStyleConfigs } from './types';

export * from './types';

class ComponentPanelStyleConfigsRegistry {
  componentPanelStyleConfigs: Record<ComputeMode, IComponentPanelStyleConfigs> = {
    MPC: {},
    TEE: {},
  };

  register = (mode: ComputeMode, configMap: IComponentPanelStyleConfigs) => {
    this.componentPanelStyleConfigs[mode] = {
      ...this.componentPanelStyleConfigs[mode],
      ...configMap,
    };

    return this.componentPanelStyleConfigs;
  };

  getData = (mode: ComputeMode) => {
    return this.componentPanelStyleConfigs[mode];
  };
}

export const componentPanelStyleConfigs = new ComponentPanelStyleConfigsRegistry();

/** 注册组件面板样式
 * 1. 选择 mpc / tee 模式
 * 2. 在对应文件夹下编写配置文件
 * 3. 注册样式 ⬇️
 */
componentPanelStyleConfigs.register(ComputeModeEnum.MPC, dataFilterSampleConfig);
componentPanelStyleConfigs.register(ComputeModeEnum.MPC, dataPrepPsiConfig);
componentPanelStyleConfigs.register(
  ComputeModeEnum.MPC,
  postprocessingScoreCardTransformerConfig,
);
componentPanelStyleConfigs.register(ComputeModeEnum.MPC, preprocessingBinaryOpConfig);
