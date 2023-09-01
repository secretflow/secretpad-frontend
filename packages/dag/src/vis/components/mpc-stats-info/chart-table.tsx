import { Table, Progress } from 'antd';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import { AreaChart } from './area-chart';
import './index.less';
import type { ContinuousField } from './interface';

const columns = [
  {
    title: '字段名称',
    dataIndex: 'field_name',
    className: 'name',
  },
  {
    title: '有效值比例',
    dataIndex: 'summary',
    width: 100,
    className: 'valid',
    render: ({
      total_count,
      valid_count,
    }: {
      total_count: number;
      valid_count: number;
    }) => (
      <Progress
        width={72}
        type="circle"
        percent={Math.floor((valid_count / total_count) * 100)}
        format={(percent) => `${percent}%`}
      />
    ),
  },
  {
    title: '分布区间',
    dataIndex: 'continuous_report',
    className: 'areaChart',
    render: (
      continuous_report: { hist: number[] },
      { field_name }: { field_name: string },
    ) =>
      continuous_report ? (
        <div>
          <AreaChart
            height={64}
            className="chart"
            key={field_name}
            data={continuous_report.hist}
          />
        </div>
      ) : (
        '-'
      ),
  },
];

export const ChartTable: React.FunctionComponent<IChartTableProps> = (props) => {
  const { info, className } = props;

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [info.length]);

  return (
    <Table
      className={classNames(className, 'chartTable')}
      columns={columns}
      dataSource={info}
      pagination={false}
      bordered
      rowKey="field_name"
    />
  );
};

interface IChartTableProps {
  info: ContinuousField[];
  className?: string;
}
