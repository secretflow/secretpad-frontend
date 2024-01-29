// A page of a report.
export type Tab = {
  // Name of the Tab.
  name: string;

  desc: string;

  divs: ReportDiv[];
};

export type Item = {
  name: string;
  desc: string;
  type:
    | 'float'
    | 'int'
    | 'bool'
    | 'str'
    | 'AT_FLOAT'
    | 'AT_INT'
    | 'AT_STRING'
    | 'AT_BOOL';
  value: Value;
};

export type Descriptions = {
  name: string;
  desc: string;
  items: Item[];
};

type Table = {
  name: string;
  desc: string;
  headers: {
    name: string;
    desc: string;
    type:
      | 'float'
      | 'int'
      | 'bool'
      | 'str'
      | 'AT_FLOAT'
      | 'AT_INT'
      | 'AT_STRING'
      | 'AT_BOOL';
  }[];

  rows: { name: string; desc: string; items: Value[] }[];
};

type ReportDiv = {
  name: string;
  desc: string;
  children: ReportDivChildren[];
};

type ReportDivChildren =
  | { type: 'descriptions'; descriptions: Descriptions }
  | {
      type: 'table';
      table: Table;
    }
  | { type: 'div'; div: ReportDiv };

export type Value = {
  f: string;
  i64: number | string;
  s: string;
  b: boolean;
  fs: number[];
  i64s: number[];
  ss: string[];
  bs: boolean[];
};

export const TypeMap = {
  float: 'f',
  int: 'i64',
  bool: 'b',
  str: 's',
  AT_FLOAT: 'f',
  AT_INT: 'i64',
  AT_STRING: 's',
  AT_BOOL: 'b',
};
