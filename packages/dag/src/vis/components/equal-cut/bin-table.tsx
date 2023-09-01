import { Table } from 'antd';
import React from 'react';

import type { BinType } from './interface';

const columns = [
  { title: '序号', dataIndex: 'bin_num', key: 'bin_num' },
  { title: 'bin', dataIndex: 'label', key: 'label' },
  { title: 'weight', dataIndex: 'sum_weight', key: 'sum_weight' },
  { title: 'count', dataIndex: 'sample_count', key: 'sample_count' },
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
