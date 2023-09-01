import { PlusCircleFilled, DeleteOutlined } from '@ant-design/icons';
import { Form, Select } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';

import {
  getProject,
  getProjectDatatable,
} from '@/services/secretpad/ProjectController';

import styles from '../index.less';

import type { RenderProp } from './config-render-protocol';
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

  useEffect(() => {
    const currentTableId = upstreamTables[index];
    const getTables = async () => {
      const dataTableList: (API.ProjectDatatableBaseVO & {
        nodeId: string | undefined;
      })[] = [];
      const { search } = window.location;
      const { projectId } = parse(search) as { projectId: string };
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes } = data;
      if (!nodes) return;
      nodes.map((n) => {
        const { datatables, nodeId } = n;
        if (!datatables) return;
        datatables.map((table) => dataTableList.push({ ...table, nodeId }));
      });
      const table = dataTableList.find((d) => d.datatableId === currentTableId);
      if (!table) return;
      const { data: tableConfig } = await getProjectDatatable({
        projectId,
        nodeId: table.nodeId,
        datatableId: table.datatableId,
      });
      if (!tableConfig) return;
      const { configs } = tableConfig;
      if (configs) {
        setCols(
          configs.map(({ colName }: { colName: string }) => ({
            value: colName,
            label: colName,
          })),
        );
        setTableName(table.datatableName);
      }
    };

    getTables();
  }, [index, upstreamTables]);

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
                    required={col_min_cnt_inclusive > 0}
                  >
                    <Select options={colsOptions} />
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
