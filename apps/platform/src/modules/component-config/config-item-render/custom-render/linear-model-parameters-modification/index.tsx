import { QuestionCircleOutlined } from '@ant-design/icons';
import type { GraphNode } from '@secretflow/dag';
import { Button, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';

import type { GraphNodeDetail } from '@/modules/component-config/component-config-protocol';
import mainDag from '@/modules/main-dag/dag';
import { Model, getModel, useModel } from '@/util/valtio-helper';

import type { NodeAllInfo } from '../../config-render-protocol';

import { BinningResultDrawerView } from './drawer';
import { DefaultParametersModificationService } from './parameters-modification-service';
import { SourceTypeEnum } from './types';
import type { CurrOperationEnum, ParametersData, ParametersDatum } from './types';
import { DefaultUndoService } from './undo-service';

/** 2. 把表单格式，serializer 序列化，转换成 node info */
export const binModificationsSerializer = (data: ParametersData) => {
  const variableBins = data?.variableParametersData?.map((record: ParametersDatum) => {
    const { feature, node, weight } = record;

    return {
      feature,
      node,
      weight,
    };
  });

  return {
    modelHash: data.modelHash,
    variableBins,
  };
};

/** 1. fetch 组件信息的时候，unserializer 反序列化，转换成表单需要的格式 */
export const binModificationsUnSerializer = (originBinningData?: {
  modelHash: string;
  variableBins: ParametersDatum[];
}) => {
  if (!originBinningData) return;

  // b. 转换成 table 所需格式
  const variableBins = originBinningData?.variableBins?.map((record: any) => {
    const { feature, weight, node } = record;

    return {
      key: `${feature}-${node}`,
      feature,
      node,
      weight,
    };
  });

  return {
    modelHash: originBinningData.modelHash,
    variableBins,
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
  const { initBinningTable, parametersData } = useModel(BinModificationsRenderView);
  const { setVisible } = useModel(BinningResultDrawerView);

  const undoService = useModel(DefaultUndoService);

  /** init binning data & undo service
   * 分箱的初始化数据入口，不走 config-form-view.tsx form 表单的逻辑
   */
  useEffect(() => {
    // 防止其他 component 的 nodeAllInfo 进入
    if (params.nodeAllInfo.graphNode.codeName === 'feature/binning_modifications') {
      undoService.init();
      initBinningTable(params.nodeAllInfo, params.disabled);
    }
  }, [params.nodeAllInfo.nodeId]);

  return (
    <div>
      {/* 编辑分箱 */}
      <Space size={4} align="center">
        <Button
          style={{ padding: 0 }}
          type="link"
          // disabled={!binningData}
          onClick={() => {
            undoService.init();
            initBinningTable(params.nodeAllInfo, params.disabled);

            setVisible(true);
          }}
        >
          编辑模型参数
        </Button>
        {!parametersData ? (
          <Tooltip title="无法编辑？请先执行分箱修改">
            <QuestionCircleOutlined />
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );
};

/** 含有 binning 交互逻辑的 实体 */
export class BinModificationsRenderView extends Model {
  /** 线性模型参数 数据信息 */
  parametersData?: ParametersData;
  /** 初始数据 */
  initData?: ParametersData;

  /** 分箱结果表来源 */
  sourceType: SourceTypeEnum = SourceTypeEnum.Upstream;
  /** 默认 bias 的值 */
  defaultBiasValue = 0;
  /** 上游数据 */
  upstreamData?: ParametersData;
  /** 最新数据 */
  latestData?: ParametersData;

  /** 当前的操作 */
  currOperation?: CurrOperationEnum;

  /** loading */
  loading = false;

  /** 算子的节点信息 */
  node?: NodeAllInfo;

  /** 是否需要禁用：从配置面板透传 */
  disabled = false;

  undoService = getModel(DefaultUndoService);

  parametersModificationService = getModel(DefaultParametersModificationService);

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  setCurrOperation = (currOperation?: CurrOperationEnum) => {
    this.currOperation = currOperation;
  };

  setDefaultBiasValue = (value: number) => {
    this.defaultBiasValue = value;
  };

  setSourceType = (sourceType: SourceTypeEnum) => {
    this.sourceType = sourceType;
  };

  getLatestBinningData = async () => {
    this.parametersData = this.latestData;
  };

  setBinningData = (data: ParametersData) => {
    this.parametersData = data;
  };

  resetBinningTable = () => {
    this.defaultBiasValue = 0;
  };

  getUpstreamBinningData = async () => {
    if (!this.upstreamData) {
      // 先获取上游的
      const nodeId = this.node?.graphNode.graphNodeId as string;
      const outputId = this.node?.graphNode?.outputs?.[1] as string;

      const tabs = await this.parametersModificationService.getBinningDatas(
        nodeId,
        outputId,
      );

      this.upstreamData = tabs?.[0];
      this.parametersData = this.upstreamData;
    } else {
      this.parametersData = this.upstreamData;
    }
  };

  initBinningTable = async (node: NodeAllInfo, disabled: boolean) => {
    const graphNode = await mainDag.requestService.getGraphNode(node.nodeId);

    /** node 信息 */
    this.node = {
      ...node,
      graphNode: graphNode as GraphNodeDetail,
    };

    this.parametersData = undefined;
    this.currOperation = undefined;

    this.latestData = undefined;
    this.upstreamData = undefined;

    this.sourceType = SourceTypeEnum.Upstream;
    this.disabled = disabled;

    this.loading = false;

    /** 上游输出 */
    if (!this.node?.graphNode?.nodeDef?.attrs) {
      this.sourceType = SourceTypeEnum.Upstream;

      const nodeId = this.node?.graphNode?.graphNodeId;
      const outputId = this.node?.graphNode?.outputs?.[1];

      const tabs = await this.parametersModificationService.getBinningDatas(
        nodeId,
        outputId,
      );

      if (tabs) {
        const upstreamBinningData = tabs?.[0];

        this.upstreamData = upstreamBinningData;
        this.parametersData = upstreamBinningData;
        this.initData = upstreamBinningData;
      }
    } else {
      /** 最新结果表 */
      this.sourceType = SourceTypeEnum.Latest;

      const nodeDefVal = this.node?.graphNode?.nodeDef?.attrs[0]?.s;

      if (nodeDefVal) {
        // tabs[1]
        const data = JSON.parse(nodeDefVal);
        const binningData = binModificationsUnSerializer(data);

        this.latestData = binningData;
        this.parametersData = binningData;
        this.initData = binningData;
      }
    }
  };

  refreshData = async () => {
    const nodeId = this.node?.graphNode.graphNodeId as string;
    const outputId = this.node?.graphNode?.outputs?.[1] as string;

    const tabs = await this.parametersModificationService.getBinningDatas(
      nodeId,
      outputId,
    );

    if (tabs) {
      const binningData = tabs?.[1];

      this.parametersModificationService.updateBinningConfig(
        binningData,
        this.node as NodeAllInfo,
      );

      this.parametersData = binningData;

      return binningData;
    } else {
      return;
    }
  };

  saveComponentConfig = (parametersData: ParametersData) => {
    this.parametersModificationService.saveBinningConfig(
      parametersData,
      this.node as NodeAllInfo,
    );
  };

  undo = () => {
    const snapshot = this.parametersModificationService.undo();
    if (snapshot?.length <= 0) {
      this.parametersData = this.initData;
      return;
    }
    this.parametersData = snapshot;
  };

  redo = () => {
    const snapshot = this.parametersModificationService.redo();
    this.parametersData = snapshot;
  };

  reset = () => {
    this.parametersModificationService.reset();
    this.parametersData = this.initData;
  };
}
