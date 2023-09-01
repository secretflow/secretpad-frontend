import { createRegistry } from '@secretflow/utils';
import { getModel } from '@/util/valtio-helper';

import { TemplateBlank } from './pipeline-template-blank';
import { TemplatePSI } from './pipeline-template-psi';
import { TemplateGuidePSI } from './pipeline-template-psi-guide';
import { TemplateRisk } from './pipeline-template-risk';
import { TemplateGuideRisk } from './pipeline-template-risk-guide';
import { PipelineTemplateContribution } from './pipeline-protocol';

const PipelineTemplatesRegistry = createRegistry<PipelineTemplateContribution>();

export const getPipelineTemplates = () => PipelineTemplatesRegistry.getData();

/**
 * 注册单例训练流模版
 */
PipelineTemplatesRegistry.register(getModel(TemplatePSI));
PipelineTemplatesRegistry.register(getModel(TemplateRisk));
PipelineTemplatesRegistry.register(getModel(TemplateBlank));
PipelineTemplatesRegistry.register(getModel(TemplateGuidePSI));
PipelineTemplatesRegistry.register(getModel(TemplateGuideRisk));
