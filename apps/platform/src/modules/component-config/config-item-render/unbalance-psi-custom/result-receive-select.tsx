import type { GraphNode } from '@secretflow/dag';
import { Form, Select } from 'antd';
import { uniqBy } from 'lodash';
import { parse } from 'query-string';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';

import styles from '../../index.less';
import type { RenderProp } from '../config-render-protocol';
import { getComponentByRenderStrategy } from '../helper';

export type UpstreamOutput = {
  id: string;
  outputId: string;
  codeName: string;
};

/**
 * 拿到与当前算子相连接的上游所有的样本表
 * 根据样本表的输出，拿到参与方
 * 根据最上游的样本表获取参与方进行选择
 */
export const UnbalancePsiCustomSelect: React.FC<RenderProp<string>> = (config) => {
  const {
    form,
    onChange,
    value,
    defaultVal,
    node,
    translation,
    componentConfig,
    attrConfig,
    nodeAllInfo,
  } = config;
  const { upstreamSampleNodes } = nodeAllInfo;

  const [nodes, setNodes] = useState<{ label: string; value: string }[]>([]);

  const isNoWrap = !!attrConfig?.style?.noWrap;

  const { prefixes, list_max_length_inclusive } = node;

  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  let isMultiple = true;
  if (list_max_length_inclusive === 1) isMultiple = false;

  const getUpstreamNodesOutputs = (upstreamNodes: GraphNode[]) => {
    if (upstreamNodes.length === 0) return [];
    const upstreamOutputList: UpstreamOutput[] = [];
    upstreamNodes?.forEach((n) => {
      const { id, outputs = [], codeName } = n || {};
      outputs.forEach((outputId: any) => {
        upstreamOutputList.push({
          id,
          outputId,
          codeName,
        });
      });
    });
    return upstreamOutputList;
  };

  /** 获取上游的样本表的输出ID */
  const upstreamOutputs = useMemo(() => {
    return getUpstreamNodesOutputs(upstreamSampleNodes);
  }, [upstreamSampleNodes]);

  // 直接利用输出ID找出他们的参与方
  useEffect(() => {
    /** 直接获取最上游的样本表 */
    const getNodes = async (outputs: UpstreamOutput[]) => {
      const nodeList = [] as { label: string; value: string }[];
      await Promise.all(
        outputs.map(async (output) => {
          const { data } = await getGraphNodeOutput({
            projectId: projectId as string,
            graphId: dagId,
            graphNodeId: output.id,
            outputId: output.outputId,
          });
          if (!data) return;
          const { meta, type } = data;
          if (type === 'table') {
            if (meta?.rows?.length) {
              meta.rows.forEach((row) => {
                nodeList.push({
                  value: row.nodeId,
                  label: row.nodeName,
                });
              });
            }
          }
        }),
      );
      setNodes(uniqBy(nodeList, 'value'));
    };

    getNodes(upstreamOutputs);
  }, [upstreamOutputs]);

  const item = (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
      messageVariables={{ label: translation[node.name] || node.name }}
      tooltip={translation[node.docString] || node.docString}
      rules={[
        {
          required: node.isRequired,
        },
        {
          validator: (_, val) => {
            if (node.isRequired) {
              if (Array.isArray(val) && val.length > 0) {
                const filtered = val.filter((i) => i);
                if (filtered.length === 0)
                  return Promise.reject(
                    `${translation[node.name] || node.name}是必填字段`,
                  );
              }
            }

            return Promise.resolve();
          },
        },
      ]}
      initialValue={defaultVal}
      colon={false}
      labelCol={isNoWrap ? { span: 12 } : undefined}
      getValueProps={(val) => {
        if (val?.length === 1 && !val[0]) {
          return { value: undefined };
        }
        return { value: val };
      }}
    >
      <Select
        mode={isMultiple ? 'multiple' : undefined}
        value={value}
        options={nodes}
        onChange={(val) => {
          onChange(val);
        }}
      />
    </Form.Item>
  );

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type,
    name: node.name,
  });
};
