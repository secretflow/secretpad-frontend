import { DeleteOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { Form, Space, Select, Button, Input } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useState, useEffect, useMemo } from 'react';

import type { AtomicConfigNode } from '@/modules/component-config/component-config-protocol';
import {
  getProject,
  getProjectAllOutTable,
} from '@/services/secretpad/ProjectController';

import { MultiFieldSelectModal } from '../../default-feature-selection/multi-field-select-modal';
import type { IDataTable, IOutputDataTable } from '../types';
import { useCols } from '../utils';

import styles from './index.less';
import { AggregationFunction } from './types';

const FUNC_OPTIONS = [
  {
    value: AggregationFunction.SUM,
    label: 'sum',
  },
  {
    value: AggregationFunction.MEAN,
    label: 'mean',
  },
  {
    value: AggregationFunction.VAR,
    label: 'var',
  },
  {
    value: AggregationFunction.MIN,
    label: 'min',
  },
  {
    value: AggregationFunction.MAX,
    label: 'max',
  },
  {
    value: AggregationFunction.COUNT,
    label: 'count',
  },
];

export const GroupByRender = (prop: { node: AtomicConfigNode }) => {
  const { node, upstreamTables = [], disabled } = prop;
  const { name } = node;
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const fromInputIndex = 0;
  const [columns, setColumns] = useState<{ label: string; value: string }[]>([]);
  const [columnInfo, setColumnInfo] = useState<{ colName: string; colType: string }[]>(
    [],
  );

  const [tables, setTables] = useState<IDataTable[]>([]);
  const [outputTables, setOutputTables] = useState<IOutputDataTable[]>([]);

  useDeepCompareEffect(() => {
    const getTables = async () => {
      const dataTableList: IDataTable[] = [];
      const { search } = window.location;
      const { projectId, dagId } = parse(search) as {
        projectId: string;
        dagId: string;
      };

      const { data } = await getProject({ projectId });
      const { data: outputData } = await getProjectAllOutTable({
        projectId,
        graphId: dagId,
      });

      if (outputData?.nodes) {
        setOutputTables(
          outputData.nodes.reduce<IOutputDataTable[]>(
            (ret, { outputs, graphNodeId }) =>
              outputs && graphNodeId
                ? ret.concat(
                    outputs.map((output) => ({
                      graphNodeId,
                      datatableId: output,
                      datatableName: output,
                      nodeId: '',
                    })),
                  )
                : ret,
            [],
          ),
        );
      }
      if (!data) return;

      const { nodes } = data;
      if (!nodes) return;

      nodes.map((_node) => {
        const { datatables } = _node;
        if (!datatables) return;
        datatables.map((table) =>
          dataTableList.push({
            ...table,
            nodeId: _node?.nodeId,
          } as IDataTable),
        );
      });

      setTables(
        dataTableList.filter(
          ({ datatableId }) => (upstreamTables as string[]).indexOf(datatableId) > -1,
        ),
      );
    };

    getTables();
  }, [upstreamTables]);

  const fromTable = useMemo(() => {
    if (fromInputIndex !== undefined && upstreamTables[fromInputIndex]) {
      const tableName = upstreamTables[fromInputIndex];

      return outputTables.find(({ datatableName }) => datatableName === tableName);
    }
  }, [fromInputIndex, upstreamTables, outputTables]);

  useCols(
    (val: { colName: string; colType: string }[]) => {
      setColumnInfo(val);
      setColumns(
        val.map((option: { colName: string; colType: string }) => ({
          value: option.colName,
          label: option.colName,
        })),
      );
    },
    fromTable,
    tables,
  );

  const form = Form.useFormInstance();
  const groupCols = Form.useWatch('input/input_data/by', form);

  return (
    <Form.Item name={name} noStyle preserve={false}>
      <Form.List name={[name, 'column_queries']}>
        {(fields, { remove }, { errors }) => {
          return (
            <>
              <Space>
                <div className={classnames([styles.title, styles.col])}>统计指标</div>
                <div className={classnames([styles.title, styles.col])}>数值</div>
              </Space>
              <Form.ErrorList errors={errors} className={styles.error} />
              {fields.map(({ key, name, ...restField }) => {
                return (
                  <Space key={key} align={'baseline'}>
                    <Form.Item
                      {...restField}
                      className={styles.col}
                      name={[name, 'function']}
                      initialValue={AggregationFunction.MEAN}
                      rules={[{ required: true, message: '请选择统计指标' }]}
                    >
                      <Select options={FUNC_OPTIONS} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      className={styles.col}
                      name={[name, 'column_name']}
                      dependencies={['input/input_data/by']}
                      rules={[
                        { required: true, message: '请选择值列' },
                        {
                          validator: (_, value) => {
                            if (groupCols.includes(value)) {
                              return Promise.reject(new Error('分组列不可选'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Select
                        placeholder="值列"
                        options={columns.filter(
                          ({ value }) => !(groupCols || []).includes(value),
                        )}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(
                          input: string,
                          option?: { label: string; value: string },
                        ) =>
                          (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Button
                      className={styles.title}
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length < 2}
                    />
                  </Space>
                );
              })}
              {!disabled && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => setShowSelectorModal(true)}
                  style={{ fontSize: 13 }}
                >
                  添加数值
                </Button>
              )}
            </>
          );
        }}
      </Form.List>
      <Form.Item noStyle>
        <MultiFieldSelectModal
          visible={showSelectorModal}
          tableInfos={tables}
          fromTableInfo={fromTable}
          outputTableInfos={outputTables}
          multiple={Array.isArray(tables) && tables.length > 1}
          submit={(val) => {
            const cols = form.getFieldValue([name, 'column_queries']) || [];

            val?.forEach((v, index) => {
              if (index < cols.length) {
                cols[index]['column_name'] = v;
              } else {
                cols[index] = {
                  column_name: v,
                  function: AggregationFunction.MEAN,
                };
              }
            });

            form.setFieldValue([name, 'column_queries'], cols);
            return { value: cols };
          }}
          fields={
            form
              .getFieldValue([name, 'column_queries'])
              ?.filter(
                (f: { function: AggregationFunction; column_name: string }) =>
                  f?.column_name,
              )
              .map((f: { function: AggregationFunction; column_name: string }) => {
                return { colName: f.column_name };
              }) || []
          }
          hideModal={() => setShowSelectorModal(false)}
          disabled={disabled}
          rules={{ excludes: groupCols, min: 1 }}
        />
      </Form.Item>
    </Form.Item>
  );
};
