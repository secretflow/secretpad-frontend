import { Table } from 'antd';
import classNames from 'classnames';
import React from 'react';

import './index.less';
import type { DiscreteField } from './interface';

const columns = [
  {
    title: '字段名称',
    dataIndex: 'field_name',
    className: 'name',
  },
  {
    title: '缺失值比例',
    dataIndex: 'summary',
    render: ({
      null_count = 0,
      total_count,
    }: {
      null_count: number;
      total_count: number;
    }) =>
      `${
        Math.floor((null_count / total_count) * 10000000) / 100000
      }% (${null_count}/${total_count})`,
  },
  {
    title: 'Distinct',
    dataIndex: 'discrete_report',
    className: 'freqItem',
    render: (discrete_report: { distinct: string }) =>
      discrete_report ? discrete_report.distinct : '-',
  },
];

export const DiscreteDataTable: React.FunctionComponent<IDiscreteDataTableProps> = (
  props,
) => {
  const { info, className } = props;

  return (
    <Table
      className={classNames(className, 'table')}
      columns={columns}
      dataSource={info}
      pagination={false}
      bordered
      rowKey="field_name"
    />
  );
};

interface IDiscreteDataTableProps {
  className?: string;
  info: DiscreteField[];
}
