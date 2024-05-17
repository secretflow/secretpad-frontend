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
import { getGraphNodeOutput } from '@/services/secretpad/GraphController';

import type { NodeAllInfo } from '../../config-render-protocol';
import { ParametersModificationService } from '../parameters-modification/parameters-modification-service';

import type { ParametersData } from './types';

import { modelModificationsSerializer, modelModificationsUnSerializer } from '.';

export class ModelParametersModificationService extends ParametersModificationService<ParametersData> {
  convertToConfig = (binningData: ParametersData, node: NodeAllInfo) => {
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
        const formattedVal = modelModificationsSerializer(binningData);

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
          modelModificationsUnSerializer(JSON.parse(data)),
        );

        return this.parametersDatas;
      }
    }
  };
}
