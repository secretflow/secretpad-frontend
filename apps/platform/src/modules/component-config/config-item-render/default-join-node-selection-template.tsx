import { Form, Select } from 'antd';
import { uniqBy } from 'lodash';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import { getProject } from '@/services/secretpad/ProjectController';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';

// 非平衡 PSI ，用于选择和他合作项目的节点，且不能选择自己
export const DefaultJoinNodeSelect: React.FC<RenderProp<string>> = (config) => {
  const {
    onChange,
    value,
    defaultVal,
    node,
    translation,
    upstreamTables = [],
  } = config;
  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  const [nodes, setNodes] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const getNodes = async () => {
      const nodeList = [] as { label: string; value: string }[];

      const { data } = await getProject({ projectId });

      const { nodes: nodeLs } = data || {};
      if (nodeLs) {
        nodeLs.map((_node) => {
          nodeList.push({
            value: _node.nodeId!,
            label: _node.nodeName!,
          });
        });
        await Promise.all(
          upstreamTables.map(async (upstream) => {
            if (upstream) {
              // 优先从上游输出查找
              const [, graphNodeId] = upstream.match(/(.*)-output-([0-9]+)$/) || [];
              if (graphNodeId) {
                const { data: outputData } = await getGraphNodeOutput({
                  projectId,
                  graphId: dagId,
                  graphNodeId,
                  outputId: upstream,
                });
                if (outputData?.meta?.rows?.[0]) {
                  const { nodeId, nodeName } = outputData.meta.rows[0];
                  const indexToDelete = nodeList.findIndex(
                    (item) => item.value === nodeId && item.label === nodeName,
                  );
                  if (indexToDelete !== -1) {
                    nodeList.splice(indexToDelete, 1); // 删除找到的元素
                  }
                  return;
                }
              }
            }
          }),
        );
        setNodes(uniqBy(nodeList, 'value'));
      } else {
        setNodes([]);
      }
    };
    getNodes();
  }, []);

  return (
    <Form.Item noStyle>
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
        tooltip={
          node.docString ? translation[node.docString] || node.docString : undefined
        }
        rules={[
          {
            required: node.isRequired,
          },
        ]}
        initialValue={defaultVal}
        colon={false}
      >
        <Select
          value={value}
          onChange={(val) => {
            onChange(val);
          }}
          showSearch
          filterOption={(input: string, option?: { label: string; value: string }) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={nodes}
        ></Select>
      </Form.Item>
    </Form.Item>
  );
};
