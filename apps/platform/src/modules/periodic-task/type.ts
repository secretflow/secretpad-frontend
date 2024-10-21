export enum PeriodicDetailType {
  /** 周期任务 */
  TASK = 'periodicTask',
  /** 周期子任务 */
  CHILDTASK = 'periodicTaskChild',
}

export interface PeriodicTaskInfo extends API.PageScheduledVO {
  showOptions?: boolean;
}
