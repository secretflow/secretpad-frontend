import { Button } from 'antd';
import React, { useRef, useMemo } from 'react';
import { CSVLink } from 'react-csv';

import type { ResultOriginData } from '../typing';
import { modifyDataStructure, parseData } from '../utils';

import { Chart } from './chart';
import './index.less';
import { parsePVAData } from './utils';

export interface PVAChartProps {
  data: ResultOriginData;
}

export const PVAChart: React.FunctionComponent<PVAChartProps> = ({
  data: requestData,
}) => {
  const data = modifyDataStructure(requestData);
  const chartData = React.useMemo(() => parsePVAData(data), [data]);
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
          records: data?.records || [],
          tableHeader: (data?.schema || []).map((item) => {
            if (item.name === 'positive') {
              return 'positive_count';
            }
            if (item.name === 'bad_rate') {
              return 'positive_rate';
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
      <Button type="primary" onClick={handleExportData}>
        下载数据
      </Button>
      <CSVLink filename="PVA.csv" data={downData} ref={csvRef} />
      <div className="dagComponentPvaChart">
        <Chart data={chartData} />
      </div>
    </>
  );
};
