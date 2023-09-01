import { Table } from 'antd';
import classNames from 'classnames';
import React from 'react';

import './index.less';
import type { ContinuousField } from './interface';

const DEFAULT_REPORT = {
  mean: 0,
  max: 0,
  min: 0,
  q1: 0,
  q2: 0,
  q3: 0,
  variance: 0,
  standard_deviation: 0,
  standard_error: 0,
};

const columns = [
  {
    title: '字段名称',
    dataIndex: 'field_name',
    className: 'name',
    fixed: true,
    width: 160,
    render: (name: string) => <span title={name}>{name}</span>,
  },
  {
    title: '字段类型',
    dataIndex: 'field_type',
    width: 160,
  },
  {
    title: '缺失值比例',
    dataIndex: 'null_count',
    width: 160,
    sorter: (a: { null_count: number }, b: { valid_count: number }) =>
      a.null_count - b.valid_count,
    showSorterTooltip: false,
    render: (
      _valid: string,
      { null_count = 0, total_count = 0 }: { null_count: number; total_count: number },
    ) =>
      `${
        Math.floor((null_count / total_count) * 10000000) / 100000
      }% (${null_count}/${total_count})`,
  },
  {
    title: '最小值',
    dataIndex: 'min',
    width: 168,
    sorter: (a: { min: number }, b: { min: number }) => a.min - b.min,
    showSorterTooltip: false,
  },
  {
    title: 'Q1',
    dataIndex: 'q1',
    width: 168,
    sorter: (a: { q1: number }, b: { q1: number }) => a.q1 - b.q1,
    showSorterTooltip: false,
  },
  {
    title: '中位数',
    dataIndex: 'q2',
    width: 168,
    sorter: (a: { q2: number }, b: { q2: number }) => a.q2 - b.q2,
    showSorterTooltip: false,
  },
  {
    title: 'Q3',
    dataIndex: 'q3',
    width: 168,
    sorter: (a: { q3: number }, b: { q3: number }) => a.q3 - b.q3,
    showSorterTooltip: false,
  },
  {
    title: '最大值',
    dataIndex: 'max',
    width: 168,
    sorter: (a: { max: number }, b: { max: number }) => a.max - b.max,
    showSorterTooltip: false,
  },
  {
    title: 'variance',
    dataIndex: 'variance',
    width: 168,
    sorter: (a: { variance: number }, b: { variance: number }) =>
      a.variance - b.variance,
    showSorterTooltip: false,
  },
  {
    title: 'mean',
    dataIndex: 'mean',
    width: 168,
    sorter: (a: { mean: number }, b: { mean: number }) => a.mean - b.mean,
    showSorterTooltip: false,
  },
  {
    title: 'standardDeviation',
    dataIndex: 'standard_deviation',
    width: 168,
    sorter: (a: { standard_deviation: number }, b: { standard_deviation: number }) =>
      a.standard_deviation - b.standard_deviation,
    showSorterTooltip: false,
  },
  {
    title: 'standrad error',
    dataIndex: 'standard_error',
    width: 184,
    sorter: (a: { standard_error: number }, b: { standard_error: number }) =>
      a.standard_error - b.standard_error,
    showSorterTooltip: false,
  },
];

export const ContinueDataTable: React.FunctionComponent<IContinueDataTableProps> = (
  props,
) => {
  const { info, className } = props;
  const data = info.map(({ field_name, field_type, summary, continuous_report }) => {
    const report = continuous_report || DEFAULT_REPORT;

    return {
      field_name,
      field_type,
      ...summary,
      ...report,
    };
  });

  return (
    <Table
      className={classNames(className, 'table')}
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      scroll={{ x: 1130 }}
      rowKey={(record) => record.field_name as string}
      locale={{
        triggerDesc: '点击降序',
        triggerAsc: '点击升序',
        cancelSort: '取消排序',
      }}
    />
  );
};

interface IContinueDataTableProps {
  info: ContinuousField[];
  className?: string;
}
