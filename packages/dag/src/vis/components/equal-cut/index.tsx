import { Button } from 'antd';
import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';

import { handleResultData } from '../binning/utils';
import type { ResultOriginData, ResultData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';

import { EqualCutComponent } from './equal-cut';
import type { FeatureEqualCutInfo } from './interface';
import './index.less';

interface EqualCutType {
  data: ResultOriginData;
}

const handleEqualCutData = (resultData: ResultData) => {
  // TODO: 数据没有返回特征类型，之前是通过上游传下来的特征自己进行组装的
  // const extra = JSON.parse(pipelineInfo?.components.find(item => item.component_id === this.resultService.nodeId)?.extra as string)
  const equalCutAddSchema = [
    // TODO: 数据没有返回特征类型，之前是通过上游传下来的特征自己进行组装的
    // { name: 'type', type: 'string' },
    { name: 'bin_count', type: 'number' },
  ];
  const columnNameMap: Record<string, string> = {
    feature_name: 'feature',
  };
  return {
    ...resultData,
    records: resultData?.records?.map((item) => {
      const bins = JSON.parse(item[0] as unknown as string);
      return [
        ...item,
        /// TODO: 数据没有返回特征类型，之前是通过上游传下来的特征自己进行组装的
        // Object.entries(extra.schemaObj).find((items) => items[0] === (item[1] as unknown as string))?.[1] || '',
        bins?.length - 1,
      ];
    }),
    schema: resultData?.schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((column: Record<string, any>) => ({
        ...column,
        name: columnNameMap[column.name] || column.name,
      }))
      .concat(equalCutAddSchema),
  };
};

export const EqualCut: React.FC<EqualCutType> = (props) => {
  const { data: requestData } = props;
  const resultData = modifyDataStructure(requestData);
  const equalCutResultData = handleEqualCutData(resultData);
  const csvRef = React.useRef<{
    link: HTMLLinkElement;
  }>(null);

  const handleExportData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const downData = useMemo(() => {
    /// TODO: 数据没有返回特征类型，之前是通过上游传下来的特征自己进行组装的
    // const data: (string | number)[][] = [['feature', '类型', '分箱数']]
    const data: (string | number)[][] = [['feature', '', '分箱数']];
    if (equalCutResultData) {
      const exportData = JSON.parse(
        JSON.stringify(handleResultData(equalCutResultData)),
      );
      exportData
        ?.sort((a: FeatureEqualCutInfo, b: FeatureEqualCutInfo) =>
          lexicographicalOrder(a.feature, b.feature),
        )
        ?.forEach(
          (item: { feature: string; type: number; bins: Record<string, string>[] }) => {
            data.push([item.feature, item.type, item.bins?.length - 1]);
            if (item.bins?.length) {
              data.push(['序号', 'bin', 'weight', 'count']);
              item.bins.forEach((items, index) =>
                data.push([index, items.label, items.sum_weight, items.sample_count]),
              );
            }
          },
        );
    }
    return data;
  }, [equalCutResultData]);

  return (
    <div className="dagComponentbinningInfo">
      <Button onClick={handleExportData} className="exportButton">
        导出数据
      </Button>
      <EqualCutComponent data={equalCutResultData} />
      <CSVLink filename="ef_ew_bin.csv" data={downData} ref={csvRef} />
    </div>
  );
};
