import type { Tab } from '../result-report-types';

export interface ResultData {
  schema: Record<string, string>[];
  records: (string | number)[][];
  columns?: Record<string, string>;
  detail?: string | null;
  gmt_modified?: string;
}

// export type TypeOfData = 'AT_FLOAT' | 'AT_INT' | 'AT_STRING';
export type TypeOfData =
  | 'float'
  | 'int'
  | 'bool'
  | 'str'
  | 'AT_FLOAT'
  | 'AT_INT'
  | 'AT_STRING'
  | 'AT_BOOL';

export type ChildrenType = 'table' | 'descriptions';

export interface TableChildrenType {
  type: ChildrenType;
  table: {
    headers: {
      name: string;
      type: TypeOfData;
    }[];
    rows: {
      name: string;
      items: {
        f?: number;
        i64?: string;
        s?: string;
        b?: boolean;
      }[];
    }[];
  };
}

export interface DescChildrenType {
  type: ChildrenType;
  descriptions: {
    items: {
      name: string;
      type: TypeOfData;
      value: {
        f?: number;
        i64?: string;
        s?: string;
        b?: boolean;
      };
    }[];
  };
}

export type ResultOriginData = Tab;

export interface DescriptionList {
  name: string;
  value: string | number;
}
