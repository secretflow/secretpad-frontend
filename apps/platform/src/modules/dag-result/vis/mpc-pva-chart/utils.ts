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
    (acc, { avg_prediction, interval: label, avg_label, bias }) =>
      acc.concat([
        {
          label,
          value: avg_prediction,
          type: 'avg_prediction',
        },
        {
          label,
          value: avg_label,
          type: 'avg_label',
        },
        {
          label,
          value: bias,
          type: 'bias',
        },
      ]),
    [],
  );
};
