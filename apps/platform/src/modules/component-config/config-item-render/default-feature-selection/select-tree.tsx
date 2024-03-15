import { DownOutlined } from '@ant-design/icons';
import { Tree, Tag } from 'antd';
import { parse } from 'query-string';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import style from './index.less';
import type { FieldInfoType, TableInfoType } from './type';

const typeMap = {
  str: 'STRING',
  string: 'STRING',
  f32: 'FLOAT',
  float: 'FLOAT',
  float32: 'FLOAT',
  float64: 'FLOAT',
  i32: 'INTEGER',
  int: 'INTEGER',
  int64: 'INTEGER',
};

type TreeOptions = {
  key: string;
  title: string | JSX.Element;
  children?: TreeOptions[];
};

type ColType = {
  colComment: string;
  colName: string;
  colType: string;
  isAssociateKey: boolean;
  isGroupKey: boolean;
  isLabelKey: boolean;
};

export const SelectTree = ({
  schema,
  selectedFields,
  setSelectedFields,
  disabled,
  rules,
}: IProps) => {
  const [treeData, setTreeData] = useState<TreeOptions[]>([]);
  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };
  const { excludes = [] } = rules || {};

  useEffect(() => {
    if (!schema) return;
    const getLeaves = async () => {
      const schemaArr = Array.isArray(schema) ? schema : [schema];

      const typesData: Record<
        keyof typeof typeMap,
        { title: string | JSX.Element; key: string }[]
      > = {} as Record<
        keyof typeof typeMap,
        { title: string | JSX.Element; key: string }[]
      >;

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
                    const typeList = fieldTypes.split(',');

                    fieldList.forEach((colName, i) => {
                      const colType = typeList[i];
                      if (colType) {
                        if (!typesData[colType as keyof typeof typeMap]) {
                          typesData[colType as keyof typeof typeMap] = [];
                        }
                        if (
                          !typesData[colType as keyof typeof typeMap].find(
                            ({ key }) => key === colName,
                          )
                        ) {
                          const type = typeMap[colType as keyof typeof typeMap];
                          const leaf = {
                            title: `${colName}(${type})`,
                            key: colName,
                            disabled: excludes.includes(colName),
                          };

                          typesData[colType as keyof typeof typeMap].push(leaf);
                        }
                      }
                    });
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

            configs?.map((col: ColType) => {
              const { colName, colType, isAssociateKey, isGroupKey, isLabelKey } = col;
              if (!typesData[colType as keyof typeof typeMap]) {
                typesData[colType as keyof typeof typeMap] = [];
              }
              const type = typeMap[colType as keyof typeof typeMap];

              const title = isAssociateKey ? (
                <span>
                  {colName}
                  {`(${type})`}
                  <Tag color="cyan">关联键</Tag>
                </span>
              ) : isGroupKey ? (
                <span>
                  {colName}
                  {`(${type})`}
                  <Tag color="blue">分组列</Tag>
                </span>
              ) : isLabelKey ? (
                <span>
                  {colName}
                  {`(${type})`}
                  <Tag color="warning">标签列</Tag>
                </span>
              ) : (
                `${colName}(${type})`
              );

              if (
                !typesData[colType as keyof typeof typeMap].find(
                  ({ key }) => key === colName,
                )
              ) {
                const leaf = {
                  title,
                  key: colName,
                  disabled: excludes.includes(colName),
                };

                typesData[colType as keyof typeof typeMap].push(leaf);
              }
            });
          }
        }),
      );
      const treeDataList: TreeOptions[] = Object.entries(typesData).reduce<
        TreeOptions[]
      >((ret, [type, children = []]) => {
        const key = typeMap[type as keyof typeof typesData];

        const node = ret.find((n) => n.key === key);

        if (node) {
          node.children = node.children!.concat(
            children.filter((c) => !node.children!.find((nc) => nc.key === c.key)),
          );
        } else {
          ret.push({
            key,
            children,
            title: key,
          });
        }

        return ret;
      }, []);
      setTreeData(treeDataList);
    };
    getLeaves();
  }, [projectId, schema]);

  const onCheck = (checked: string[]) => {
    const filterCheckedKeysValue = checked.filter(
      (item) => !['STRING', 'FLOAT', 'INTEGER'].includes(item),
    );
    setSelectedFields(filterCheckedKeysValue.map((item) => ({ colName: item })));
  };

  return (
    <div className={style.treeWrap}>
      <Tree
        checkable
        disabled={disabled}
        onCheck={
          onCheck as (
            checked:
              | Key[]
              | {
                  checked: Key[];
                  halfChecked: Key[];
                },
          ) => void
        }
        checkedKeys={(selectedFields || []) as Key[]}
        treeData={treeData}
        switcherIcon={<DownOutlined />}
      />
    </div>
  );
};

export interface IProps {
  schema: TableInfoType[] | TableInfoType | undefined;
  selectedFields: (string | undefined)[];
  setSelectedFields: (fields: FieldInfoType[]) => void;
  dataType?: string;
  appendSchema?: boolean;
  disabled?: boolean;
  rules?: { max?: number; min: number; excludes?: string[] };
}
