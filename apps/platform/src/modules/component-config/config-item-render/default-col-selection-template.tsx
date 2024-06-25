import { PlusCircleFilled, DeleteOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { Form, Select } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import {
  getProject,
  getProjectAllOutTable,
  getProjectDatatable,
} from '@/services/secretpad/ProjectController';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';
import type { IDataTable, IOutputDataTable } from './custom-render/types';
import style from './index.less';

// Used for select join key for psi
export const DefaultColSelection: React.FC<RenderProp<string>> = (config) => {
  const { node, upstreamTables = [], index, translation, disabled } = config;
  const inputName = (node.prefixes || ['input', 'input_table'])[1];
  const formName =
    node.prefixes && node.prefixes.length > 0
      ? node.prefixes.join('/') + '/' + node.name
      : node.name;
  const { col_min_cnt_inclusive = 0, col_max_cnt_inclusive } = node;
  const [colsOptions, setCols] = useState<{ value: string; label: string }[]>([]);
  const [tableName, setTableName] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [tables, setTables] = useState<IDataTable[]>([]);
  const [outputTables, setOutputTables] = useState<IOutputDataTable[]>([]);

  const [columnInfo, setColumnInfo] = useState<{ colName: string; colType: string }[]>(
    [],
  );

  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as {
    projectId: string;
    dagId: string;
  };
  useDeepCompareEffect(() => {
    const getTables = async () => {
      const dataTableList: IDataTable[] = [];

      const { data } = await getProject({ projectId });
      const { data: outputData } = await getProjectAllOutTable({
        projectId,
        graphId: dagId,
      });

      // all the outputs in the graph
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

      // upsteam tables
      setTables(
        dataTableList.filter(
          ({ datatableId }) => (upstreamTables as string[]).indexOf(datatableId) > -1,
        ),
      );
    };

    getTables();
  }, [upstreamTables]);

  const fromTable = useMemo(() => {
    if (index !== undefined && upstreamTables[index]) {
      const currentTableId = upstreamTables[index];

      return (
        tables.find(({ datatableId }) => datatableId === currentTableId) ||
        outputTables.find(({ datatableId }) => datatableId === currentTableId)
      );
    }
  }, [index, upstreamTables, outputTables]);

  useEffect(() => {
    const getCols = async (table) => {
      const { datatableId, nodeId, graphNodeId } = table;
      const tableFields: { colName: string; colType: string }[] = [];

      if (!nodeId && graphNodeId) {
        const { data } = await getGraphNodeOutput({
          projectId,
          graphId: dagId,
          graphNodeId,
          outputId: datatableId,
        });

        if (data?.meta?.rows?.length) {
          data.meta.rows.forEach(
            ({ fieldTypes, fields }: { fieldTypes: string; fields: string }) => {
              if (fieldTypes && fields) {
                const fieldList = fields.split(',');
                const fieldTypeList = fieldTypes.split(',');
                tableFields.push(
                  ...fieldList.map((f, i) => ({
                    colName: f,
                    colType: fieldTypeList[i],
                  })),
                );
              }
            },
          );
        }
      } else {
        const { data } = await getProjectDatatable({
          datatableId,
          nodeId,
          projectId,
          /**
           * 需求:  数据管理列表不仅有csv数据，还有http数据，画布上只会用到 csv 类型
           * 所以除数据管理模块，其他用到的这个接口都需要加一个type: CSV 类型用来区分数据源类型，用于服务端做代码兼容
           */
          type: 'CSV',
        });
        if (!data) return;
        const { configs } = data;

        configs.map((c) => {
          tableFields.push({ colName: c.colName, colType: c.colType });
        });
      }
      setTableName(fromTable?.datatableName);
      setColumnInfo(tableFields);
      setCols(
        tableFields.map((option: { colName: string; colType: string }) => ({
          value: option.colName,
          label: option.colName,
        })),
      );
    };

    if (fromTable) getCols(fromTable);
  }, [fromTable]);

  return (
    <>
      <div className={classnames(styles.description, style.description)}>
        <span className={styles.label}>{translation[inputName] || inputName}：</span>
        <span>{tableName}</span>
      </div>
      {errorMsg && <div className={style.errorMsg}>{errorMsg}</div>}
      <Form.List
        name={formName}
        initialValue={[undefined]}
        rules={[
          {
            validator: async (_, cols) => {
              if (upstreamTables[0] === upstreamTables[1]) {
                setErrorMsg('样本表不能选择同一份');
                return Promise.reject(new Error(`样本表不能选择同一份`));
              }
              if (!cols || cols.length < (col_min_cnt_inclusive || 1)) {
                return Promise.reject(
                  new Error(`至少选择${col_min_cnt_inclusive || 1}列作为关联键`),
                );
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ name, ...restField }, i) => (
              <div className={style.selectionItem} key={i}>
                <div className={style.selectionItemInput}>
                  <Form.Item
                    {...restField}
                    name={name}
                    label={
                      <div className={styles.configItemLabel}>{`${node.name}${
                        i + 1
                      }`}</div>
                    }
                    tooltip={translation[node.docString] || node.docString}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 20 }}
                    rules={[
                      {
                        required: col_min_cnt_inclusive > 0,
                        message: `至少选择${col_min_cnt_inclusive || 1}列作为关联键`,
                      },
                    ]}
                  >
                    <Select
                      options={colsOptions}
                      showSearch
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
                </div>
                {(!col_max_cnt_inclusive || col_max_cnt_inclusive > 1) && !disabled && (
                  <div className={style.selectionItemIcon}>
                    {i === 0 ? (
                      <PlusCircleFilled onClick={() => add()} />
                    ) : (
                      <DeleteOutlined onClick={() => remove(i)} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </Form.List>
    </>
  );
};
