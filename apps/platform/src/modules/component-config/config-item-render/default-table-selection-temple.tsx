import { Form, Select, Tag, Typography } from 'antd';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';

import { getProject } from '@/services/secretpad/ProjectController';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';

const { Option } = Select;

export const DefaultTableSelect: React.FC<RenderProp<string>> = (config) => {
  const { onChange, value, defaultVal, node, translation } = config;
  const [tables, setTables] = useState<
    { datatableId: string; nodeName: string; datatableName: string }[]
  >([]);
  useEffect(() => {
    const getTables = async () => {
      const dataTableList: {
        datatableId: string;
        nodeName: string;
        datatableName: string;
      }[] = [];
      const { search } = window.location;
      const { projectId } = parse(search) as { projectId: string };
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes } = data;
      if (!nodes) return;
      nodes.map((nodeInst) => {
        const { datatables } = nodeInst;
        if (!datatables) return;
        datatables.map((table) => {
          if (table.datatableId && table.datatableName)
            dataTableList.push({
              datatableId: table.datatableId,
              nodeName: nodeInst.nodeName as string,
              datatableName: table.datatableName,
            });
        });
      });

      setTables(dataTableList);
    };

    getTables();
  }, []);

  return (
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
      ]}
      initialValue={defaultVal}
      colon={false}
    >
      <Select
        value={value}
        optionLabelProp="label"
        onChange={(val) => {
          onChange(val);
        }}
        showSearch
        filterOption={(input: string, option?: { label: string; value: string }) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      >
        {tables.map((table) => (
          <Option
            key={table.datatableId}
            value={table.datatableId}
            label={table.datatableName}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text ellipsis>{table.datatableName}</Typography.Text>
              <Tag>{table.nodeName}</Tag>
            </div>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};
