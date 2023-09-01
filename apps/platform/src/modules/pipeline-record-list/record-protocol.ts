type ExecutionRecordStatus = API.GraphNodeTaskStatus;

export interface ExecutionRecord {
  data: ExecutionRecordData[];
  pageSize: number;
  pageTotal: number;
}

export interface ExecutionRecordData {
  jobId: string;
  status: ExecutionRecordStatus;
  errMsg: string;
  gmtCreate: string;
  gmtModified: string;
  tableCount: number;
  modelCount: number;
  ruleCount: number;
  reportCount: number;
  gmtFinished: 'string';
  finishedTaskCount: number;
  taskCount: number;
  graph?: { nodes: any[]; edges: any[] };
}

export enum ResultType {
  MODEL = 'Model',
  RULE = 'Rule',
  TABLE = 'FedTable',
  REPORT = 'Report',
}

export const RecordService = Symbol('RecordService');
