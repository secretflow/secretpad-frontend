export interface ResultData {
  schema: Record<string, string>[];
  records: (string | number)[][];
  columns?: Record<string, string>;
  detail?: string | null;
  gmt_modified?: string;
}

export type TypeOfData = 'AT_FLOAT' | 'AT_INT' | 'AT_STRING';

export type ChildrenType = 'table' | 'descriptions';
export interface TableChildrenType {
  type: ChildrenType;
  table: {
    headers: {
      name: string;
      type: TypeOfData;
    }[];
    rows: {
      items: {
        f?: number;
        i64?: string;
        s?: string;
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
      };
    }[];
  };
}

export interface ResultOriginData {
  name?: string;
  divs: {
    children: Array<TableChildrenType | DescChildrenType>;
  }[];
}
