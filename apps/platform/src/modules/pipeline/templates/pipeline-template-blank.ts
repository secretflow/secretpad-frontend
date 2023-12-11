import templateImg from '@/assets/blank_template.png';
import { Model } from '@/util/valtio-helper';

import type { PipelineTemplateContribution } from '../pipeline-protocol';
import { PipelineTemplateType } from '../pipeline-protocol';

export class TemplateBlank extends Model implements PipelineTemplateContribution {
  type: PipelineTemplateType = PipelineTemplateType.BLANK;
  name = '自定义训练流';
  argsFilled = false;
  description = '默认创建空白训练流';
  minimap = templateImg;
  computeMode = ['MPC', 'TEE'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  content = (graphId: string) => ({
    edges: [],
    nodes: [],
  });
}
