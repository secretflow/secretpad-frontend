import type { ResultData } from '../typing';
import { safeJson } from '../utils';

import type { DatasetSample } from './interface';
import { ObservationType } from './interface';

export const handleResultData = (data: ResultData) => {
  const parsedData: DatasetSample = safeJson(data.records[0][0] as string);
  const { quantiles, observation_type, stratified_sample_results } = parsedData;
  const quantilesLabels = quantiles.replace(/[[|\]]/g, '').split(',');

  // 根据参数判断 observation_type 判断是离散还是连续
  if (observation_type === ObservationType.Continuous) {
    parsedData.stratified_sample_results = stratified_sample_results.map(
      (item, index) => {
        const before = quantilesLabels[index - 1] ? quantilesLabels[index - 1] : '-inf';
        const after = quantilesLabels[index] ? `${quantilesLabels[index]} ]` : '+inf )';

        return {
          ...item,
          quantiles: `( ${before}, ${after}`,
        };
      },
    );
  } else {
    parsedData.stratified_sample_results = quantilesLabels.map((item, index) => {
      const otherType = stratified_sample_results[index];

      return {
        ...otherType,
        quantiles: item,
      };
    });
  }

  return parsedData;
};
