import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { Form, Select } from 'antd';

import type { RenderProp } from './config-render-protocol';

import { modelPackPage } from '@/services/secretpad/ModelManagementController';
import styles from '../index.less';

export const DefaultModelSelect: React.FC<RenderProp<string>> = (config) => {
  const { onChange, value, defaultVal, node, translation } = config;

  const [modelList, setModelList] = useState<
    {
      modelName: string;
      modelId: string;
    }[]
  >([]);

  useEffect(() => {
    const getModelList = async () => {
      const { search } = window.location;
      const { projectId } = parse(search) as { projectId: string };

      const { data, status } = await modelPackPage({
        projectId: projectId,
        page: 1,
        size: 1000,
      });
      if (status && status.code === 0 && data) {
        const modelList = (data?.modelPacks || []).map((item) => ({
          modelName: item.modelName!,
          modelId: item.modelId!,
        }));
        setModelList(modelList);
      } else {
        setModelList([]);
      }
    };
    getModelList();
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
          options={modelList.map((item) => ({
            label: item.modelName,
            value: item.modelId,
          }))}
        ></Select>
      </Form.Item>
    </Form.Item>
  );
};
