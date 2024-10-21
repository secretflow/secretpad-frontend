import { PlusCircleFilled, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Form, Input, Select, Tag, Typography } from 'antd';
import { parse } from 'query-string';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import {
  getProject,
  getProjectDatatable,
} from '@/services/secretpad/ProjectController';

import { MultiTableFeatureSelection } from '../config-item-render/default-feature-selection/table-feature-selection';

import styles from './index.less';

const { Option } = Select;

type QuickConfigPSIComponentProps = {
  tables: {
    datatableId: string;
    nodeName: string;
    datatableName: string;
    isPartitionTable?: boolean;
  }[];
  tableList: (API.ProjectDatatableBaseVO & {
    nodeId: string | undefined;
    nodeName: string | undefined;
  })[];

  form: FormInstance;
  type?: 'MPC' | 'TEE';
};

export const QuickConfigPSIComponent = (props: QuickConfigPSIComponentProps) => {
  const { tables, tableList, form, type = 'TEE' } = props;

  const { s: selectedReceiver } = Form.useWatch('dataTableReceiver', form) || {};
  const { s: selectedSender } = Form.useWatch('dataTableSender', form) || {};
  const [receiverCols, setReceiverCols] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [senderCols, setSenderCols] = useState<{ value: string; label: string }[]>([]);
  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  const [nodeOptions, setNodeOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const [selectedTableInfo, setSelectedTableInfo] = useState<
    {
      datatableId: string;
      datatableName: string;
      nodeId: string;
      nodeName: string;
    }[]
  >([]);

  const getCols = async (
    selectedTable: string,
    callback: Dispatch<SetStateAction<{ value: string; label: string }[]>>,
  ) => {
    const table = tableList.find((d) => d.datatableId === selectedTable);
    if (!table) return;
    const { data: tableConfig } = await getProjectDatatable({
      projectId,
      nodeId: table.nodeId,
      datatableId: table.datatableId,
      type: 'CSV',
    });
    if (!tableConfig) return;
    const { configs } = tableConfig;

    if (configs) {
      callback(
        configs.map(({ colName }: { colName: string }) => ({
          value: colName,
          label: colName,
        })),
      );
    }
  };

  useEffect(() => {
    const tableSelected = tableList.filter(
      (d) => d.datatableId === selectedReceiver || d.datatableId === selectedSender,
    ) as {
      datatableId: string;
      datatableName: string;
      nodeId: string;
      nodeName: string;
    }[];

    if (tableSelected.length > 1) setSelectedTableInfo(tableSelected);
    if (tableSelected.length > 0) {
      setNodeOptions(
        tableSelected.map((table) => ({
          value: table.nodeId as string,
          label: table.nodeName as string,
        })),
      );
    }
  }, [selectedReceiver, selectedSender, projectId]);

  useEffect(() => {
    getCols(selectedReceiver, setReceiverCols);
  }, [selectedReceiver, projectId]);

  useEffect(() => {
    getCols(selectedSender, setSenderCols);
  }, [selectedSender, projectId]);

  return (
    <>
      <Form.Item
        label={<div className={styles.configItemLabel}>样本表1</div>}
        name={'dataTableReceiver'}
        messageVariables={{ label: '样本表' }}
        rules={[
          {
            required: true,
          },
        ]}
        valuePropName="value"
        colon={false}
        getValueProps={(value) => {
          return { value: value?.s };
        }}
        getValueFromEvent={(value) => {
          return { s: value };
        }}
      >
        <Select
          optionLabelProp="title"
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
      <Form.Item noStyle dependencies={['dataTableReceiver']}>
        {({ getFieldValue }) => {
          const selectId = getFieldValue('dataTableReceiver');
          const selected = tables.find(
            (t) => t.datatableId === selectId?.s,
          )?.isPartitionTable;
          if (selected && type === 'MPC') {
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
                name={'dataTableReceiverPartition'}
              >
                <Input></Input>
              </Form.Item>
            );
          }
          return false;
        }}
      </Form.Item>

      <Form.List name={['receiverKey', 'ss']} initialValue={[undefined]}>
        {(fields, { add, remove }, { errors }) =>
          fields.map((field, index) => (
            <div className={styles.selectionItem} key={index}>
              <div className={styles.selectionItemInput}>
                <Form.Item
                  {...field}
                  required={index === 0}
                  label={
                    <div className={styles.configItemLabel}>关联键{index + 1}</div>
                  }
                  rules={[
                    {
                      validator: async (_, col) => {
                        if (!col && index === 0)
                          return Promise.reject(new Error(`至少选择1列作为关联键`));

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    options={receiverCols}
                    showSearch
                    filterOption={(
                      input: string,
                      option?: { label: string; value: string },
                    ) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </div>
              <div className={styles.selectionItemIcon}>
                {index === 0 ? (
                  <PlusCircleFilled onClick={() => add()} />
                ) : (
                  <DeleteOutlined onClick={() => remove(index)} />
                )}
              </div>
            </div>
          ))
        }
      </Form.List>

      <Form.Item
        label={<div className={styles.configItemLabel}>样本表2</div>}
        name={'dataTableSender'}
        messageVariables={{ label: '样本表' }}
        rules={[
          {
            required: true,
            validator: (_, val) => {
              if (val?.s === selectedReceiver)
                return Promise.reject(new Error('不能选择同一份样本表'));

              return Promise.resolve();
            },
          },
        ]}
        colon={false}
        valuePropName="value"
        getValueProps={(value) => {
          return { value: value?.s };
        }}
        getValueFromEvent={(value) => {
          return { s: value };
        }}
      >
        <Select
          optionLabelProp="title"
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

      <Form.Item noStyle dependencies={['dataTableSender']}>
        {({ getFieldValue }) => {
          const selectId = getFieldValue('dataTableSender');
          const selected = tables.find(
            (t) => t.datatableId === selectId?.s,
          )?.isPartitionTable;
          if (selected && type === 'MPC') {
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
                name={'dataTableSenderPartition'}
              >
                <Input></Input>
              </Form.Item>
            );
          }
          return false;
        }}
      </Form.Item>

      <Form.List name={['senderKey', 'ss']} initialValue={[undefined]}>
        {(fields, { add, remove }, { errors }) =>
          fields.map((field, index) => (
            <div className={styles.selectionItem} key={index}>
              <div className={styles.selectionItemInput}>
                <Form.Item
                  {...field}
                  required={index === 0}
                  label={
                    <div className={styles.configItemLabel}>关联键{index + 1}</div>
                  }
                  valuePropName="value"
                  rules={[
                    {
                      validator: async (_, col) => {
                        if (!col && index === 0)
                          return Promise.reject(new Error(`至少选择1列作为关联键`));
                        if (!col)
                          return Promise.reject(new Error(`关联键为空，请删除`));

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    options={senderCols}
                    showSearch
                    filterOption={(
                      input: string,
                      option?: { label: string; value: string },
                    ) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </div>
              <div className={styles.selectionItemIcon}>
                {index === 0 ? (
                  <PlusCircleFilled onClick={() => add()} />
                ) : (
                  <DeleteOutlined onClick={() => remove(index)} />
                )}
              </div>
            </div>
          ))
        }
      </Form.List>
      {type === 'MPC' && (
        <Form.Item noStyle>
          <Form.Item
            name="featureSelects"
            label={<div className={styles.configItemLabel}>选择特征</div>}
            required
            messageVariables={{ msg: '请选择特征列' }}
            rules={[
              {
                required: true,
                message: '${msg}',
                validator: (_, val) => {
                  if (!val || val.length === 0)
                    return Promise.reject(new Error('${msg}'));

                  return Promise.resolve();
                },
              },
            ]}
            getValueProps={(value) => {
              return { value: value?.ss };
            }}
            getValueFromEvent={(value) => {
              return { ss: value };
            }}
          >
            <MultiTableFeatureSelection
              tableKeys={selectedTableInfo}
              size={'small'}
              rules={{ min: 1 }}
            />
          </Form.Item>

          <Form.Item
            name="receiverPSI"
            label={<div className={styles.configItemLabel}>PSI结果接收方</div>}
            required
            messageVariables={{ label: '接收方' }}
            valuePropName="value"
            getValueProps={(value) => {
              return { value: value?.ss };
            }}
            tooltip={'PSI结果的接收方'}
            getValueFromEvent={(value) => {
              return { ss: value };
            }}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select mode="multiple" options={nodeOptions} />
          </Form.Item>
        </Form.Item>
      )}
    </>
  );
};

export const QuickConfigPSI = (props: { type?: 'MPC' | 'TEE' }) => {
  const { type = 'TEE' } = props;
  const form = Form.useFormInstance();
  const [tables, setTables] = useState<
    { datatableId: string; nodeName: string; datatableName: string }[]
  >([]);
  const [tableList, setTableList] = useState<
    (API.ProjectDatatableBaseVO & {
      nodeId: string | undefined;
      nodeName: string | undefined;
    })[]
  >([]);

  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  useEffect(() => {
    const getTables = async () => {
      const dataTableOptions: {
        datatableId: string;
        nodeName: string;
        datatableName: string;
        isPartitionTable: boolean; // 是否是ODPS分区表
      }[] = [];
      const dataTableList: (API.ProjectDatatableBaseVO & {
        nodeId: string | undefined;
        nodeName: string | undefined;
      })[] = [];
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes } = data;
      if (!nodes) return;

      nodes.map((node) => {
        const { datatables, nodeId, nodeName } = node;

        if (!datatables) return;
        datatables.map((table) => {
          dataTableList.push({ ...table, nodeId, nodeName });
          if (table.datatableId && table.datatableName)
            dataTableOptions.push({
              datatableId: table.datatableId,
              nodeName: nodeName as string,
              datatableName: table.datatableName,
              isPartitionTable:
                table.partition?.type === 'odps' && table.partition?.fields,
            });
        });
      });

      setTables(dataTableOptions);
      setTableList(dataTableList);
    };

    getTables();
  }, [projectId]);

  return (
    <QuickConfigPSIComponent
      tables={tables}
      tableList={tableList}
      form={form}
      type={type}
    />
  );
};
