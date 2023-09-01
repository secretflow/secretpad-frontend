import { SearchOutlined } from '@ant-design/icons';
import type { TableColumnType, TableColumnsType } from 'antd';
import { Input, Table } from 'antd';
import React from 'react';

import type { ResultData } from '../typing';

import './index.less';
import { handleResultData } from './utils';

export const getColumnSearchProps = <T,>(dataIndex: keyof T) => {
  const searchProps: Pick<
    TableColumnType<T>,
    'filterDropdown' | 'filterIcon' | 'onFilter'
  > = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div className="dagComponentBinningTableSearch">
        <Input.Search
          size="small"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onSearch={() => confirm()}
          onPressEnter={() => confirm()}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFilter: (value, record: any) =>
      record[dataIndex] && typeof record[dataIndex] === 'string'
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : '',
  };
  return searchProps;
};

const renderBinTable = ({ bins }: Info) => {
  const count = bins.reduce((sum, cur) => sum + Number(cur.sample_count), 0);
  const columns: TableColumnsType<Bin> = [
    { title: 'Label', dataIndex: 'label' },
    {
      title: 'Total Rate',
      dataIndex: 'sample_count',
      render: (text) => {
        if (Number(text)) {
          return `${((Number(text) / count) * 100).toFixed(4)}%`;
        }
        return 0;
      },
    },
  ];

  return (
    <Table
      bordered
      size="small"
      rowKey="label"
      columns={columns}
      dataSource={bins}
      pagination={false}
    />
  );
};

export const BinningInfo: React.FunctionComponent<BinningInfoProps> = (props) => {
  const { data } = props;
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  const columns: TableColumnsType<Info> = React.useMemo(
    () => [
      {
        title: 'feature',
        dataIndex: 'feature_name',
        sorter: (a, b) =>
          a.feature_name
            .toLocaleLowerCase()
            .localeCompare(b.feature_name.toLocaleLowerCase()),
        ...getColumnSearchProps('feature_name'),
        showSorterTooltip: false,
      },
      { title: '分箱数', dataIndex: 'bin_count' },
    ],
    [],
  );

  return (
    <div className="dagComponentbinningInfo">
      <Table
        bordered
        size="small"
        columns={columns}
        rowKey="feature_name"
        dataSource={parsedData}
        expandedRowRender={renderBinTable}
      />
    </div>
  );
};

interface Bin {
  label: string;
  sample_count: string;
}

interface Info {
  feature_name: string;
  bin_count: string;
  bins: Bin[];
}

export interface BinningInfoProps {
  data: ResultData;
}
