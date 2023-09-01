import { Descriptions, Table, Space } from 'antd';
import React from 'react';

import type { ResultOriginData } from '../typing';
import { modifyDataStructure } from '../utils';

import './index.less';
import { handleResultData } from './utils';

export interface DatasetSampleProps {
  data: ResultOriginData;
}

export const DatasetSample: React.FC<DatasetSampleProps> = (props) => {
  const { data: requestData } = props;
  const data = modifyDataStructure(requestData);
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  const columns = React.useMemo(
    () => [
      {
        title: '分位点',
        dataIndex: 'quantiles',
      },
      {
        title: '权重',
        dataIndex: 'sample_weight',
      },
      {
        title: '采样前样本量',
        dataIndex: 'num_before_sample',
      },
      {
        title: '采样后样本量',
        dataIndex: 'num_after_sample',
      },
    ],
    [],
  );

  return (
    <Space direction="vertical" size="middle" className="dagComponentDatasetSample">
      <Descriptions bordered size="small">
        <Descriptions.Item label="采样倍率">{parsedData.sample_rate}</Descriptions.Item>
        <Descriptions.Item label="采样前样本总量">
          {parsedData.num_before_sample}
        </Descriptions.Item>
        <Descriptions.Item label="采样后样本总量">
          {parsedData.num_after_sample}
        </Descriptions.Item>
      </Descriptions>
      <Table
        bordered
        size="small"
        rowKey="quantiles"
        dataSource={parsedData.stratified_sample_results}
        columns={columns}
      />
    </Space>
  );
};
