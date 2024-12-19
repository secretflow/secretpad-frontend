import { Form, Select } from 'antd';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import type { RenderProp } from './config-render-protocol';
import { getComponentByRenderStrategy } from './helper';
import styles from './index.less';

import { hasAccess, Platform } from '@/components/platform-wrapper';
import { getProject } from '@/services/secretpad/ProjectController';

export type UpstreamOutput = {
  id: string;
  outputId: string;
  codeName: string;
};

/**
 * 根据项目的参与方来进行选择
 *  p2p 模式下只选择自己，也就是 get 接口 nodeType === 'primary',
 *  center 模式可以全部选择
 */
export const nodePartiesByUpstreamOutputSelect: React.FC<RenderProp<string>> = (
  config,
) => {
  const {
    form,
    onChange,
    value,
    defaultVal,
    node,
    translation,
    componentConfig,
    attrConfig,
  } = config;

  const isAutonomyMode = hasAccess({ type: [Platform.AUTONOMY] });

  const [nodes, setNodes] = useState<{ label: string; value: string }[]>([]);

  const isNoWrap = !!attrConfig?.style?.noWrap;

  const { prefixes, list_max_length_inclusive } = node;

  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  let isMultiple = true;
  if (list_max_length_inclusive === 1) isMultiple = false;

  useEffect(() => {
    const getNodes = async () => {
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes = [] } = data || {};
      const nodeList = isAutonomyMode
        ? (nodes || []).filter((item) => item.nodeType === 'primary')
        : nodes;
      const nodeOptions = (nodeList || []).map((item) => ({
        label: item.nodeName!,
        value: item.nodeId!,
      }));
      setNodes(nodeOptions);
    };
    getNodes();
  }, [isAutonomyMode, projectId]);

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
