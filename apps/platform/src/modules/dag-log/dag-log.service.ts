import type { GraphNode } from '@secretflow/dag';

import {
  DefaultModalManager,
  ModalsEnum,
  ModalsWidth,
} from '@/modules/dag-modal-manager';
import { getGraphNodeLogs } from '@/services/secretpad/GraphController';
import { getJobLog } from '@/services/secretpad/ProjectController';
import { Model, getModel } from '@/util/valtio-helper';

const MINHEIGHT = 32;
const MAXHEIGHT = 432;

type DagCustomStatus = 'OTHER' | 'STAGING';

export const StatusMap: Record<API.GraphNodeTaskStatus | DagCustomStatus, string> = {
  SUCCEED: 'success',
  RUNNING: 'running',
  FAILED: 'failed',
  STOPPED: 'stopped',
  INITIALIZED: 'pending',
  STAGING: 'default',
  OTHER: 'other',
};

export const LogTextMap = {
  [StatusMap.SUCCEED]: {
    color: 'success',
    text: '成功',
  },
  [StatusMap.FAILED]: {
    color: 'error',
    text: '失败',
  },
  [StatusMap.STOPPED]: {
    color: 'error',
    text: '已停止',
  },
  [StatusMap.RUNNING]: {
    color: 'geekblue',
    text: '运行中',
  },
  [StatusMap.OTHER]: {
    color: 'geekblue',
    text: '部分成功',
  },
  [StatusMap.STAGING]: {
    color: 'geekblue',
    text: '部分成功',
  },
};

export interface LogParam {
  nodeData: GraphNode;
  from: 'record' | 'pipeline';
  nodeParties?: { nodeName: string; nodeId: string }[];
}

export type StatusType = 'success' | 'running' | 'failed' | 'other';

export class DagLogService extends Model {
  logMainHeight = MINHEIGHT;

  sliderHeight = MINHEIGHT;

  unfold = true;

  logContent = '';

  logMarginLeft = 0;

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

  LogRightAllConfigWidth: Record<string, number> = {};

  timer = 0;

  modalManager = getModel(DefaultModalManager);

  constructor() {
    super();
    this.modalManager.onModalsChanged((modals: any) => {
      if (
        modals[ModalsEnum.ComponentConfigDrawer].visible &&
        modals[ModalsEnum.RecordListDrawer]?.visible
      ) {
        return this.setLogRightAllConfigWidth({
          componentConfigWidth:
            ModalsWidth[ModalsEnum.ComponentConfigDrawer] +
            ModalsWidth[ModalsEnum.RecordListDrawer],
        });
      }
      if (modals[ModalsEnum.ResultDrawer].visible) {
        return this.setLogRightAllConfigWidth({
          componentResultWidth: ModalsWidth[ModalsEnum.ResultDrawer],
        });
      }
      if (modals[ModalsEnum.RecordListDrawer]?.visible) {
        return this.setLogRightAllConfigWidth({
          componentResultWidth: ModalsWidth[ModalsEnum.RecordListDrawer],
        });
      }

      if (modals[ModalsEnum.ComponentConfigDrawer].visible) {
        return this.setLogRightAllConfigWidth({
          componentConfigWidth: ModalsWidth[ModalsEnum.ComponentConfigDrawer],
        });
      }

      if (modals[ModalsEnum.ModelSubmissionDrawer].visible) {
        return this.setLogRightAllConfigWidth({
          componentConfigWidth: ModalsWidth[ModalsEnum.ModelSubmissionDrawer],
        });
      }

      if (
        !modals[ModalsEnum.ComponentConfigDrawer].visible &&
        !modals[ModalsEnum.ResultDrawer].visible &&
        !modals[ModalsEnum.RecordListDrawer]?.visible
      ) {
        return this.setLogRightAllConfigWidth({ componentConfigWidth: 0 });
      }
    });
  }

  setLogRightAllConfigWidth = (config: { [key: string]: number }) => {
    this.LogRightAllConfigWidth = {
      // ...this.LogRightAllConfigWidth,
      ...config,
    };
    this.logMarginLeft = Object.values(this.LogRightAllConfigWidth)[0];
  };

  setLogMainHeight = (val: number) => {
    this.logMainHeight = val;
  };

  setSliderHight = (val: number) => {
    this.sliderHeight = val;
  };

  setUnfold = (val: boolean) => {
    this.unfold = val;
  };

  setLogMainMax = () => {
    this.setUnfold(false);
    this.logMainHeight = MAXHEIGHT;
    this.sliderHeight = MAXHEIGHT;
  };

  setLogMainMin = () => {
    this.setUnfold(true);
    this.logMainHeight = MINHEIGHT;
    this.sliderHeight = MINHEIGHT;
  };

  clearLogContent = () => {
    this.logContent = '';
  };

  formatLog = (logString: string) => {
    return logString.split('\\n').join('\n');
  };

  getLogContent = async (
    data: GraphNode,
    projectId: string,
    graphId: string,
    from: 'record' | 'pipeline',
  ) => {
    const { label, id } = data;
    let logResponse = {
      data: { logs: [] },
    } as API.SecretPadResponse_GraphNodeTaskLogsVO_;

    if (from === 'pipeline') {
      logResponse = await getGraphNodeLogs({
        projectId,
        graphId,
        graphNodeId: id,
      });
    } else if (from === 'record') {
      logResponse = await getJobLog({
        projectId,
        jobId: graphId,
        taskId: id,
      });
    }

    const logData = logResponse.data || { logs: [] };
    this.logContent = `${logData.logs?.map((log) => this.formatLog(log)).join('\n')}`;
    const status = logData.status ? StatusMap[logData.status] : 'default';
    // TODO: request
    this.logTipContent = {
      status,
      name: label,
      // current: 2,
      // total: 12,
    };
    // TODO: running 轮询

    if (status === 'running' || status === 'pending') {
      // clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.getLogContent(data, projectId, graphId, from);
      }, 2000);
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
}
