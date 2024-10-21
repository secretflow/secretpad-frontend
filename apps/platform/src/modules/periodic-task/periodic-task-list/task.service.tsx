import { message } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
import { parse } from 'query-string';
import type { ChangeEvent } from 'react';

import { page, offline, del, info } from '@/services/secretpad/ScheduledController';
import { Model } from '@/util/valtio-helper';

export enum TaskStatus {
  ALL = '',
  UP = 'UP',
  DOWN = 'DOWN',
}

export const taskStatusText = {
  [TaskStatus.ALL]: {
    label: '全部状态',
    iconColor: 'green',
    value: '',
  },
  [TaskStatus.UP]: {
    label: '生效中',
    iconColor: 'green',
    value: 'success',
  },
  [TaskStatus.DOWN]: {
    label: '已下线',
    iconColor: 'gray',
    value: 'offline',
  },
};

export class PeriodicTaskListService extends Model {
  periodicTaskList: API.PageScheduledVO[] = [];

  periodicJobId = '';

  loading = false;

  search = '';

  taskStats = '';

  sortRule = {};

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  searchDebounce: number | undefined = undefined;

  onViewUnMount() {
    this.search = '';
  }

  /** 搜索周期任务 */
  searchTask = (e: ChangeEvent<HTMLInputElement>) => {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getPeriodicTaskList();
    }, 300) as unknown as number;
  };

  /** 部署时间排序 */
  deployTimeFilter = (
    _: Record<string, FilterValue | null>,
    sort: { order: string; field: string },
  ) => {
    if (sort?.order) {
      this.sortRule = {
        [sort.field]: sort.order === 'ascend' ? 'ASC' : 'DESC',
      };
    } else {
      this.sortRule = {};
    }
    this.getPeriodicTaskList();
  };

  /** 模型状态过滤 */
  taskStatusFilter = (value: string) => {
    this.taskStats = value;
    this.getPeriodicTaskList();
  };

  /** 获取周期任务列表 */
  getPeriodicTaskList = async () => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return [];
    this.loading = true;
    const list = await page({
      projectId: projectId as string,
      status: this.taskStats,
      search: this.search,
      page: this.pageNumber,
      size: this.pageSize,
      sort: this.sortRule,
    });
    this.loading = false;
    if (list.status && list.status.code === 0 && list.data) {
      this.periodicTaskList = list.data.list || [];
      this.totalNum = list?.data?.total || 0;
    }
    return this.periodicTaskList;
  };

  /** 下线周期任务 */
  offlineTask = async (scheduleId: string) => {
    const { status } = await offline({
      scheduleId,
    });
    if (status && status.code === 0) {
      message.success('周期任务下线成功');
    } else {
      message.error(status?.msg);
    }
  };

  /** 删除周期任务 */
  deleteTask = async (scheduleId: string) => {
    const { status } = await del({
      scheduleId,
    });
    if (status && status.code === 0) {
      message.success('周期任务删除成功');
    } else {
      message.error(status?.msg);
    }
  };

  /** 获取jobId */
  getJobId = async (scheduleId: string) => {
    return await info({
      scheduleId,
    });
  };
}
