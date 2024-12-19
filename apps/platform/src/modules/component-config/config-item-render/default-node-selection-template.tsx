import { Form, Select } from 'antd';
import { uniqBy } from 'lodash';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { NodeService } from '@/modules/node';
import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import { getProject } from '@/services/secretpad/ProjectController';
import { useModel } from '@/util/valtio-helper';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';
import { getComponentByRenderStrategy } from './helper';

export const DefaultNodeSelect: React.FC<RenderProp<string>> = (config) => {
  const {
    form,
    onChange,
    value,
    defaultVal,
    node,
    translation,
    upstreamTables = [],
    componentConfig,
    attrConfig,
  } = config;

  const [nodes, setNodes] = useState<{ label: string; value: string }[]>([]);
  const nodeService = useModel(NodeService);

  const isNoWrap = !!attrConfig?.style?.noWrap;

  const { prefixes, list_max_length_inclusive } = node;

  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  let isMultiple = true;
  if (list_max_length_inclusive === 1) isMultiple = false;
  useEffect(() => {
    const getNodes = async () => {
      const nodeList = [] as { label: string; value: string }[];

      const { data } = await getProject({ projectId });

      const { nodes: nodeLs } = data || {};
      if (nodeLs) {
        const dataTableList: (API.ProjectDatatableBaseVO & {
          nodeId: string | undefined;
          nodeName: string | undefined;
        })[] = [];
        nodeLs.map((_node) => {
          const { datatables } = _node;
          if (!datatables) return;
          datatables.map((table) =>
            dataTableList.push({
              ...table,
              nodeId: _node?.nodeId,
              nodeName: _node?.nodeName,
            }),
          );
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
                  nodeList.push({
                    value: nodeId as string,
                    label: nodeName as string,
                  });
                  return;
                }
              }
              const participatedNode = dataTableList.find(
                (table) => table.datatableId === upstream,
              );
              if (
                participatedNode &&
                !nodeList.find(({ value }) => value === participatedNode.nodeId)
              )
                nodeList.push({
                  value: participatedNode.nodeId as string,
                  label: participatedNode.nodeName as string,
                });
            }
          }),
        );
        setNodes(uniqBy(nodeList, 'value'));
      } else {
        const fetchedNodes = await nodeService.listNode();
        fetchedNodes.forEach((i) => {
          if (!i.nodeId || !i.nodeName) return;
          nodeList.push({
            value: i.nodeId,
            label: i.nodeName,
          });
        });
        setNodes(uniqBy(nodeList, 'value'));
      }
    };
    getNodes();
  }, []);

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
