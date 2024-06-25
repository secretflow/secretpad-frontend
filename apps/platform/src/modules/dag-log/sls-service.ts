import type { GraphNode } from '@secretflow/dag';
import { parse } from 'query-string';

import { PadMode } from '@/components/platform-wrapper';
import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

import { StatusMap } from './dag-log.service';

export class SlsService extends Model {
  // 获取当前算子的参与方列表
  nodePartiesList: {
    nodeName: string;
    nodeId: string;
  }[] = [];
  // 保存 sls log 请求参数
  slsRequestParams:
    | {
        data: GraphNode;
        projectId: string;
        graphId: string;
        from: 'record' | 'pipeline';
      }
    | undefined = undefined;
  // 当前算子的参与方ID
  currentNodePartiesId: string | undefined = undefined;

  slsLogIsConfig = false;

  timer = 0;

  slsLogContent = '';

  logTipContent: {
    status: string; //StatusType;
    current?: number;
    total?: number;
    name?: string;
  } = {
    status: 'running',
    current: 2,
    total: 12,
    name: '读虚拟宽表',
  };

  constructor() {
    super();
    this.getSlsLogIsConfig();
  }

  formatLog = (logString: string) => {
    return logString.split('\\n').join('\n');
  };

  getSlsLogContent = async (
    data: GraphNode,
    projectId: string,
    graphId: string,
    from: 'record' | 'pipeline',
    currentNodePartiesId: string | undefined,
  ) => {
    const { search } = window.location;
    const { mode } = parse(search);
    if (mode === PadMode.TEE) return;
    if (!this.slsLogIsConfig) return;
    if (!currentNodePartiesId) return;
    const { label, id } = data;
    let logResponse = {
      data: { logs: [] },
    } as API.SecretPadResponse_GraphNodeTaskLogsVO_;

    if (from === 'pipeline') {
      logResponse = await API.CloudLogController.getCloudLog({
        projectId,
        graphId,
        graphNodeId: id,
        nodeId: currentNodePartiesId,
      });
    } else if (from === 'record') {
      logResponse = await API.CloudLogController.getCloudLog({
        projectId,
        jobId: graphId,
        taskId: id,
        nodeId: currentNodePartiesId,
      });
    }

    const logData = logResponse.data || { logs: [] };
    if (logData.config === false) {
      this.cancel();
      return;
    }
    this.slsLogContent =
      `${(logData.logs || [])?.map((log) => this.formatLog(log)).join('\n')}` || '';
    const status = logData.status ? StatusMap[logData.status] : 'default';

    this.logTipContent = {
      status,
      name: label,
      // current: 2,
      // total: 12,
    };
    if (status === 'running' || status === 'pending') {
      this.timer = window.setTimeout(() => {
        this.getSlsLogContent(data, projectId, graphId, from, currentNodePartiesId);
      }, 5000);
    } else {
      this.cancel();
    }
  };

  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  getSlsLogIsConfig = async () => {
    const { search } = window.location;
    const { projectId } = parse(search);
    const { status, data } = await API.CloudLogController.getCloudLog({
      projectId: projectId as string,
    });
    if (status && status.code === 0) {
      this.slsLogIsConfig = !!data?.config;
    }
  };

  // 获取参与方某一方的SLS Log
  getNodeSlsLogContent = async (value: string) => {
    if (!this.slsRequestParams) return;
    const { data, projectId, graphId, from } = this.slsRequestParams;
    this.getSlsLogContent(data, projectId, graphId, from, value);
  };
}
