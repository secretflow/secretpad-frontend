import type { Item, Descriptions } from '../result-report-types';

import type { ResultOriginData } from './typing';

export function parseData(
  { tableHeader, records }: { tableHeader: string[]; records: (string | number)[][] },
  type = '',
) {
  switch (type) {
    case 'records':
      return records.map((values) =>
        values.reduce(
          (tempRes, value = '', i) => ({
            ...tempRes,
            [tableHeader[i]]: value,
          }),
          {},
        ),
      );

    default:
      return records.reduce(
        (tempData: any, values: any[]) =>
          values.reduce((tempRes, value = '', i) => {
            tempRes[tableHeader[i]].push(value);

            return tempRes;
          }, tempData),
        tableHeader.reduce(
          (headers: any, column: any) => ({
            ...headers,
            [column]: [],
          }),
          {},
        ),
      );
  }
}

export const safeJson = (jsonStr = '{}', defaultVal = {}) => {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn(`${jsonStr} is not valid json`);
    return defaultVal;
  }
};

export const execCopy = (content: string) => {
  const input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = content;
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  }
  document.body.removeChild(input);
};

// 修改排序为字典序
export const lexicographicalOrder = (a: string, b: string) => {
  const parseItem = (item: string) => {
    const [, stringPart = '', numberPart = 0] = /(^[a-zA-Z]*)(\d*)$/.exec(item) || [];
    return [stringPart, numberPart];
  };

  const [stringFeatureNameA, numberFeatureNameA] = parseItem(a) as any;
  const [stringFeatureNameB, numberFeatureNameB] = parseItem(b) as any;

  const comparison = stringFeatureNameA
    ?.toLocaleLowerCase()
    .localeCompare(stringFeatureNameB.toLocaleLowerCase());

  return !stringFeatureNameA && !stringFeatureNameB
    ? a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
    : comparison === 0
    ? Number(numberFeatureNameA) - Number(numberFeatureNameB)
    : comparison;
};

export const modifyDataStructure = (resultObj: ResultOriginData) => {
  const result = resultObj.divs[0]?.children[0];
  if (result?.type === 'descriptions') {
    const records = resultObj.divs
      ?.reduce<Item[]>(
        (ret, div) =>
          div?.children
            ? ret.concat(
                div.children.reduce<Item[]>(
                  (
                    childrenRet,
                    {
                      descriptions,
                      type,
                    }: { type: string; descriptions?: Descriptions },
                  ) =>
                    type === 'descriptions' && descriptions && descriptions?.items
                      ? childrenRet.concat(descriptions.items)
                      : childrenRet,
                  [],
                ),
              )
            : ret,
        [],
      )
      .map((item) => {
        let value: number | string | boolean | undefined = '-';
        if (item.type === 'AT_INT' || item.type === 'int') {
          value = item.value?.i64 ?? '-';
        }
        if (item.type === 'float' || item.type === 'AT_FLOAT') {
          value = item.value?.f ?? '-';
        }
        if (item.type === 'str' || item.type === 'AT_STRING') {
          value = item.value?.s ?? '-';
        }
        if (item.type === 'bool' || item.type === 'AT_BOOL') {
          value = item.value?.b ?? '-';
        }
        return {
          name: item.name,
          value,
        };
      });
    const schemaHeader = result.descriptions.items.map((item) => ({
      name: item.name,
      type: item.type,
    }));
    return {
      records: records || [],
      schema: schemaHeader,
      type: 'descriptions',
    };
  }

  if (result?.type === 'table') {
    const arr = result.table;
    const recordList = arr.rows.map((row, i) => {
      const { items, name = i } = row;
      const rowData = items.map((item, index) => {
        const { type } = arr.headers[index];
        let value: number | string | boolean | undefined = '-';

        if (type === 'float' || type === 'AT_FLOAT') {
          value = item.f ?? '-';
        } else if (type === 'str' || type === 'AT_STRING') {
          value = item.s ?? '-';
        } else if (type === 'int' || type === 'AT_INT') {
          value = item.i64 ?? '-';
        } else if (type === 'bool' || type === 'AT_BOOL') {
          value = item.b ?? '-';
        }

        return value;
      });
      return [name, ...rowData];
    });

    const schemaList = [{ name: 'name', type: 'str' }, ...arr.headers];
    return { records: recordList, schema: schemaList, type: 'table' };
  }
  return {
    records: [],
    schema: [],
  };
};

// 转换相关系数矩阵需要的数据格式
export const transformCorrMatrixData = (resultObj: ResultOriginData) => {
  const result = resultObj.divs[0]?.children[0];
  const records: string[][] = [];
  if (result?.type === 'table') {
    const headers = result.table.headers;
    result.table.rows.forEach((row) => {
      const name = row.name;
      const items = row.items;
      items.forEach((item, index) => {
        const value =
          headers[index].type === 'float' || headers[index].type === 'AT_FLOAT'
            ? item.f
            : item.s;
        const record = [name, headers[index].name, value];
        records.push(record);
      });
    });
  }

  const schema = [
    { name: 's', type: 'STRING' },
    { name: 't', type: 'STRING' },
    { name: 'v', type: 'DOUBLE' },
  ];
  return {
    records,
    schema,
  };
};
