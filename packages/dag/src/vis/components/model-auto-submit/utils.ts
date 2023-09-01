import type { ResultData } from '../typing';
import { parseData, safeJson } from '../utils';

export const handleResultData = (data: ResultData) => {
  return parseData(
    {
      records: data.records,
      tableHeader: data.schema.map((item) => item.name),
    },
    'records',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map(({ bins, ...info }: Record<string, any>) => ({
    ...info,
    bins: safeJson(bins),
  }));
};
