import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
import React from 'react';

import type { ResultData } from '../typing';
import { lexicographicalOrder } from '../utils';

import { RenderBinTable } from './bin-table';
import type { FeatureEqualCutInfo } from './interface';
import { handleResultData } from './utils';

export interface BinningProps {
  data: ResultData;
}

export const EqualCutComponent: React.FC<BinningProps> = (props) => {
  const { data } = props;
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  const columns: TableColumnsType<FeatureEqualCutInfo> = [
    {
      title: 'feature',
      dataIndex: 'feature',
      sorter: (a, b) => lexicographicalOrder(a.feature, b.feature),
      showSorterTooltip: false,
    },
    // TODO: 数据没有返回特征类型，之前是通过上游传下来的特征自己进行组装的
    // {
    //   title: '类型',
    //   dataIndex: 'type',
    //   sorter: (a, b) => lexicographicalOrder(a.type, b.type),
    //   showSorterTooltip: false,
    // },
    {
      title: '分箱数',
      dataIndex: 'bin_count',
      render: (_, record) => {
        return record.bins?.length - 1;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      bordered
      size="small"
      expandable={{
        expandedRowRender: (record) => <RenderBinTable bins={record.bins} />,
      }}
      dataSource={parsedData.sort((a: FeatureEqualCutInfo, b: FeatureEqualCutInfo) =>
        lexicographicalOrder(a.feature, b.feature),
      )}
      rowKey="feature"
    />
  );
};
