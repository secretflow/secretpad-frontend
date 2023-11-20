import {
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Button, Empty, Space, Table } from 'antd';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { CSVLink } from 'react-csv';

import type { DescriptionList, ResultOriginData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';

import { DescriptionTable } from './description-table';
import './index.less';

export const OutputTable: React.FC<OutputTableProps> = (props) => {
  const {
    name: tableName,
    tableInfo: requestTableInfo,
    showFullscreen = false,
  } = props;
  const fullScreenRef = React.useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullScreenRef);
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
        render: (text) => {
          return (
            <div style={{ whiteSpace: 'nowrap' }} title={text}>
              {text.length > 12
                ? `${text.slice(0, 6)}...${text.slice(text.length - 6, text.length)}`
                : text}
            </div>
          );
        },
      });
    } else {
      columnsList.push({
        key: name,
        title: name,
        dataIndex: name,
        showSorterTooltip: false,
        render: (text) => {
          return (
            <div style={{ whiteSpace: 'nowrap' }} title={text}>
              {text.length > 12
                ? `${text.slice(0, 6)}...${text.slice(text.length - 6, text.length)}`
                : text}
            </div>
          );
        },
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
        <Button type="link" style={{ right: 8 }} size="small" onClick={downloadData}>
          <DownloadOutlined />
          导出数据
        </Button>
        {!isFullscreen && showFullscreen && (
          <Space
            onClick={enterFullscreen}
            style={{ color: 'rgba(0,10,26,0.68)', cursor: 'pointer' }}
          >
            <FullscreenOutlined />
            <span>全屏</span>
          </Space>
        )}
      </div>
      <CSVLink
        filename={`${tableName}.csv`}
        data={convertDownDataSource(dataSource)}
        ref={csvRef}
      />
      <div
        ref={fullScreenRef}
        className={classNames({
          fullScreenContentPage: isFullscreen,
        })}
      >
        {isFullscreen && (
          <div className="fullScreenHeader">
            <div className="title">表字段</div>
            <Space className="exit">
              <Button
                type="link"
                style={{ color: 'rgba(0,10,26,0.68)', right: 8 }}
                size="small"
                onClick={downloadData}
              >
                <DownloadOutlined />
                导出数据
              </Button>
              <Space onClick={exitFullscreen}>
                <FullscreenExitOutlined />
                <span>退出全屏</span>
              </Space>
            </Space>
          </div>
        )}
        <Table
          className={classNames('outPutTableItem', {
            fullScreenContentWrap: isFullscreen,
          })}
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
  showFullscreen?: boolean;
}
