import { message } from 'antd';

import { id, create } from '@/services/secretpad/ScheduledController';
import { Model } from '@/util/valtio-helper';

export enum CycleTaskType {
  Week = 'W',
  Day = 'D',
  Month = 'M',
}

/** 自然周从周日开始，1为周日 */
export const weekMapping = {
  '1': '周一',
  '2': '周二',
  '3': '周三',
  '4': '周四',
  '5': '周五',
  '6': '周六',
  '7': '周日',
};

export const monthMapping: Record<string, string> = {
  '-1': '最后一天',
};
for (let i = 1; i < 32; i++) {
  monthMapping[String(i)] = String(i);
}

export class PeriodicTaskCreateServive extends Model {
  loading = false;

  scheduledId = '';

  getScheduledId = async (projectId: string, graphId: string) => {
    const { status, data } = await id({
      graphId,
      projectId,
    });
    if (status && status.code === 0) {
      this.scheduledId = data || '';
    } else {
      this.scheduledId = '';
      message.error(status?.msg);
    }
  };

  createScheduled = async (value: API.ScheduledGraphCreateRequest) => {
    return await create(value);
  };
}
