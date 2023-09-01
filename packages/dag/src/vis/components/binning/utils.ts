import { sumBy } from 'lodash';

import type { ResultData } from '../typing';
import { parseData, safeJson } from '../utils';

import type { BinType, ResultBinInfo } from './interface';

export const renderPositiveRate = ({
  positive_count,
  total_count,
}: {
  positive_count: string;
  total_count: string;
}) => {
  const positiveCount = parseInt(positive_count, 10);
  const totalCount = parseInt(total_count, 10);
  if (positiveCount === 0 || totalCount === 0) {
    return 0;
  }
  return `${((positiveCount / totalCount) * 100).toFixed(4)}%`;
};

export const renderTotalRate = ({
  total_count,
  total,
}: {
  total_count: string;
  total: number;
}) => {
  const totalCount = parseInt(total_count, 10);
  if (totalCount === 0 || total === 0) {
    return 0;
  }
  return `${((totalCount / total) * 100).toFixed(4)}%`;
};

export const handleResultData = (data: ResultData) => {
  return parseData(
    {
      records: data.records,
      tableHeader: data.schema.map((item) => item.name),
    },
    'records',
  ).map(({ bins, ...info }: ResultBinInfo) => {
    const total = sumBy(safeJson(bins), ({ total_count }: { total_count: string }) =>
      parseInt(total_count, 10),
    ) as number;
    return {
      ...info,
      bins: safeJson(bins).map((items: BinType) => ({
        ...items,
        total,
        positive_rate: renderPositiveRate(items),
        total_rate: renderTotalRate({ ...items, total }),
      })),
    };
  });
};
