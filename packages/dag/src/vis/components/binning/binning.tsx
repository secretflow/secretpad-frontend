import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
import React from 'react';

import type { ResultData } from '../typing';
import { lexicographicalOrder } from '../utils';

import { RenderBinTable } from './bin-table';
import { getColumnSearchProps } from './binning-info';
import './index.less';
import type { FeatureBinInfo } from './interface';
import { handleResultData } from './utils';

export interface BinningProps {
  data: ResultData;
}

export const Binning: React.FC<BinningProps> = (props) => {
  const { data } = props;
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  const columns: TableColumnsType<FeatureBinInfo> = [
    {
      title: 'feature',
      dataIndex: 'feature_x_field_name',
      sorter: (a, b) => {
        return lexicographicalOrder(a.feature_x_field_name, b.feature_x_field_name);
      },
      ...getColumnSearchProps('feature_x_field_name'),
      showSorterTooltip: false,
    },
    {
      title: 'IV',
      dataIndex: 'iv',
      sorter: (a, b) => a.iv - b.iv,
      showSorterTooltip: false,
    },
    { title: '分箱数', dataIndex: 'bin_count' },
  ];

  return (
    <div>
      <Table
        columns={columns}
        bordered
        size="small"
        expandable={{
          expandedRowRender: (record) => <RenderBinTable bins={record.bins} />,
        }}
        dataSource={parsedData.sort((a: FeatureBinInfo, b: FeatureBinInfo) =>
          lexicographicalOrder(a.feature_x_field_name, b.feature_x_field_name),
        )}
        rowKey="feature_x_field_name"
      />
    </div>
  );
};
