import templateImg from '@/assets/template-risk-control.jpg';
import { Model } from '@/util/valtio-helper';

import type { PipelineTemplateContribution } from '../pipeline-protocol';
import { PipelineTemplateType } from '../pipeline-protocol';

export class TemplateRisk extends Model implements PipelineTemplateContribution {
  type: PipelineTemplateType = PipelineTemplateType.RISK;
  name = `二分类建模`;
  argsFilled = false;
  description = '二分类训练流模板';

  // TODO: this is place holder, to be replaced
  minimap = templateImg;
  content = (graphId: string, quickConfigs?: any) => {
    const {
      dataTableReceiver,
      dataTableReceiverPartition,
      dataTableSender,
      dataTableSenderPartition,
      receiverKey,
      senderKey,
      featureSelects,
      labelSelects,
      receiver,
      receiverPSI,
      pred,
    } = quickConfigs || {};
    return {
      edges: [
        {
          edgeId: `${graphId}-node-1-output-0__${graphId}-node-3-input-0`,
          sourceAnchor: `${graphId}-node-1-output-0`,
          targetAnchor: `${graphId}-node-3-input-0`,
          source: `${graphId}-node-1`,
          target: `${graphId}-node-3`,
        },
        {
          edgeId: `${graphId}-node-2-output-0__${graphId}-node-3-input-1`,
          sourceAnchor: `${graphId}-node-2-output-0`,
          targetAnchor: `${graphId}-node-3-input-1`,
          source: `${graphId}-node-2`,
          target: `${graphId}-node-3`,
        },
        {
          edgeId: `${graphId}-node-3-output-0__${graphId}-node-4-input-0`,
          sourceAnchor: `${graphId}-node-3-output-0`,
          targetAnchor: `${graphId}-node-4-input-0`,
          source: `${graphId}-node-3`,
          target: `${graphId}-node-4`,
        },
        {
          edgeId: `${graphId}-node-3-output-0__${graphId}-node-5-input-0`,
          sourceAnchor: `${graphId}-node-3-output-0`,
          targetAnchor: `${graphId}-node-5-input-0`,
          source: `${graphId}-node-3`,
          target: `${graphId}-node-5`,
        },
        {
          edgeId: `${graphId}-node-5-output-0__${graphId}-node-6-input-0`,
          sourceAnchor: `${graphId}-node-5-output-0`,
          targetAnchor: `${graphId}-node-6-input-0`,
          source: `${graphId}-node-5`,
          target: `${graphId}-node-6`,
        },
        {
          edgeId: `${graphId}-node-5-output-1__${graphId}-node-8-input-0`,
          sourceAnchor: `${graphId}-node-5-output-1`,
          targetAnchor: `${graphId}-node-8-input-0`,
          source: `${graphId}-node-5`,
          target: `${graphId}-node-8`,
        },
        {
          edgeId: `${graphId}-node-6-output-1__${graphId}-node-8-input-1`,
          sourceAnchor: `${graphId}-node-6-output-1`,
          targetAnchor: `${graphId}-node-8-input-1`,
          source: `${graphId}-node-6`,
          target: `${graphId}-node-8`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-9-input-0`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          targetAnchor: `${graphId}-node-9-input-0`,
          source: `${graphId}-node-6`,
          target: `${graphId}-node-9`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-10-input-0`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          targetAnchor: `${graphId}-node-10-input-0`,
          source: `${graphId}-node-6`,
          target: `${graphId}-node-10`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-11-input-0`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          targetAnchor: `${graphId}-node-11-input-0`,
          source: `${graphId}-node-6`,
          target: `${graphId}-node-11`,
        },
        {
          edgeId: `${graphId}-node-6-output-0__${graphId}-node-12-input-1`,
          sourceAnchor: `${graphId}-node-6-output-0`,
          targetAnchor: `${graphId}-node-12-input-1`,
          source: `${graphId}-node-6`,
          target: `${graphId}-node-12`,
        },
        {
          edgeId: `${graphId}-node-11-output-0__${graphId}-node-12-input-0`,
          sourceAnchor: `${graphId}-node-11-output-0`,
          targetAnchor: `${graphId}-node-12-input-0`,
          source: `${graphId}-node-11`,
          target: `${graphId}-node-12`,
        },
        {
          edgeId: `${graphId}-node-11-output-0__${graphId}-node-13-input-0`,
          sourceAnchor: `${graphId}-node-11-output-0`,
          targetAnchor: `${graphId}-node-13-input-0`,
          source: `${graphId}-node-11`,
          target: `${graphId}-node-13`,
        },
        {
          edgeId: `${graphId}-node-8-output-0__${graphId}-node-13-input-1`,
          sourceAnchor: `${graphId}-node-8-output-0`,
          targetAnchor: `${graphId}-node-13-input-1`,
          source: `${graphId}-node-8`,
          target: `${graphId}-node-13`,
        },
        {
          edgeId: `${graphId}-node-13-output-0__${graphId}-node-15-input-0`,
          sourceAnchor: `${graphId}-node-13-output-0`,
          targetAnchor: `${graphId}-node-15-input-0`,
          source: `${graphId}-node-13`,
          target: `${graphId}-node-15`,
        },
        {
          edgeId: `${graphId}-node-13-output-0__${graphId}-node-14-input-0`,
          sourceAnchor: `${graphId}-node-13-output-0`,
          targetAnchor: `${graphId}-node-14-input-0`,
          source: `${graphId}-node-13`,
          target: `${graphId}-node-14`,
        },
      ],
      nodes: [
        {
          outputs: [`${graphId}-node-1-output-0`],
          nodeDef: {
            ...getDataTableDef(dataTableReceiver, dataTableReceiverPartition),
            domain: `read_data`,
            name: `datatable`,
            version: `0.0.1`,
          },
          inputs: [],
          codeName: `read_data/datatable`,
          x: -370,
          y: -250,
          label: `样本表`,
          graphNodeId: `${graphId}-node-1`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-10-output-0`],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_ds/feature_selects'],
                  attrs: [{ ...featureSelects, is_na: false }],
                }
              : {}),
            domain: `stats`,
            name: `ss_vif`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-6-output-0`],
          codeName: `stats/ss_vif`,
          x: -240,
          y: 190,
          label: `VIF指标计算`,
          graphNodeId: `${graphId}-node-10`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-11-output-0`, `${graphId}-node-11-output-1`],
          nodeDef: {
            domain: `ml.train`,
            name: `ss_sgd_train`,
            version: `1.0.0`,
            ...(labelSelects && featureSelects
              ? {
                  attrPaths: ['input/input_ds/label', 'input/input_ds/feature_selects'],
                  attrs: [
                    { ...labelSelects, is_na: false },
                    { ...featureSelects, is_na: false },
                  ],
                }
              : {}),
          },
          inputs: [`${graphId}-node-6-output-0`],
          codeName: `ml.train/ss_sgd_train`,
          x: -40,
          y: 220,
          label: `逻辑回归训练`,
          graphNodeId: `${graphId}-node-11`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-12-output-0`],
          nodeDef: {
            domain: `ml.eval`,
            name: `ss_pvalue`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-11-output-0`, `${graphId}-node-6-output-0`],
          codeName: `ml.eval/ss_pvalue`,
          x: -250,
          y: 310,
          label: `P-VALUE评估`,
          graphNodeId: `${graphId}-node-12`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-13-output-0`],
          nodeDef: {
            ...(receiver && pred
              ? {
                  attrPaths: ['receiver', 'pred_name', 'save_label'],
                  attrs: [
                    { ...receiver, is_na: false },
                    { ...pred, is_na: false },
                    { b: true, is_na: false },
                  ],
                }
              : {}),

            domain: `ml.predict`,
            name: `ss_sgd_predict`,
            version: '1.0.0',
          },
          inputs: [`${graphId}-node-11-output-0`, `${graphId}-node-8-output-0`],
          codeName: `ml.predict/ss_sgd_predict`,
          x: 40,
          y: 330,
          label: `逻辑回归预测`,
          graphNodeId: `${graphId}-node-13`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-14-output-0`],
          nodeDef: {
            domain: `ml.eval`,
            name: `biclassification_eval`,
            version: `1.0.0`,
            ...(labelSelects && pred
              ? {
                  attrPaths: ['input/input_ds/label', 'input/input_ds/prediction'],
                  attrs: [
                    { ...labelSelects, is_na: false },
                    { ...{ ss: [pred.s] }, is_na: false },
                  ],
                }
              : {}),
          },
          inputs: [`${graphId}-node-13-output-0`],
          codeName: `ml.eval/biclassification_eval`,
          x: 130,
          y: 450,
          label: `二分类评估`,
          graphNodeId: `${graphId}-node-14`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-15-output-0`],
          nodeDef: {
            domain: `ml.eval`,
            name: `prediction_bias_eval`,
            version: `1.0.0`,
            ...(labelSelects && pred
              ? {
                  attrPaths: ['input/input_ds/label', 'input/input_ds/prediction'],
                  attrs: [
                    { ...labelSelects, is_na: false },
                    { ...{ ss: [pred.s] }, is_na: false },
                  ],
                }
              : {}),
          },
          inputs: [`${graphId}-node-13-output-0`],
          codeName: `ml.eval/prediction_bias_eval`,
          x: -110,
          y: 540,
          label: `预测偏差评估`,
          graphNodeId: `${graphId}-node-15`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-2-output-0`],
          nodeDef: {
            ...getDataTableDef(dataTableSender, dataTableSenderPartition),
            domain: `read_data`,
            name: `datatable`,
            version: `0.0.1`,
          },
          inputs: [],
          codeName: `read_data/datatable`,
          x: -140,
          y: -250,
          label: `样本表`,
          graphNodeId: `${graphId}-node-2`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-3-output-0`, `${graphId}-node-3-output-1`],
          nodeDef: {
            ...(receiverKey && senderKey
              ? {
                  attrPaths: [
                    'input/input_ds1/keys',
                    'input/input_ds2/keys',
                    'protocol',
                    'sort_result',
                    'receiver_parties',
                    'allow_empty_result',
                    'join_type',
                    'input_ds1_keys_duplicated',
                    'input_ds2_keys_duplicated',
                  ],
                  attrs: [
                    {
                      ...receiverKey,
                      is_na: false,
                    },
                    {
                      ...senderKey,
                      is_na: false,
                    },
                    {
                      s: 'PROTOCOL_RR22',
                      is_na: false,
                    },
                    {
                      b: true,
                      is_na: false,
                    },
                    {
                      ...receiverPSI,
                      is_na: false,
                    },
                    {
                      is_na: true,
                    },
                    {
                      s: 'inner_join',
                      is_na: false,
                    },
                    {
                      b: true,
                      is_na: false,
                    },
                    {
                      b: true,
                      is_na: false,
                    },
                  ],
                  domain: 'data_prep',
                  name: 'psi',
                  version: '1.0.0',
                }
              : {
                  domain: 'data_prep',
                  name: 'psi',
                  version: '1.0.0',
                }),
          },
          inputs: [`${graphId}-node-1-output-0`, `${graphId}-node-2-output-0`],
          codeName: `data_prep/psi`,
          x: -240,
          y: -160,
          label: `隐私求交`,
          graphNodeId: `${graphId}-node-3`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-4-output-0`],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_ds/features'],
                  attrs: [{ ...featureSelects, is_na: false }],
                }
              : {}),
            domain: `stats`,
            name: `table_statistics`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-3-output-0`],
          codeName: `stats/table_statistics`,
          x: -430,
          y: -90,
          label: `全表统计`,
          graphNodeId: `${graphId}-node-4`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-5-output-0`, `${graphId}-node-5-output-1`],
          nodeDef: {
            domain: `data_prep`,
            name: `train_test_split`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-3-output-0`],
          codeName: `data_prep/train_test_split`,
          x: -120,
          y: -80,
          label: `随机分割`,
          graphNodeId: `${graphId}-node-5`,
          status: `STAGING`,
        },
        {
          outputs: [
            `${graphId}-node-6-output-0`,
            `${graphId}-node-6-output-1`,
            `${graphId}-node-6-output-2`,
          ],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_ds/feature_selects', 'input/input_ds/label'],
                  attrs: [
                    { ...featureSelects, is_na: false },
                    { ...labelSelects, is_na: false },
                  ],
                }
              : {}),
            domain: `preprocessing`,
            name: `vert_woe_binning`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-5-output-0`],
          codeName: `preprocessing/vert_woe_binning`,
          x: -140,
          y: 20,
          label: `WOE分箱`,
          graphNodeId: `${graphId}-node-6`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-8-output-0`],
          nodeDef: {
            domain: `preprocessing`,
            name: `substitution`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-5-output-1`, `${graphId}-node-6-output-1`],
          codeName: `preprocessing/substitution`,
          x: -10,
          y: 100,
          label: `特征工程应用`,
          graphNodeId: `${graphId}-node-8`,
          status: `STAGING`,
        },
        {
          outputs: [`${graphId}-node-9-output-0`],
          nodeDef: {
            ...(featureSelects
              ? {
                  attrPaths: ['input/input_ds/feature_selects'],
                  attrs: [{ ...featureSelects, is_na: false }],
                }
              : {}),
            domain: `stats`,
            name: `ss_pearsonr`,
            version: `1.0.0`,
          },
          inputs: [`${graphId}-node-6-output-0`],
          codeName: `stats/ss_pearsonr`,
          x: -450,
          y: 190,
          label: `相关系数矩阵`,
          graphNodeId: `${graphId}-node-9`,
          status: `STAGING`,
        },
      ],
    };
  };
}

const getDataTableDef = (receiver: { s: string }, partition: string) => {
  if (receiver) {
    if (partition) {
      // 分区表
      return {
        attrPaths: ['datatable_selected', 'datatable_partition'],
        attrs: [
          { ...receiver, is_na: false },
          { s: partition, is_na: false },
        ],
      };
    }
    return {
      attrPaths: ['datatable_selected'],
      attrs: [{ ...receiver, is_na: false }],
    };
  }
  return {};
};
