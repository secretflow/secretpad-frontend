import templateImg from '@/assets/template-psi.jpg';
import { Model } from '@/util/valtio-helper';

import type { PipelineTemplateContribution } from '../pipeline-protocol';
import { PipelineTemplateType } from '../pipeline-protocol';

export class TemplatePSI extends Model implements PipelineTemplateContribution {
  type: PipelineTemplateType = PipelineTemplateType.PSI;
  name = `联合圈人`;
  argsFilled = false;
  description = '隐私求交的训练流模板';
  computeMode = ['MPC'];

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
      receiverPSI,
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
          x: -390,
          y: -210,
          label: `样本表`,
          graphNodeId: `${graphId}-node-1`,
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
          x: -150,
          y: -210,
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
          x: -260,
          y: -100,
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
          x: -260,
          y: 20,
          label: `全表统计`,
          graphNodeId: `${graphId}-node-4`,
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
