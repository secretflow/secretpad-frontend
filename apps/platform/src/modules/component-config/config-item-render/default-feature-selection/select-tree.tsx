import { DownOutlined } from '@ant-design/icons';
import { Tree, Tag } from 'antd';
import { parse } from 'query-string';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import style from './index.less';
import type { FieldInfoType, TableInfoType } from './type';

const typeMap = {
  str: 'STRING',
  string: 'STRING',
  f32: 'FLOAT',
  float: 'FLOAT',
  i32: 'INTEGER',
  int: 'INTEGER',
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
}: IProps) => {
  const [treeData, setTreeData] = useState<TreeOptions[]>([]);
  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };
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
          const { datatableId, nodeId } = s;
          const { data } = await getProjectDatatable({
            datatableId,
            nodeId,
            projectId,
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
            const leaf = {
              title,
              key: colName,
            };

            typesData[colType as keyof typeof typeMap].push(leaf);
          });
        }),
      );
      const treeDataList: TreeOptions[] = [];

      for (const type in typesData) {
        const node = {
          children: typesData[type as keyof typeof typesData],
          key: typeMap[type as keyof typeof typesData],
          title: typeMap[type as keyof typeof typesData] as string,
        };
        treeDataList.push(node);
      }

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
}
