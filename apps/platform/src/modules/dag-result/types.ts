import type { DataSourceType } from '../data-source-list/type';

import type { Tab } from './result-report-types';

export type ResultComponentProps<T extends ResultType> = {
  data: OutputType<T>;
  id: string;
  codeName: string;
};
export type ResultRuleRow = {
  path: string;
  nodeId: string;
  tableId: string;
  type: string;
  datasourceType: DataSourceType;
};

export type ResultModelRow = ResultRuleRow;

type ResultTableRow = {
  fields: string;
  fieldTypes: string;
  tableId: string;
  dsId: string;
  type: string;
  datasourceType: DataSourceType;
} & ResultRuleRow;

export type ResultTableData = {
  meta: {
    headers: { name: string; type: string }[];
    rows: ResultTableRow[];
  };
  tabs: null;
};

export type ResultRuleData = {
  meta: {
    headers: { name: string; type: string }[];
    rows: ResultRuleRow[];
  };
  tabs: null;
};

export type ResultModelData = {
  meta: {
    headers: { name: string; type: string }[];
    rows: ResultModelRow[];
  };
  tabs: null;
};

export type ResultReportData = {
  meta: null;
  tabs: Tab[];
};

type ResultType = 'table' | 'model' | 'report' | 'rule';

type ResultTypeMap = Record<'table', ResultTableData> &
  Record<'model', ResultModelData> &
  Record<'rule', ResultRuleData> &
  Record<'report', ResultReportData>;

export type OutputType<T extends ResultType> = {
  codeName: string;
  gmtCreate: string;
  gmtModified: string;
  jobId: string;
  taskId: string;
  type: T;
} & ResultTypeMap[T];

export type DataType = {
  field: string;
  fieldType: string;
  nodeId: string;
};
