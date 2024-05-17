import { ActionType } from '@secretflow/dag';
import { message } from 'antd';

import type { ComponentConfig } from '@/modules/component-config/component-config-protocol';
import { DefaultComponentConfigService } from '@/modules/component-config/component-config-service';
import mainDag from '@/modules/main-dag/dag';
import { updateGraphNode } from '@/services/secretpad/GraphController';
import { Model, getModel } from '@/util/valtio-helper';

import type { NodeAllInfo } from '../../config-render-protocol';
import { DefaultRedoUndoService } from '../redo-undo/redo-undo-service';

/**
 * 抽象类 ParametersModificationService
 * 注意如下方法需要复写：
 * - convertToConfig()
 * - getParametersDatas()
 */
export abstract class ParametersModificationService<T> extends Model {
  parametersDatas?: T[];

  componentConfigService = getModel(DefaultComponentConfigService);

  redoUndoService = getModel(DefaultRedoUndoService<T>);

  // TODO: 必须覆写
  abstract convertToConfig: (parametersData: T, node: NodeAllInfo) => ComponentConfig;

  /** 更新 config
   * 更新组件配置，会变更组件状态为 default
   */
  public saveConfig = async (parametersData: T, node: NodeAllInfo) => {
    const config = this.convertToConfig(parametersData, node);

    this.componentConfigService.saveComponentConfig(config);
  };

  /** 更新 config
   * 与 saveParametersConfig 区别：单纯地更新组件配置，不会变更组件状态为 default
   * 目的：不让用户感知不必要的状态变化，如「合并」操作
   */
  public updateConfig = async (parametersData: T, node: NodeAllInfo) => {
    const config = this.convertToConfig(parametersData, node);

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

  /** 获取 Parameters Datas（目前：by output）
   * return [0, 1]
   * 0: 上游输出的结果表信息
   * 1: 最新的结果表信息
   */
  // TODO: 必须覆写
  public abstract getParametersDatas: (
    nodeId: string,
    outputId: string,
  ) => Promise<T[] | undefined>;

  /** 撤销 */
  public undo = () => {
    const { undo } = this.redoUndoService;
    const snapshot = undo();

    return snapshot;
  };

  /** redo  */
  public redo = () => {
    const { redo } = this.redoUndoService;
    const snapshot = redo();

    return snapshot;
  };

  /** 重做 */
  public reset = () => {
    const { reset } = this.redoUndoService;
    reset();

    return [];
  };

  public record = (data: T) => {
    const { record } = this.redoUndoService;
    return record(data);
  };
}
