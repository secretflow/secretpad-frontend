import type { ResultData } from '../typing';
import { parseData, safeJson } from '../utils';

import type { ResultEqualCutInfo } from './interface';

export const handleResultData = (data: ResultData) => {
  return parseData(
    {
      records: data.records,
      tableHeader: data.schema.map((item) => item.name),
    },
    'records',
  ).map(({ bins, ...info }: ResultEqualCutInfo) => ({
    ...info,
    bins: safeJson(bins),
  }));
};
