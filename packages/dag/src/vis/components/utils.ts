import type {
  ResultOriginData,
  TypeOfData,
  DescChildrenType,
  TableChildrenType,
} from './typing';

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
  const result = resultObj.divs[0].children[0];
  let schema: {
    name: string;
    type: TypeOfData;
  }[] = [];
  const record: Array<string | number> = [];
  if (result.type === 'descriptions') {
    schema = (result as DescChildrenType).descriptions.items.map((item) => {
      if (item.type === 'AT_INT') {
        record.push(item.value?.i64 ?? '-');
      }
      if (item.type === 'AT_FLOAT') {
        record.push(item.value?.f ?? '-');
      }
      if (item.type === 'AT_STRING') {
        record.push(item.value?.s ?? '-');
      }
      return {
        name: item.name,
        type: item.type,
      };
    });
    return {
      records: [record],
      schema,
    };
  }

  if (result.type === 'table') {
    schema = (result as TableChildrenType).table.headers;
    const mapList = (result as TableChildrenType).table.headers.map(
      (header: { name: string; type: 'AT_INT' | 'AT_FLOAT' | 'AT_STRING' }) => {
        if (header.type === 'AT_INT') {
          return 'i64';
        }
        if (header.type === 'AT_FLOAT') {
          return 'f';
        }
        if (header.type === 'AT_STRING') {
          return 's';
        }
        return;
      },
    );
    const list = (result as TableChildrenType).table.rows.map(
      (item: { items: { f?: number; i64?: string; s?: string }[] }) => {
        const arr: Array<string | number> = [];
        item.items.forEach((objRow, index) => {
          const key = mapList[index];
          if (key === undefined) {
            arr.push('--');
          } else {
            arr.push(objRow?.[key] ?? '--');
          }
        });
        return arr;
      },
    );
    return {
      records: list,
      schema,
    };
  }
  return {
    records: [],
    schema: [],
  };
};
