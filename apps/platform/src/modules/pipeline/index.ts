import { createRegistry } from '@secretflow/utils';

import { getModel } from '@/util/valtio-helper';

import type { PipelineTemplateContribution } from './pipeline-protocol';
import { TemplateBlank } from './templates/pipeline-template-blank';
import { TemplatePSI } from './templates/pipeline-template-psi';
import { TemplateGuidePSI } from './templates/pipeline-template-psi-guide';
import { TemplateTeePSI } from './templates/pipeline-template-psi-tee';
import { TemplateGuideTeePSI } from './templates/pipeline-template-psi-tee-guide';
import { TemplateRisk } from './templates/pipeline-template-risk';
import { TemplateGuideRisk } from './templates/pipeline-template-risk-guide';
import { TemplateTEE } from './templates/pipeline-template-tee';
import { TemplateGuidTEE } from './templates/pipeline-template-tee-guide';

const PipelineTemplatesRegistry = createRegistry<PipelineTemplateContribution>();

export const getPipelineTemplates = () => PipelineTemplatesRegistry.getData();

/**
 * 注册单例训练流模版
 */
PipelineTemplatesRegistry.register(getModel(TemplatePSI));
PipelineTemplatesRegistry.register(getModel(TemplateTeePSI));
PipelineTemplatesRegistry.register(getModel(TemplateRisk));
PipelineTemplatesRegistry.register(getModel(TemplateTEE));
PipelineTemplatesRegistry.register(getModel(TemplateBlank));
PipelineTemplatesRegistry.register(getModel(TemplateGuidePSI));
PipelineTemplatesRegistry.register(getModel(TemplateGuideTeePSI));
PipelineTemplatesRegistry.register(getModel(TemplateGuideRisk));
PipelineTemplatesRegistry.register(getModel(TemplateGuidTEE));
