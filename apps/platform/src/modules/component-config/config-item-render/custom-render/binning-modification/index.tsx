import { QuestionCircleOutlined } from '@ant-design/icons';
import type { GraphNode } from '@secretflow/dag';
import { Button, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';

import type { GraphNodeDetail } from '@/modules/component-config/component-config-protocol';
import mainDag from '@/modules/main-dag/dag';
import { getModel, useModel } from '@/util/valtio-helper';

import type { NodeAllInfo } from '../../config-render-protocol';
import { ParamsModificationsRenderView } from '../parameters-modification/parameters-modification-view';
import { SourceTypeEnum } from '../parameters-modification/types';

import { DefaultBinningModificationService } from './binning-modification-service';
import { BinningResultDrawerView } from './drawer';
import { getLabel, getBoundValue } from './helper';
import type { BinningData, CurrOperationEnum, SelectedRowMap } from './types';
import { TableTypeEnum, type Record } from './types';
import { DefaultRedoUndoService } from '../redo-undo/redo-undo-service';

/** 2. 把表单格式，serializer 序列化，转换成 node info */
export const binModificationsSerializer = (parametersData: BinningData) => {
  const variableBins = parametersData?.variableBins?.map((record: Record) => {
    const { feature, isWoe, binCount, type, iv, bins, partyName } = record;

    /** woe 分箱 和 普通分箱 参数有区别 */
    const _recordParams = isWoe ? { iv } : {};

    const _elseBin = bins.find((bin) => bin.label === 'ELSE');
    const _validBins = bins.filter((bin) => bin.label !== 'ELSE');

    return {
      ..._recordParams,
      isWoe,
      featureName: feature,
      featureType: type === 'float' ? 'numeric' : type,
      validBinCount: binCount,
      partyName,
      elseBin: {
        fillingValue: isWoe ? _elseBin?.woe : _elseBin?.order,
        totalCount: _elseBin?.totalCount,
        leftBound: 0,
        rightBound: 0,
        markForMerge: false,
      },
      validBins: _validBins?.map((bin) => {
        const { markForMerge, label, woe, order, totalCount } = bin;
        return {
          markForMerge,
          leftBound: getBoundValue(label)[0],
          rightBound: getBoundValue(label)[1],
          fillingValue: isWoe ? woe : order, // woe 或 序号
          totalCount,
        };
      }),
    };
  });

  return {
    modelHash: parametersData.modelHash,
    variableBins,
  };
};

/** 1. fetch 组件信息的时候，unserializer 反序列化，转换成表单需要的格式 */
export const binModificationsUnSerializer = (originBinningData?: {
  modelHash: string;
  variableBins: any[];
}) => {
  if (!originBinningData) return;

  // b. 转换成 table 所需格式
  const variableBins = originBinningData?.variableBins?.map((record: any) => {
    const {
      featureName,
      validBinCount,
      iv,
      featureType,
      validBins,
      isWoe,
      elseBin,
      partyName,
    } = record;

    /** woe 分箱 和 普通分箱 参数有区别 */
    const _recordParams = isWoe ? { iv } : {};
    const bins = elseBin ? [...validBins, elseBin] : [...validBins];
    return {
      ..._recordParams,
      key: featureName,
      feature: featureName,
      binCount: validBinCount,
      type: featureType === 'numeric' ? 'float' : featureType,
      isWoe,
      partyName,
      bins: bins?.map((bin: any, index) => {
        const {
          markForMerge,
          leftBound,
          rightBound,
          fillingValue, // woe 或 序号
          totalCount,
        } = bin;

        /** woe 分箱 和 普通分箱 参数有区别 */
        const _binParams = isWoe ? { woe: fillingValue } : { order: fillingValue };
        const _label = getLabel(leftBound, rightBound);

        return {
          ..._binParams,
          key: `${index}/${featureName}/${_label}`,
          label: _label,
          markForMerge,
          totalCount,
        };
      }),
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

export const BinModificationsRender: React.FC<IBinModificationsRender> = (
  params: IBinModificationsRender,
) => {
  // 打开分箱结果表
  const { initParametersTable, parametersData } = useModel(BinModificationsRenderView);
  const { setVisible } = useModel(BinningResultDrawerView);

  const undoService = useModel(DefaultRedoUndoService);

  /** init binning data & undo service
   * 分箱的初始化数据入口，不走 config-form-view.tsx form 表单的逻辑
   */
  useEffect(() => {
    // 防止其他 component 的 nodeAllInfo 进入
    if (params.nodeAllInfo.graphNode.codeName === 'feature/binning_modifications') {
      undoService.init();
      initParametersTable(params.nodeAllInfo, params.disabled);
    }
  }, [params.nodeAllInfo.nodeId]);

  return (
    <div>
      {/* 编辑分箱 */}
      <Space size={4} align="center">
        <Button
          style={{ padding: 0 }}
          type="link"
          disabled={!parametersData}
          onClick={() => {
            undoService.init();
            initParametersTable(params.nodeAllInfo, params.disabled);

            setVisible(true);
          }}
        >
          编辑分箱
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

export class BinModificationsRenderView extends ParamsModificationsRenderView<BinningData> {
  /** woe 分箱结果表 or 常规分箱表 */
  type: TableTypeEnum = TableTypeEnum.WoeBinning;
  /** 默认 woe 的值 */
  defaultWoeValue = 0;
  /** 选择需要合并的 桶 */
  selectedRowKeys: React.Key[] = [];
  /** 选择需要合并的 所有桶 */
  selectedRowMap: SelectedRowMap = {};
  /** 当前的操作 */
  currOperation?: CurrOperationEnum;

  parametersModificationService = getModel(DefaultBinningModificationService);

  getUnSerializer = (data: any) => {
    return binModificationsUnSerializer(data) as BinningData;
  };

  setCurrOperation = (currOperation?: CurrOperationEnum) => {
    this.currOperation = currOperation;
  };

  setSelectedRowKeys = (selectedRowKeys: React.Key[]) => {
    this.selectedRowKeys = selectedRowKeys;
  };

  setSelectedRowMap = (obj: SelectedRowMap) => {
    this.selectedRowMap = obj;
  };

  setDefaultWoeValue = (value: number) => {
    this.defaultWoeValue = value;
  };

  resetParametersTable = () => {
    this.defaultWoeValue = 0;
  };

  initParametersTable = async (node: NodeAllInfo, disabled: boolean) => {
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

    this.selectedRowKeys = [];

    this.sourceType = SourceTypeEnum.Upstream;
    this.disabled = disabled;

    this.loading = false;

    /** 上游输出 */
    if (!this.node?.graphNode?.nodeDef?.attrs) {
      this.sourceType = SourceTypeEnum.Upstream;

      const nodeId = this.node?.graphNode?.graphNodeId;
      const outputId = this.node?.graphNode?.outputs?.[1];

      const tabs = await this.parametersModificationService.getParametersDatas(
        nodeId,
        outputId,
      );

      if (tabs) {
        const upstreamData = tabs?.[0];

        this.upstreamData = upstreamData;
        this.parametersData = upstreamData;
        this.initData = upstreamData;
      }
    } else {
      /** 最新结果表 */
      this.sourceType = SourceTypeEnum.Latest;

      const nodeDefVal = this.node?.graphNode?.nodeDef?.attrs[0]?.s;

      if (nodeDefVal) {
        // tabs[1]
        const data = JSON.parse(nodeDefVal);
        const parametersData = this.getUnSerializer(data);

        this.latestData = parametersData;
        this.parametersData = parametersData;
        this.initData = parametersData;
      }
    }

    /** 是否是 woe 分箱 */
    this.type = this.parametersData?.variableBins?.[0]?.isWoe
      ? TableTypeEnum.WoeBinning
      : TableTypeEnum.Binning;
  };

  merge = (parametersData: BinningData) => {
    this.parametersModificationService.merge(parametersData, this.node as NodeAllInfo);
  };
}
