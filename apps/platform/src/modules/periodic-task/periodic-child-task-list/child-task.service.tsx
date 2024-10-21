import { message } from 'antd';
import dayjs from 'dayjs';

import {
  taskPage,
  taskStop,
  taskRerun,
  taskInfo,
} from '@/services/secretpad/ScheduledController';
import { Model } from '@/util/valtio-helper';

export enum TaskStatus {
  SUCCESS = 'SUCCEED',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  COMMITTED = 'TO_BE_RUN',
  STOPPED = 'STOPPED',
  STOPPING = 'STOPPING',
}

export const TaskStatusText = {
  [TaskStatus.SUCCESS]: {
    label: '成功',
    iconColor: 'success',
    value: 'success',
  },
  [TaskStatus.FAILED]: {
    label: '失败',
    iconColor: 'error',
    value: 'error',
  },
  [TaskStatus.RUNNING]: {
    label: '执行中',
    iconColor: 'processing',
    value: 'doing',
  },
  [TaskStatus.COMMITTED]: {
    label: '待运行',
    iconColor: 'warning',
    value: 'warning',
  },
  [TaskStatus.STOPPED]: {
    label: '已停止',
    iconColor: 'error',
    value: 'error',
  },
  [TaskStatus.STOPPING]: {
    label: '停止中',
    iconColor: 'processing',
    value: 'doing',
  },
};

export class PeriodicChildTaskService extends Model {
  periodicChildTaskTimer: ReturnType<typeof setTimeout> | undefined;

  periodicTaskChildList: API.TaskPageScheduledVO[] = [];

  loading = false;

  reRunLoading = false;

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  onViewUnMount(): void {
    this.periodicChildTaskTimer && clearTimeout(this.periodicChildTaskTimer);
  }

  getPeriodicTaskChildList = async (
    scheduleId?: string,
    options?: { isRefresh: boolean },
  ) => {
    if (!scheduleId) return;
    const { isRefresh = false } = options || {};
    this.loading = true;
    const params: API.TaskPageScheduledRequest = {
      scheduleId,
      size: isRefresh ? 10 : this.pageSize,
      page: isRefresh ? 1 : this.pageNumber,
      sort: {
        scheduleTaskExpectStartTime: 'ASC',
      },
      search: '',
    };
    const { data, status } = await taskPage(params);
    this.loading = false;
    if (status && status.code === 0 && data) {
      this.totalNum = data?.total || 0;
      this.periodicTaskChildList = data?.list || [];
      const flag = this.periodicTaskChildList.some(
        (item) =>
          item.scheduleTaskStatus === TaskStatus.RUNNING ||
          item.scheduleTaskStatus === TaskStatus.COMMITTED ||
          item.scheduleTaskStatus === TaskStatus.STOPPING,
      );
      if (flag) {
        clearTimeout(this.periodicChildTaskTimer);
        this.periodicChildTaskTimer = setTimeout(() => {
          this.getPeriodicTaskChildList(scheduleId);
        }, 10000);
      } else {
        clearTimeout(this.periodicChildTaskTimer);
      }
    }
  };

  /** 重跑子任务 */
  reRunTask = async (scheduleId?: string, scheduleTaskId?: string, type?: number) => {
    if (!scheduleId || !scheduleTaskId || type === undefined) return;
    this.reRunLoading = true;
    const { status } = await taskRerun({
      scheduleId,
      scheduleTaskId,
      type,
    });
    this.reRunLoading = false;
    if (status && status.code === 0) {
      message.success('任务重跑成功');
    } else {
      message.error(status?.msg);
    }
  };

  /** 停止子任务 */
  stopChildTask = async (scheduleId?: string, scheduleTaskId?: string) => {
    if (!scheduleId || !scheduleTaskId) return;
    const { status } = await taskStop({
      scheduleId,
      scheduleTaskId,
    });
    if (status && status.code === 0) {
      message.success('任务停止成功');
    } else {
      message.error(status?.msg);
    }
  };

  /** 获取jobId */
  getJobId = async (scheduleId: string, scheduleTaskId: string) => {
    return await taskInfo({
      scheduleId,
      scheduleTaskId,
    });
  };
}

export const renderOptionsTitle = (record: API.TaskPageScheduledVO) => {
  //  运行失败且没有超过30天，则可以重跑失败, 否则需要重跑(全部重跑)
  const overThirtyTime =
    dayjs().diff(dayjs(record.scheduleTaskStartTime), 'day', true) > 30;
  let title = '';
  if (
    (record.scheduleTaskStatus === TaskStatus.FAILED ||
      record.scheduleTaskStatus === TaskStatus.STOPPED) &&
    overThirtyTime
  ) {
    title = '如存在部分成功执行结果，重跑后会覆盖已产出的结果';
  } else if (
    (record.scheduleTaskStatus === TaskStatus.FAILED ||
      record.scheduleTaskStatus === TaskStatus.STOPPED) &&
    !overThirtyTime
  ) {
    title = '可选重跑或重跑失败部分，重跑后会覆盖该任务产出的结果。';
  } else if (record.scheduleTaskStatus === TaskStatus.SUCCESS) {
    title = '重跑后会覆盖已产出的结果，确定要重跑吗？';
  } else {
    title = '';
  }
  return {
    title,
    overThirtyTime,
  };
};
