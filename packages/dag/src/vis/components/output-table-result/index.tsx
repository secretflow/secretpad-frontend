import { Button, Empty, Table, Descriptions, Typography } from 'antd';
import { each } from 'lodash';
import React, { useRef } from 'react';
import { CSVLink } from 'react-csv';

import { lexicographicalOrder, modifyDataStructure } from '../utils';

import './index.less';
import { OutputSheet } from './output-sheet';
import type { Columns, OutputTableProps } from './typing';

const { Text } = Typography;

export const OutputTable: React.FC<OutputTableProps> = (props) => {
  const { outputTable, tableInfo: requestTableInfo } = props;
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

  const showJson =
    tableInfo.schema &&
    tableInfo.schema.length === 1 &&
    tableInfo.schema[0].name === 'metas';

  if (showJson && outputTable) {
    return <OutputSheet outputTable={outputTable} tableInfo={tableInfo} />;
  }

  const columnsList: Columns[] = [];
  each(tableInfo.schema, ({ name, type }) => {
    columnsList.push({
      key: name,
      title: name,
      dataIndex: name,
      sorter: (a, b) => {
        // if (type === 'STRING') {
        if (type === 'AT_INT') {
          return lexicographicalOrder(a[name], b[name]);
        }
        return a[name] - b[name];
      },
      showSorterTooltip: false,
    });
  });
  const dataSource = (tableInfo.records || []).map((record, index: number) => {
    const res: { key: number; [propName: string]: number | string } = {
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
  });
  // 去除导出数据时手动加入的key
  const convertDownDataSource = (dataList: { key?: number }[] = []) => {
    return dataList.map((item) => {
      delete item.key;
      return item;
    });
  };

  return (
    <div className="dagComponentOutputTableContent">
      <Descriptions column={2}>
        <Descriptions.Item
          label="表名称"
          contentStyle={{
            overflow: 'hidden',
          }}
        >
          <Text ellipsis={{ tooltip: true }}>{outputTable.tableName}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label="更新时间"
          contentStyle={{
            overflow: 'hidden',
          }}
        >
          {/* <Text ellipsis={{ tooltip: true }}>{tableInfo?.gmt_modified}</Text> */}
          <Text ellipsis={{ tooltip: true }}>{'-'}</Text>
        </Descriptions.Item>
      </Descriptions>
      <Button className="itemClickButton" size="small" onClick={downloadData}>
        导出数据
      </Button>
      <CSVLink
        filename={`${outputTable.tableName}.csv`}
        data={convertDownDataSource(dataSource)}
        ref={csvRef}
      />
      <Table
        bordered
        size="small"
        columns={columnsList}
        dataSource={dataSource}
        scroll={{ x: '100%' }}
        pagination={
          dataSource.length > 100 && { pageSize: 100, showSizeChanger: false }
        }
      />
    </div>
  );
};
