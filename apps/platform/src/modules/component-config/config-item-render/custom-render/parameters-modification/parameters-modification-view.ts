import type { GraphNodeDetail } from '@/modules/component-config/component-config-protocol';
import mainDag from '@/modules/main-dag/dag';
import { Model, getModel } from '@/util/valtio-helper';

import type { NodeAllInfo } from '../../config-render-protocol';
import { DefaultRedoUndoService } from '../redo-undo/redo-undo-service';

import type { ParametersModificationService } from './parameters-modification-service';
import { SourceTypeEnum } from './types';

export abstract class ParamsModificationsRenderView<T> extends Model {
  /** 线性模型参数 数据信息 */
  parametersData?: T;

  /** 初始数据 */
  initData?: T;

  /** 表来源 */
  sourceType: SourceTypeEnum = SourceTypeEnum.Upstream;

  /** 上游数据 */
  upstreamData?: T;
  /** 最新数据 */
  latestData?: T;

  /** loading */
  loading = false;

  /** 算子的节点信息 */
  node?: NodeAllInfo;

  /** 是否需要禁用：从配置面板透传 */
  disabled = false;

  redoUndoService = getModel(DefaultRedoUndoService);

  abstract parametersModificationService: ParametersModificationService<T>;

  //TODO: 需覆写
  abstract getUnSerializer: (data: any) => T;

  setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  setSourceType = (sourceType: SourceTypeEnum) => {
    this.sourceType = sourceType;
  };

  getLatestData = async () => {
    this.parametersData = this.latestData;
  };

  setParametersData = (data: T) => {
    this.parametersData = data;
  };

  getUpstreamData = async () => {
    if (!this.upstreamData) {
      // 先获取上游的
      const nodeId = this.node?.graphNode.graphNodeId as string;
      const outputId = this.node?.graphNode?.outputs?.[1] as string;

      const tabs = await this.parametersModificationService.getParametersDatas(
        nodeId,
        outputId,
      );

      this.upstreamData = tabs?.[0];
      this.parametersData = this.upstreamData;
    } else {
      this.parametersData = this.upstreamData;
    }
  };

  initParametersTable = async (node: NodeAllInfo, disabled: boolean) => {
    const graphNode = await mainDag.requestService.getGraphNode(node.nodeId);

    /** node 信息 */
    this.node = {
      ...node,
      graphNode: graphNode as GraphNodeDetail,
    };

    this.parametersData = undefined;

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
  };

  refreshData = async () => {
    const nodeId = this.node?.graphNode.graphNodeId as string;
    const outputId = this.node?.graphNode?.outputs?.[1] as string;

    const tabs = await this.parametersModificationService.getParametersDatas(
      nodeId,
      outputId,
    );

    if (tabs) {
      const parametersData = tabs?.[1];

      this.parametersModificationService.updateConfig(
        parametersData,
        this.node as NodeAllInfo,
      );

      this.parametersData = parametersData;

      return parametersData;
    } else {
      return;
    }
  };

  saveComponentConfig = (parametersData: T) => {
    this.parametersModificationService.saveConfig(
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

  record = (data: T) => {
    return this.parametersModificationService.record(data);
  };
}
