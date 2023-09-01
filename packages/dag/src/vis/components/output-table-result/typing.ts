import type { ResultOriginData } from '../typing';

export enum AnchorType {
  datatable = 'datatable',
  unionTable = 'unionTable',
  resultTable = 'resultTable',
  binningRule = 'binningRule',
  binningResult = 'binningResult',
  feTable = 'feTable',
  model = 'model',
  any = 'any',
  preProcessRule = 'preProcessRule',
  equalCutRule = 'equalCutRule',
  abnormalProcessRule = 'abnormalProcessRule',
  oneHotRule = 'oneHotRule',
}

export interface DataType {
  name: string;
  type: string;
  node_id: string;
}

export type DataIndex = keyof DataType;

export interface Columns {
  key: string;
  title: string;
  dataIndex: string;
  showSorterTooltip: boolean;
  sorter?: (a: any, b: any) => number;
  render?: (val: string, record: Record<string, any>) => JSX.Element | string;
}

export interface OutputSchema {
  name: string;
  type: string;
}

export interface RecordItem {
  path: string;
  name: string;
  id: string;
  fields: string;
  fieldTypes: string;
  tableID: string;
  dsID: string;
}

export interface OutputSheetProps {
  outputTable: {
    tableName: string;
    type: string;
  };
  tableInfo: {
    records: Array<Array<any>>;
    schema: OutputSchema[];
    gmt_create?: string;
    gmt_modified?: string;
    detail?: string;
  };
}

export interface OutputTableProps {
  outputTable: {
    tableName: string;
    type: string;
  };
  tableInfo: ResultOriginData;
}
