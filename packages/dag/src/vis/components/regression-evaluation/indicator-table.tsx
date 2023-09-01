import type { TableColumnsType } from 'antd';
import { Alert, Table } from 'antd';
import React from 'react';

import './index.less';
import { renderIndicatorText } from './utils';

export interface IndicatorDataItem {
  indicator: string;
  value: number;
}

export interface IndicatorTableProps {
  dataSource: IndicatorDataItem[];
}

const columns: TableColumnsType<IndicatorDataItem> = [
  {
    title: '指标',
    dataIndex: 'indicator',
    render: (key) => renderIndicatorText(key),
  },
  {
    title: 'Value',
    dataIndex: 'value',
  },
];

export const IndicatorTable: React.FunctionComponent<IndicatorTableProps> = (props) => {
  const { dataSource } = props;

  return (
    <div className="indicator">
      {(dataSource.find(({ indicator }) => indicator === 'sample_count')?.value || 0) <
        100 && (
        <Alert
          message="样本量少于100条，数据安全原因无法展示指标明细，请调整样本量"
          type="warning"
          showIcon
          closable
          className="alert"
        />
      )}
      <Table
        bordered
        rowKey="indicator"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
};
