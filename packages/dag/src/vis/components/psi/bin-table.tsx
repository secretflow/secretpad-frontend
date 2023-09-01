import { Table } from 'antd';
import React from 'react';

import type { Bin } from './interface';

const columns = [
  { title: 'Label', dataIndex: 'label' },
  { title: 'PSI', dataIndex: 'psi' },
  { title: 'Base Ratio', dataIndex: 'base_ratio' },
  { title: 'Test Ratio', dataIndex: 'test_ratio' },
];

export const RenderBinTable: React.FC<Props> = ({ bins }) => {
  return (
    <Table
      size="small"
      rowKey="label"
      columns={columns}
      dataSource={bins}
      pagination={false}
    />
  );
};

export interface Props {
  bins: Bin[];
}
