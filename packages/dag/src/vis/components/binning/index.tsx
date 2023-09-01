import { Button } from 'antd';
import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';

import type { ResultOriginData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';

import { Binning } from './binning';
import type { BinType, FeatureBinInfo } from './interface';
import { handleResultData } from './utils';
import './index.less';

export interface BinningProps {
  data: ResultOriginData;
}

export const WoeBinning: React.FC<BinningProps> = (props) => {
  const { data: requestData } = props;
  const resultData = modifyDataStructure(requestData);
  const csvRef = React.useRef<{
    link: HTMLLinkElement;
  }>(null);
  const handleExportData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const downData = useMemo(() => {
    const data: (string | number)[][] = [['feature', 'IV', '分箱数']];
    if (resultData) {
      const exportData = JSON.parse(JSON.stringify(handleResultData(resultData))).sort(
        (a: FeatureBinInfo, b: FeatureBinInfo) =>
          lexicographicalOrder(a.feature_x_field_name, b.feature_x_field_name),
      );

      exportData?.forEach(
        (item: {
          feature_x_field_name: string;
          iv: number;
          bin_count: number;
          bins: BinType[];
        }) => {
          data.push([item.feature_x_field_name, item.iv, item.bin_count]);
          if (item.bins?.length) {
            data.push([
              'Label',
              'Positive Count',
              'Total Count',
              'Positive Rate',
              'Total Rate',
              'WOE',
              'IV',
            ]);
            item.bins.forEach((items) => {
              data.push([
                items.label,
                items.positive_count,
                items.total_count,
                items.positive_rate,
                items.total_rate,
                items.woe,
                items.iv,
              ]);
            });
          }
        },
      );
    }
    return data;
  }, [resultData]);

  return (
    <div className="dagComponentbinningInfo">
      <Button onClick={handleExportData} className="exportButton">
        导出数据
      </Button>
      <Binning data={resultData} />
      <CSVLink filename="woe_bin.csv" data={downData} ref={csvRef} />
    </div>
  );
};
