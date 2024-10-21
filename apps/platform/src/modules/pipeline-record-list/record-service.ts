import { Emitter } from '@secretflow/utils';
import { history } from 'umi';

import { PeriodicDetailType } from '@/modules/periodic-task/type';
import { listJob } from '@/services/secretpad/ProjectController';
import { listJob as periodicTasklistJob } from '@/services/secretpad/ScheduledController';
import { Model } from '@/util/valtio-helper';

import type {
  ExecutionRecord,
  ExecutionRecordData,
  ResultType,
} from './record-protocol';

export class DefaultRecordService extends Model {
  recordList: ExecutionRecord = {} as ExecutionRecord;
  resultTypeSelected: ResultType | undefined;
  currentRecord: ExecutionRecordData | undefined;

  recordDrawer = false;

  onResultTypeResetEmitter = new Emitter<undefined | ResultType>();
  onResultTypeReset = this.onResultTypeResetEmitter.on;

  onRecordListUpdatedEmitter = new Emitter<void>();
  onRecordListUpdated = this.onRecordListUpdatedEmitter.on;

  getRecordList = async (
    projectId: string,
    pipelineId?: string,
    pageSize?: number,
    pageNum?: number,
  ) => {
    const { periodicType, scheduleTaskId } = (history.location.state || {}) as {
      periodicType: string;
      scheduleTaskId: string;
    };
    // 周期子任务的详情需要调用不同的接口
    const queryListJob =
      periodicType === PeriodicDetailType.CHILDTASK ? periodicTasklistJob : listJob;
    const params: API.ScheduleListProjectJobRequest = {
      projectId,
      graphId: pipelineId,
      pageNum,
      pageSize,
    };
    if (periodicType === PeriodicDetailType.CHILDTASK) {
      params.scheduleTaskId = scheduleTaskId;
    }
    const { data } = await queryListJob(params);

    this.recordList = data as ExecutionRecord;
    this.onRecordListUpdatedEmitter.fire();
    return this.recordList;
  };

  deleteRecords = async () => {
    return Promise.resolve();
  };

  getRecord = async (id: string) => {
    const { data } = this.recordList;
    if (!data?.length) return;
    const res = data.find(({ jobId }) => jobId === id);
    if (res) this.currentRecord = res;
    return res;
  };

  setCurrentRecordGraph = (graph: { edges: any[]; nodes: any[] }) => {
    if (this.currentRecord) {
      this.currentRecord.graph = graph;
    }
  };

  filterGraphNodeByType() {
    const type = this.resultTypeSelected;
    const { nodes } = this.currentRecord?.graph || {};
    if (!nodes) return [];
    if (!type) return [];

    return nodes.filter((node) => {
      const { results } = node;
      if (!results) return true;
      const resultTypes = results.map(({ kind }: any) => kind);
      return resultTypes.indexOf(type) < 0;
    });
  }

  setResultType = (type?: ResultType) => {
    if (type === this.resultTypeSelected) return;
    this.resultTypeSelected = type;
    this.onResultTypeResetEmitter.fire(type);
  };

  changeRecordDrawer = (open: boolean) => {
    this.recordDrawer = open;
  };
}
