import { Button } from 'antd';
import React, { useRef, useMemo } from 'react';
import { CSVLink } from 'react-csv';

import type { ResultData, ResultOriginData } from '../typing';
import { modifyDataStructure, parseData } from '../utils';

import { Chart } from './chart';
import './index.less';
import { parsePVAData } from './utils';
import { DownloadOutlined } from '@ant-design/icons';

export interface PVAChartProps {
  data: ResultOriginData;
}

export const PVAChart: React.FunctionComponent<PVAChartProps> = ({
  data: requestData,
}) => {
  const data = modifyDataStructure(requestData);
  if (data.type !== 'table') return null;
  const chartData = React.useMemo(() => parsePVAData(data as ResultData), [data]);
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const handleExportData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };
  const downData = useMemo(
    () =>
      parseData(
        {
          records: (data?.records || []) as (string | number)[][],
          tableHeader: (data?.schema || []).map((item) => {
            if (item.name === 'avg_prediction') {
              return 'avg_prediction';
            }
            if (item.name === 'avg_label') {
              return 'avg_label';
            }
            if (item.name === 'bias') {
              return 'bias';
            }
            return item.name;
          }),
        },
        'records',
      ),
    [data],
  );

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<DownloadOutlined />}
        className="customBtn"
        onClick={handleExportData}
      >
        导出数据
      </Button>
      <CSVLink filename="PVA.csv" data={downData} ref={csvRef} />
      <div className="dagComponentPvaChart">
        <Chart data={chartData} />
      </div>
    </>
  );
};
