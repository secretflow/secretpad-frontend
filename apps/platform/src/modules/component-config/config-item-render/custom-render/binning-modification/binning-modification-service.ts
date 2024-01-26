import { ActionType } from '@secretflow/dag';
import { message } from 'antd';
import { parse } from 'query-string';

import type {
  AtomicConfigNode,
  CustomConfigNode,
  NodeDef,
} from '@/modules/component-config/component-config-protocol';
import { DefaultComponentConfigService } from '@/modules/component-config/component-config-service';
import type {
  Attribute,
  ComputeMode,
} from '@/modules/component-tree/component-protocol';
import mainDag from '@/modules/main-dag/dag';
import {
  getGraphNodeOutput,
  updateGraphNode,
} from '@/services/secretpad/GraphController';
import { Model, getModel } from '@/util/valtio-helper';

import type { NodeAllInfo } from '../../config-render-protocol';

import type { BinningData, Record } from './types';
import { DefaultUndoService } from './undo-service';

import { binModificationsSerializer, binModificationsUnSerializer } from '.';

/** 希望 binning service 有哪些能力 */
export class DefaultBinningModificationService extends Model {
  /** 分箱数据 */
  binningDatas?: BinningData[];

  componentConfigService = getModel(DefaultComponentConfigService);

  undoService = getModel(DefaultUndoService<BinningData>);

  private convertToBinningConfig = (binningData: BinningData, node: NodeAllInfo) => {
    const params: { attrPaths: string[]; attrs: Attribute[] } = {
      attrPaths: [],
      attrs: [],
    };

    const { search } = window.location;
    const { projectId, dagId, mode } = parse(search);

    const isFinished = true;

    const componentConfig = this.componentConfigService.getComponentConfig(
      node,
      mode as ComputeMode,
    );

    // 根据 componentConfig 生成 attrPaths
    componentConfig?.map((_node) => {
      const name =
        _node.prefixes && _node.prefixes.length > 0
          ? _node.prefixes.join('/') + '/' + _node.name
          : _node.name;

      params.attrPaths.push(name);

      const { type } = _node as AtomicConfigNode | CustomConfigNode;

      if (type === 'AT_CUSTOM_PROTOBUF') {
        const formattedVal = binModificationsSerializer(binningData);

        params.attrs.push({
          s: JSON.stringify(formattedVal),
        });
        return;
      }
    });

    return {
      projectId: projectId as string,
      graphId: dagId as string,
      isFinished,
      node: {
        ...node.graphNode,
        codeName: node.name,
        graphNodeId: node.nodeId,
        nodeDef: {
          ...node.graphNode?.nodeDef,
          ...params,
        } as NodeDef,
      },
    };
  };

  /** 更新 binning config
   * 更新组件配置，会变更组件状态为 default
   */
  public saveBinningConfig = async (binningData: BinningData, node: NodeAllInfo) => {
    const config = this.convertToBinningConfig(binningData, node);

    this.componentConfigService.saveComponentConfig(config);
  };

  /** 更新 binning config
   * 与 saveBinningConfig 区别：单纯地更新组件配置，不会变更组件状态为 default
   * 目的：不让用户感知不必要的状态变化，如「合并」操作
   */
  public updateBinningConfig = async (binningData: BinningData, node: NodeAllInfo) => {
    const config = this.convertToBinningConfig(binningData, node);

    const { nodeDef, graphNodeId } = config.node;

    const { status } = await updateGraphNode(config);

    if (status && status.code === 0) {
      mainDag.graphManager.executeAction(ActionType.changeNodeData, graphNodeId, {
        nodeDef,
      });
    } else {
      message.error(status?.msg || '更新失败');
    }
  };

  /** 获取 binning（目前：by output）
   * return [0, 1]
   * 0: 上游输出的结果表信息
   * 1: 最新的结果表信息
   */
  public getBinningDatas = async (nodeId: string, outputId: string) => {
    if (outputId) {
      const { search } = window.location;
      const { projectId, dagId } = parse(search);

      const output = await getGraphNodeOutput({
        graphId: dagId as string,
        graphNodeId: nodeId,
        outputId,
        projectId: projectId as string,
      });

      const data = output.data?.tabs;

      if (!data) return;

      const parseDatas = JSON.parse(data);

      if (parseDatas.length) {
        this.binningDatas = parseDatas.map((data) =>
          binModificationsUnSerializer(JSON.parse(data)),
        );

        return this.binningDatas;
      }
    }
  };

  /** 合并 binning */
  public merge = (binningData: BinningData, node: NodeAllInfo) => {
    this.updateBinningConfig(binningData, node);
    setTimeout(() => {
      this.execBinningCal(node.graphNode?.graphNodeId);
    }, 1000);
  };

  /** 撤销 binning */
  public undo = () => {
    const { undo } = this.undoService;
    const snapshot = undo();

    return snapshot;
  };

  /** redo binning */
  public redo = () => {
    const { redo } = this.undoService;
    const snapshot = redo();

    return snapshot;
  };

  /** 重做 binning */
  public reset = () => {
    const { reset } = this.undoService;
    reset();

    return [];
  };

  /** 引擎执行真正的 计算 */
  private execBinningCal = (nodeId: string) => {
    mainDag.graphManager.executeAction(ActionType.runSingle, [nodeId]);
    // 执行执行过程 有 loading
    // 执行结束之后，成功的话，获取最新的结果，重新 getOutput
    mainDag.graphManager.executeAction(ActionType.queryStatus, []);
  };
}
