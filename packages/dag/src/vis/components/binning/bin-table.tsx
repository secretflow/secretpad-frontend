import { Table } from 'antd';
import React from 'react';

import type { BinType } from './interface';

const columns = [
  { title: 'Label', dataIndex: 'label', key: 'label' },
  { title: 'Positive Count', dataIndex: 'positive_count', key: 'positive_count' },
  { title: 'Total Count', dataIndex: 'total_count', key: 'total_count' },
  {
    title: 'positive_rate',
    dataIndex: 'positive_rate',
    key: 'positive_rate',
  },
  {
    title: 'total_rate',
    dataIndex: 'total_rate',
    key: 'total_rate',
  },
  { title: 'WOE', dataIndex: 'woe', key: 'woe' },
  { title: 'IV', dataIndex: 'iv', key: 'iv' },
];

export const RenderBinTable: React.FC<Props> = ({ bins }) => {
  return (
    <Table
      columns={columns}
      dataSource={bins}
      pagination={false}
      rowKey="label"
      size="small"
    />
  );
};

export interface Props {
  bins: BinType[];
}
