import { ActionType } from '@secretflow/dag';
import { parse } from 'query-string';

import type {
  AtomicConfigNode,
  CustomConfigNode,
  NodeDef,
} from '@/modules/component-config/component-config-protocol';
import type {
  Attribute,
  ComputeMode,
} from '@/modules/component-tree/component-protocol';
import mainDag from '@/modules/main-dag/dag';
import { getGraphNodeOutput } from '@/services/secretpad/GraphController';

import type { NodeAllInfo } from '../../config-render-protocol';
import { ParametersModificationService } from '../parameters-modification/parameters-modification-service';

import type { BinningData } from './types';

import { binModificationsSerializer, binModificationsUnSerializer } from '.';

/** 希望 binning service 有哪些能力 */
export class DefaultBinningModificationService extends ParametersModificationService<BinningData> {
  convertToConfig = (parametersData: BinningData, node: NodeAllInfo) => {
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
        const formattedVal = binModificationsSerializer(parametersData);

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

  /** 获取 binning（目前：by output）
   * return [0, 1]
   * 0: 上游输出的结果表信息
   * 1: 最新的结果表信息
   */
  getParametersDatas = async (nodeId: string, outputId: string) => {
    if (outputId) {
      const { search } = window.location;
      const { projectId, dagId } = parse(search);

      const output = await getGraphNodeOutput({
        graphId: dagId as string,
        graphNodeId: nodeId,
        outputId,
        projectId: projectId as string,
      });

      const dataListString = output.data?.tabs;

      if (!dataListString) return;

      const parseDataList = JSON.parse(dataListString);

      if (parseDataList.length) {
        this.parametersDatas = parseDataList.map((data) =>
          binModificationsUnSerializer(JSON.parse(data)),
        );

        return this.parametersDatas;
      }
    }
  };

  /** 合并 binning */
  public merge = (parametersData: BinningData, node: NodeAllInfo) => {
    this.updateConfig(parametersData, node);
    setTimeout(() => {
      this.execBinningCal(node.graphNode?.graphNodeId);
    }, 1000);
  };

  /** 引擎执行真正的 计算 */
  private execBinningCal = (nodeId: string) => {
    mainDag.graphManager.executeAction(ActionType.runSingle, [nodeId]);
    // 执行执行过程 有 loading
    // 执行结束之后，成功的话，获取最新的结果，重新 getOutput
    mainDag.graphManager.executeAction(ActionType.queryStatus, []);
  };
}
