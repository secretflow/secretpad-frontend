import { QuestionCircleOutlined } from '@ant-design/icons';
import { Select, Tooltip } from 'antd';
import { useMemo } from 'react';

import style from './index.less';
import type { TableInfoType } from './type';

const { Option } = Select;

export const TableSelector = (props: IProps) => {
  const {
    tableInfos,
    selectedTable,
    multiple,
    selectedTables,
    setSelectedTable,
    setSelectedTables,
    outputTableInfos = [],
  } = props;
  const featureTableInfo = useMemo(
    () =>
      outputTableInfos.reduce(
        (ret, tableInfo) =>
          ret.find(({ datatableId }) => datatableId === tableInfo.datatableId)
            ? ret
            : ret.concat(tableInfo),
        tableInfos,
      ),
    [tableInfos, outputTableInfos],
  );
  const onChange = (tableId: string | string[]) => {
    if (multiple && tableId instanceof Array) {
      const tableIds = tableId.map((item) =>
        featureTableInfo.find(({ datatableId }) => datatableId === item),
      );
      setSelectedTables(tableIds as TableInfoType[]);
    } else {
      const table = featureTableInfo.find(({ datatableId }) => datatableId === tableId);
      if (table) {
        setSelectedTable(table);
      }
    }
  };

  return (
    <div className={style.tableSelector}>
      <span className={style.label}>
        选择字段表
        <Tooltip
          placement="top"
          title="字段表来自于当前及其上游组件的输入表，若输入表未产生则无法选择！"
        >
          <QuestionCircleOutlined />
        </Tooltip>
        ：
      </span>
      <Select
        showSearch
        className={style.selector}
        placeholder="请选择字段表"
        optionFilterProp="children"
        mode={multiple ? 'multiple' : undefined}
        value={
          multiple
            ? selectedTables?.map((item) => item.datatableId)
            : selectedTable?.datatableId
        }
        onChange={onChange}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {featureTableInfo.map(({ datatableId, datatableName }) => {
          // const disabled = multiple ? false : !Object.keys(schema).length;
          return (
            <Option key={datatableId} value={datatableId}>
              {datatableName}
              {/* <Tag className={style.componentTag}>{datatableName}</Tag> */}
            </Option>
          );
        })}
      </Select>
    </div>
  );
};

export interface IProps {
  tableInfos: TableInfoType[];
  outputTableInfos?: TableInfoType[];
  selectedTable?: TableInfoType;
  multiple?: boolean;
  setSelectedTable: (table: TableInfoType) => void;
  selectedTables?: TableInfoType[];
  setSelectedTables: (table: TableInfoType[]) => void;
}
