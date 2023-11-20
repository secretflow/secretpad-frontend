import templateImg from '@/assets/tee-preview-template.jpg';
import { Model } from '@/util/valtio-helper';

import type { PipelineTemplateContribution } from '../pipeline-protocol';
import { PipelineTemplateType } from '../pipeline-protocol';

export class TemplateTEE extends Model implements PipelineTemplateContribution {
  type: PipelineTemplateType = PipelineTemplateType.TEE;
  name = `金融风控`;
  argsFilled = false;
  description = '二分类训练流模板';
  computeMode = ['TEE'];

  minimap = templateImg;
  content = (graphId: string, quickConfigs?: any) => {
    const {
      dataTableReceiver,
      dataTableSender,
      receiverKey,
      senderKey,
      featureSelects,
      labelSelect,
      predictIdSelect,
      label,
      score,
      trainIdSelect,
      saveId,
      saveLabel,
    } = quickConfigs || {};

    return {
      edges: [
        {
          edgeId: `${graphId}-node-1-output-0__${graphId}-node-3-input-0`,
          source: `${graphId}-node-1`,
          sourceAnchor: `${graphId}-node-1-output-0`,
          target: `${graphId}-node-3`,
          targetAnchor: `${graphId}-node-3-input-0`,
        },
        {
          edgeId: `${graphId}-node-2-output-0__${graphId}-node-3-input-1`,
          source: `${graphId}-node-2`,
          sourceAnchor: `${graphId}-node-2-output-0`,
          target: `${graphId}-node-3`,
          targetAnchor: `${graphId}-node-3-input-1`,
        },
        {
          edgeId: `${graphId}-node-3-output-0__${graphId}-node-4-input-0`,
          source: `${graphId}-node-3`,
          sourceAnchor: `${graphId}-node-3-output-0`,
          target: `${graphId}-node-4`,
          targetAnchor: `${graphId}-node-4-input-0`,
        },
        {
          edgeId: `${graphId}-node-3-output-0__${graphId}-node-5-input-0`,
          source: `${graphId}-node-3`,
          sourceAnchor: `${graphId}-node-3-output-0`,
          target: `${graphId}-node-5`,
          targetAnchor: `${graphId}-node-5-input-0`,
        },
        {
          edgeId: `${graphId}-node-5-output-0__${graphId}-node-6-input-0`,
          source: `${graphId}-node-5`,
          sourceAnchor: `${graphId}-node-5-output-0`,
          target: `${graphId}-node-6`,
          targetAnchor: `${graphId}-node-6-input-0`,
        },
        {
          edgeId: `${graphId}-node-5-output-0__${graphId}-node-7-input-0`,
          source: `${graphId}-node-5`,
          sourceAnchor: `${graphId}-node-5-output-0`,
          target: `${graphId}-node-7`,
          targetAnchor: `${graphId}-node-7-input-0`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-7-input-1`,
          source: `${graphId}-node-6`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          target: `${graphId}-node-7`,
          targetAnchor: `${graphId}-node-7-input-1`,
        },
        {
          edgeId: `${graphId}-node-7-output-0__${graphId}-node-8-input-0`,
          source: `${graphId}-node-7`,
          sourceAnchor: `${graphId}-node-7-output-0`,
          target: `${graphId}-node-8`,
          targetAnchor: `${graphId}-node-8-input-0`,
        },
        {
          edgeId: `${graphId}-node-7-output-0__${graphId}-node-9-input-0`,
          source: `${graphId}-node-7`,
          sourceAnchor: `${graphId}-node-7-output-0`,
          target: `${graphId}-node-9`,
          targetAnchor: `${graphId}-node-9-input-0`,
        },
        {
          edgeId: `${graphId}-node-7-output-0__${graphId}-node-10-input-0`,
          source: `${graphId}-node-7`,
          sourceAnchor: `${graphId}-node-7-output-0`,
          target: `${graphId}-node-10`,
          targetAnchor: `${graphId}-node-10-input-0`,
        },
        {
          edgeId: `${graphId}-node-10-output-0__${graphId}-node-11-input-1`,
          source: `${graphId}-node-10`,
          sourceAnchor: `${graphId}-node-10-output-0`,
          target: `${graphId}-node-11`,
          targetAnchor: `${graphId}-node-11-input-1`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-12-input-1`,
          source: `${graphId}-node-6`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          target: `${graphId}-node-12`,
          targetAnchor: `${graphId}-node-12-input-1`,
        },
        {
          edgeId: `${graphId}-node-5-output-1__${graphId}-node-12-input-0`,
          source: `${graphId}-node-5`,
          sourceAnchor: `${graphId}-node-5-output-1`,
          target: `${graphId}-node-12`,
          targetAnchor: `${graphId}-node-12-input-0`,
        },
        {
          edgeId: `${graphId}-node-12-output-0__${graphId}-node-11-input-0`,
          source: `${graphId}-node-12`,
          sourceAnchor: `${graphId}-node-12-output-0`,
          target: `${graphId}-node-11`,
          targetAnchor: `${graphId}-node-11-input-0`,
        },
        {
          edgeId: `${graphId}-node-11-output-0__${graphId}-node-13-input-0`,
          source: `${graphId}-node-11`,
          sourceAnchor: `${graphId}-node-11-output-0`,
          target: `${graphId}-node-13`,
          targetAnchor: `${graphId}-node-13-input-0`,
        },
        {
          edgeId: `${graphId}-node-11-output-0__${graphId}-node-14-input-0`,
          source: `${graphId}-node-11`,
          sourceAnchor: `${graphId}-node-11-output-0`,
          target: `${graphId}-node-14`,
          targetAnchor: `${graphId}-node-14-input-0`,
        },
      ],
      nodes: [
        {
          codeName: 'read_data/datatable',
          graphNodeId: `${graphId}-node-1`,
          label: '样本表',
          x: -380,
          y: -180,
          inputs: [],
          outputs: [`${graphId}-node-1-output-0`],
          nodeDef: {
            ...(dataTableReceiver
              ? {
                  attrPaths: ['datatable_selected'],
                  attrs: [{ ...dataTableReceiver, is_na: false }],
                }
              : {}),
            domain: 'read_data',
            name: 'datatable',
            version: '0.0.1',
          },
          status: 'STAGING',
        },

        {
          codeName: 'ml.train/lr_train',
          graphNodeId: `${graphId}-node-10`,
          label: 'LR训练',
          x: -60,
          y: 320,
          inputs: [`${graphId}-node-7-output-0`],
          outputs: [`${graphId}-node-10-output-0`],
          nodeDef: {
            ...(labelSelect
              ? {
                  attrPaths: ['input/train_dataset/ids', 'input/train_dataset/label'],
                  attrs: [
                    trainIdSelect
                      ? { ...trainIdSelect, is_na: false }
                      : { ss: [], is_na: true },
                    { ...labelSelect, is_na: false },
                  ],
                }
              : {}),
            domain: 'ml.train',
            name: 'lr_train',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'ml.predict/lr_predict',
          graphNodeId: `${graphId}-node-11`,
          label: 'LR预测',
          x: -40,
          y: 390,
          inputs: [`${graphId}-node-12-output-0`, `${graphId}-node-10-output-0`],
          outputs: [`${graphId}-node-11-output-0`],
          nodeDef: {
            ...(labelSelect
              ? {
                  attrPaths: [
                    'input/feature_dataset/ids',
                    'input/feature_dataset/label',
                    'save_id',
                    'save_label',
                  ],
                  attrs: [
                    predictIdSelect
                      ? { ...predictIdSelect, is_na: false }
                      : { ss: [], is_na: true },
                    { ...labelSelect, is_na: false },
                    { b: saveId, is_na: false },
                    { b: saveLabel, is_na: false },
                  ],
                }
              : {}),
            domain: 'ml.predict',
            name: 'lr_predict',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'feature/vert_woe_substitution',
          graphNodeId: `${graphId}-node-12`,
          label: 'WOE转换',
          x: -60,
          y: 200,
          inputs: [`${graphId}-node-5-output-1`, `${graphId}-node-6-output-0`],
          outputs: [`${graphId}-node-12-output-0`],
          nodeDef: {
            domain: 'feature',
            name: 'vert_woe_substitution',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'ml.eval/biclassification_eval',
          graphNodeId: `${graphId}-node-13`,
          label: '二分类评估',
          x: -40,
          y: 490,
          inputs: [`${graphId}-node-11-output-0`],
          outputs: [`${graphId}-node-13-output-0`],
          nodeDef: {
            ...(label && score
              ? {
                  attrPaths: ['input/predictions/label', 'input/predictions/score'],
                  attrs: [
                    { ...label, is_na: false },
                    { ...score, is_na: false },
                  ],
                }
              : {}),
            domain: 'ml.eval',
            name: 'biclassification_eval',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'ml.eval/prediction_bias_eval',
          graphNodeId: `${graphId}-node-14`,
          label: '预测偏差评估',
          x: -270,
          y: 490,
          inputs: [`${graphId}-node-11-output-0`],
          outputs: [`${graphId}-node-14-output-0`],
          nodeDef: {
            ...(label && score
              ? {
                  attrPaths: ['input/predictions/label', 'input/predictions/score'],
                  attrs: [
                    { ...label, is_na: false },
                    { ...score, is_na: false },
                  ],
                }
              : {}),
            domain: 'ml.eval',
            name: 'prediction_bias_eval',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'read_data/datatable',
          graphNodeId: `${graphId}-node-2`,
          label: '样本表',
          x: -160,
          y: -180,
          inputs: [],
          outputs: [`${graphId}-node-2-output-0`],
          nodeDef: {
            ...(dataTableSender
              ? {
                  attrPaths: ['datatable_selected'],
                  attrs: [{ ...dataTableSender, is_na: false }],
                }
              : {}),
            domain: 'read_data',
            name: 'datatable',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'preprocessing/psi',
          graphNodeId: `${graphId}-node-3`,
          label: '隐私求交',
          x: -270,
          y: -90,
          inputs: [`${graphId}-node-1-output-0`, `${graphId}-node-2-output-0`],
          outputs: [`${graphId}-node-3-output-0`],
          nodeDef: {
            ...(receiverKey && senderKey
              ? {
                  attrPaths: ['input/input1/key', 'input/input2/key'],
                  attrs: [
                    { ...receiverKey, is_na: false },
                    { ...senderKey, is_na: false },
                  ],
                }
              : {}),
            domain: 'preprocessing',
            name: 'psi',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'stats/table_statistics',
          graphNodeId: `${graphId}-node-4`,
          label: '全表统计',
          x: -470,
          y: 10,
          inputs: [`${graphId}-node-3-output-0`],
          outputs: [`${graphId}-node-4-output-0`],
          nodeDef: {
            domain: 'stats',
            name: 'table_statistics',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'preprocessing/train_test_split',
          graphNodeId: `${graphId}-node-5`,
          label: '随机分割',
          x: -160,
          y: 10,
          inputs: [`${graphId}-node-3-output-0`],
          outputs: [`${graphId}-node-5-output-0`, `${graphId}-node-5-output-1`],
          nodeDef: {
            domain: 'preprocessing',
            name: 'train_test_split',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'feature/vert_woe_binning',
          graphNodeId: `${graphId}-node-6`,
          label: 'WOE分箱',
          x: -140,
          y: 120,
          inputs: [`${graphId}-node-5-output-0`],
          outputs: [`${graphId}-node-6-output-0`],
          nodeDef: {
            ...(featureSelects && labelSelect
              ? {
                  attrPaths: [
                    'input/input_data/feature_selects',
                    'input/input_data/label',
                  ],
                  attrs: [
                    { ...featureSelects, is_na: false },
                    { ...labelSelect, is_na: false },
                  ],
                }
              : {}),
            domain: 'feature',
            name: 'vert_woe_binning',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'feature/vert_woe_substitution',
          graphNodeId: `${graphId}-node-7`,
          label: 'WOE转换',
          x: -410,
          y: 200,
          inputs: [`${graphId}-node-5-output-0`, `${graphId}-node-6-output-0`],
          outputs: [`${graphId}-node-7-output-0`],
          nodeDef: {
            domain: 'feature',
            name: 'vert_woe_substitution',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'stats/pearsonr',
          graphNodeId: `${graphId}-node-8`,
          label: '相关系数矩阵',
          x: -540,
          y: 320,
          inputs: [`${graphId}-node-7-output-0`],
          outputs: [`${graphId}-node-8-output-0`],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_data/feature_selects'],
                  attrs: [{ ...featureSelects, is_na: false }],
                }
              : {}),
            domain: 'stats',
            name: 'pearsonr',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
        {
          codeName: 'stats/vif',
          graphNodeId: `${graphId}-node-9`,
          label: 'VIF指标计算',
          x: -280,
          y: 320,
          inputs: [`${graphId}-node-7-output-0`],
          outputs: [`${graphId}-node-9-output-0`],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_data/feature_selects'],
                  attrs: [{ ...featureSelects, is_na: false }],
                }
              : {}),
            domain: 'stats',
            name: 'vif',
            version: '0.0.1',
          },
          status: 'STAGING',
        },
      ],
    };
  };
}
