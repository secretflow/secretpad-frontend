import { DownloadOutlined } from '@ant-design/icons';
import { Button, Empty, Table } from 'antd';
import React, { useRef } from 'react';
import { CSVLink } from 'react-csv';

import type { DescriptionList, ResultOriginData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';

import { DescriptionTable } from './description-table';

import './index.less';

export const OutputTable: React.FC<OutputTableProps> = (props) => {
  const { name: tableName, tableInfo: requestTableInfo } = props;
  const tableInfo = modifyDataStructure(requestTableInfo);
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const downloadData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  if (!tableInfo) {
    return (
      <div className="content">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 120 }} />
      </div>
    );
  }

  if (tableInfo.type === 'descriptions') {
    return (
      <DescriptionTable
        data={tableInfo.records as DescriptionList[]}
        tableName={tableName}
      />
    );
  }

  const columnsList: Columns[] = [];
  tableInfo.schema.forEach(({ name, type }) => {
    if (name !== 'name') {
      columnsList.push({
        key: name,
        title: name,
        dataIndex: name,
        sorter: (a, b) => {
          if (
            type === 'AT_INT' ||
            type === 'AT_STRING' ||
            type === 'int' ||
            type === 'str'
          ) {
            return lexicographicalOrder(a[name], b[name]);
          }
          return a[name] - b[name];
        },
        showSorterTooltip: false,
      });
    } else {
      columnsList.push({
        key: name,
        title: name,
        dataIndex: name,
        showSorterTooltip: false,
      });
    }
  });
  const dataSource = ((tableInfo.records as (string | number | boolean)[][]) || []).map(
    (record, index) => {
      const res: { key: number; [propName: string]: number | string | boolean } = {
        key: index,
      };
      columnsList.forEach((col, i) => {
        if (typeof record[i] === 'string') {
          // 防止导出时候值也会进行逗号分割
          res[col.dataIndex] = (record[i] as string).replace(/"/g, '');
        } else {
          res[col.dataIndex] = record[i];
        }
      });
      return res;
    },
  );
  // 去除导出数据时手动加入的key
  const convertDownDataSource = (dataList: { key?: number }[] = []) => {
    return dataList.map((item) => {
      delete item.key;
      return item;
    });
  };

  return (
    <div className="VisOutputTableContent">
      <div className="exportBtn">
        <Button
          type="link"
          style={{ color: 'rgba(0,10,26,0.68)', right: 0 }}
          size="small"
          onClick={downloadData}
        >
          <DownloadOutlined />
          导出数据
        </Button>
      </div>
      <CSVLink
        filename={`${tableName}.csv`}
        data={convertDownDataSource(dataSource)}
        ref={csvRef}
      />
      <Table
        bordered
        size="small"
        columns={columnsList}
        rowKey={(record) => {
          return record.name as string;
        }}
        dataSource={dataSource}
        scroll={{ x: '100%' }}
        pagination={
          dataSource.length > 100 && { pageSize: 100, showSizeChanger: false }
        }
      />
    </div>
  );
};

export interface Columns {
  key: string;
  title: string;
  dataIndex: string;
  showSorterTooltip: boolean;
  sorter?: (a: any, b: any) => number;
  render?: (val: string, record: Record<string, any>) => JSX.Element | string;
}

export interface OutputTableProps {
  name: string;
  tableInfo: ResultOriginData;
}
