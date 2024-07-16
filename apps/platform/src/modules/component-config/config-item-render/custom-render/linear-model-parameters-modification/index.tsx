import { QuestionCircleOutlined } from '@ant-design/icons';
import type { GraphNode } from '@secretflow/dag';
import { Button, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';

import type { GraphNodeDetail } from '@/modules/component-config/component-config-protocol';
import { getModel, useModel } from '@/util/valtio-helper';

import { ParamsModificationsRenderView } from '../parameters-modification/parameters-modification-view';
import { DefaultRedoUndoService } from '../redo-undo/redo-undo-service';

import { ParametersResultDrawerView } from './drawer';
import { ModelParametersModificationService } from './model-parameters-modification-service';
import type { ParametersData, ParametersDatum } from './types';

/** 2. 把表单格式，serializer 序列化，转换成 node info */
export const modelModificationsSerializer = (data: ParametersData) => {
  const _featureWeights = data?.featureWeights?.map((record: ParametersDatum) => {
    const { featureName, party, featureWeight } = record;

    return {
      featureName,
      party,
      featureWeight,
    };
  });

  return {
    modelHash: data.modelHash,
    featureWeights: _featureWeights,
    bias: data.bias,
  };
};

/** 1. fetch 组件信息的时候，unserializer 反序列化，转换成表单需要的格式 */
export const modelModificationsUnSerializer = (originBinningData?: {
  modelHash: string;
  featureWeights: ParametersDatum[];
  bias: number;
}) => {
  if (!originBinningData) return;

  // b. 转换成 table 所需格式
  const _featureWeights = originBinningData?.featureWeights?.map((record: any) => {
    const { featureWeight, featureName, party } = record;

    return {
      key: `${featureName}-${party}`,
      featureName,
      party,
      featureWeight,
    };
  });

  return {
    modelHash: originBinningData.modelHash,
    featureWeights: _featureWeights,
    bias: originBinningData.bias,
  };
};

interface INode {
  nodeId: string;
  name: string;
  upstreamNodes: GraphNodeDetail[];
  graphNode: GraphNodeDetail;
  inputNodes: GraphNode[];
}

interface IBinModificationsRender {
  nodeAllInfo: INode;
  disabled: boolean;
}

export const LinearModelParametersModificationRender: React.FC<
  IBinModificationsRender
> = (params: IBinModificationsRender) => {
  // 打开分箱结果表
  const { initParametersTable, parametersData } = useModel(
    LinearModelParamsModificationsRenderView,
  );
  const { setVisible } = useModel(ParametersResultDrawerView);

  const redoUndoService = useModel(DefaultRedoUndoService);

  /** init binning data & undo service
   * 分箱的初始化数据入口，不走 config-form-view.tsx form 表单的逻辑
   */
  useEffect(() => {
    // 防止其他 component 的 nodeAllInfo 进入
    if (
      params.nodeAllInfo.graphNode.codeName ===
      'preprocessing/model_param_modifications'
    ) {
      redoUndoService.init();
      initParametersTable(params.nodeAllInfo, params.disabled);
    }
  }, [params.nodeAllInfo.nodeId]);

  return (
    <div>
      {/* 编辑编辑模型参数 */}
      <Space size={4} align="center">
        <Button
          style={{ padding: 0 }}
          type="link"
          disabled={!parametersData}
          onClick={() => {
            redoUndoService.init();
            initParametersTable(params.nodeAllInfo, params.disabled);

            setVisible(true);
          }}
        >
          编辑模型参数
        </Button>
        {!parametersData ? (
          <Tooltip title="无法编辑？请先执行该组件">
            <QuestionCircleOutlined />
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );
};

export class LinearModelParamsModificationsRenderView extends ParamsModificationsRenderView<ParametersData> {
  parametersModificationService = getModel(ModelParametersModificationService);

  getUnSerializer = (data: any) => {
    return modelModificationsUnSerializer(data) as ParametersData;
  };
}
