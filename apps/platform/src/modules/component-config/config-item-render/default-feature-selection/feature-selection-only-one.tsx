import { useDeepCompareEffect } from 'ahooks';
import { Select } from 'antd';
import { uniqBy } from 'lodash';
import { parse } from 'query-string';
import { useState } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import type { TableInfoType } from './type';

export interface IProps {
  /** 上游的输出表 */
  tableKeys: TableInfoType[];
  /** 上游输入的样本表 */
  fromTableKey?: TableInfoType;
  onChange?: (values: string[]) => void;
  value?: string[];
}

export const SingleTableFeatureSelection = (props: IProps) => {
  const { tableKeys: tables, fromTableKey: fromTable, value = [], onChange } = props;
  const [colsOptions, setCols] = useState<{ value: string; label: string }[]>([]);
  const { search } = useLocation();

  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  useDeepCompareEffect(() => {
    const getSchema = async () => {
      const tableFields: { colName: string; colType: string }[] = [];
      // 利用最上游输入的样本表 fromTable  和 上游的输出表(tables) 来进行获取特征
      const schemaArr = fromTable ? [fromTable, ...tables] : tables;
      await Promise.all(
        schemaArr.map(async (s) => {
          const { datatableId, nodeId, graphNodeId } = s;

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
              type: 'CSV',
            });
            if (!data) return;
            const { configs } = data;
            configs.map((c) => {
              tableFields.push({ colName: c.colName, colType: c.colType });
            });
          }
        }),
      );
      const selectOptions = tableFields.map(
        (option: { colName: string; colType: string }) => ({
          value: option.colName,
          label: option.colName,
          key: `${option.colName}_${option.colType}`,
        }),
      );
      const cols = uniqBy(selectOptions, 'key');
      setCols(cols);
    };
    getSchema();
  }, [fromTable, tables]);

  return (
    <Select
      maxCount={1}
      mode="multiple"
      value={value}
      onChange={onChange}
      options={colsOptions}
      showSearch
      filterOption={(input: string, option?: { label: string; value: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};
