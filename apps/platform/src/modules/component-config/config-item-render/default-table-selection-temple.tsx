import { Form, Input, Select, Tag, Typography } from 'antd';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';

import { getProject } from '@/services/secretpad/ProjectController';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';

const { Option } = Select;

export const DefaultTableSelect: React.FC<RenderProp<string>> = (config) => {
  const { onChange, value, defaultVal, node, translation, form } = config;
  const [tables, setTables] = useState<
    {
      datatableId: string;
      nodeName: string;
      datatableName: string;
      isPartitionTable: boolean;
    }[]
  >([]);

  const [projectMode, setProjectMode] = useState<string | undefined>();
  useEffect(() => {
    const getTables = async () => {
      const dataTableList: {
        datatableId: string;
        nodeName: string;
        datatableName: string;
        isPartitionTable: boolean; // 是否是ODPS分区表
      }[] = [];
      const { search } = window.location;
      const { projectId } = parse(search) as { projectId: string };
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes, computeMode } = data;
      setProjectMode(computeMode);
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
              isPartitionTable:
                table.partition?.type === 'odps' && table.partition?.fields,
            });
        });
      });

      setTables(dataTableList);
    };

    getTables();
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
          optionLabelProp="title"
        >
          {tables.map((table) => (
            <Option
              key={table.datatableId}
              value={table.datatableId}
              label={table.datatableName}
              title={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 30,
                  }}
                >
                  <Typography.Text ellipsis>{table.datatableName}</Typography.Text>
                  <div>{table.isPartitionTable && <Tag color="green">分区表</Tag>}</div>
                </div>
              }
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text ellipsis>{table.datatableName}</Typography.Text>
                <div>
                  {table.isPartitionTable && <Tag color="green">分区表</Tag>}
                  <Tag>{table.nodeName}</Tag>
                </div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        dependencies={[
          node.prefixes && node.prefixes.length > 0
            ? node.prefixes.join('/') + '/' + node.name
            : node.name,
        ]}
      >
        {({ getFieldValue }) => {
          const selectId = getFieldValue(
            node.prefixes && node.prefixes.length > 0
              ? node.prefixes.join('/') + '/' + node.name
              : node.name,
          );
          const selected = tables.find(
            (t) => t.datatableId === selectId,
          )?.isPartitionTable;
          if (selected && projectMode === 'MPC') {
            return (
              <Form.Item
                tooltip={
                  <>
                    <div>{`1. 填写dt=maxpt，则获取最新分区；dt为分区字段`}</div>
                    <div>
                      {'2. 如自定义规则获取分区表，可填写如：dt=${yyyymmdd+/- 3}'}
                    </div>
                    <div>
                      {'3. 如选择多表自动union，则填写如dt=20240607 or dt=20240608'}
                    </div>
                    <div>
                      {
                        '4. 支持and or 作为多个分区列条件聚合，支持 =  !=  < > >= <= 作为分区列比较条件,其他暂不支持'
                      }
                    </div>
                    <div>{'5. 条件列必须是添加数据表时指定的一级或二级分区字段'}</div>
                  </>
                }
                label={<div className={styles.configItemLabel}>分区</div>}
                name={'datatable_partition'}
              >
                <Input></Input>
              </Form.Item>
            );
          }
          return false;
        }}
      </Form.Item>
    </Form.Item>
  );
};
