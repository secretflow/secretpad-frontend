import type { ResultData } from '../typing';
import { parseData } from '../utils';

import type { ChartDataItem, DataItem } from './interface';

export const parsePVAData = (data: ResultData) => {
  const { records, schema } = data;
  const parsedData: DataItem[] = parseData(
    { records, tableHeader: schema.map(({ name }) => name) },
    'records',
  );
  return parsedData.reduce<ChartDataItem[]>(
    (acc, { pva, label, bad_rate, positive_rate, avg_score }) =>
      acc.concat([
        {
          label,
          value: pva,
          type: 'pva',
        },
        {
          label,
          value: bad_rate ?? positive_rate,
          type: 'positive_rate',
        },
        {
          label,
          value: avg_score,
          type: 'avg_score',
        },
      ]),
    [],
  );
};
