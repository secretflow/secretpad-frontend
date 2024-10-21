import { Button, Tooltip } from 'antd';
import { parse } from 'query-string';
import { useEffect } from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { PeriodicTaskCreateDrawer } from '@/modules/periodic-task/periodic-task-drawer/create-periodic-task.view';
import { onceSuccess } from '@/services/secretpad/ScheduledController';
import { Model, useModel } from '@/util/valtio-helper';

import mainDag from './dag';
import type { IGraphNodeType } from './graph.protocol';
import styles from './index.less';

export const PeriodicTaskEntry = () => {
  const viewInstance = useModel(PeriodicTaskEntryView);
  const modalManager = useModel(DefaultModalManager);

  const { disabled } = viewInstance;

  const { search } = window.location;
  const { projectId, dagId } = parse(search);

  const { finished } = viewInstance.statusObj;

  useEffect(() => {
    if (!projectId || !dagId) return;
    viewInstance.getGraphHistoryReady(projectId as string, dagId as string);
    return () => {
      clearTimeout(viewInstance.graphHistoryReadyTimer);
    };
  }, [dagId, finished]);

  const handleClick = () => {
    modalManager.openModal(PeriodicTaskCreateDrawer.id, viewInstance.nodes);
  };

  return (
    <div className={`${styles.toolbar} toolbar2-for-guide-tour`}>
      <Tooltip title={disabled ? '画布组件需成功跑通至少一次才可部署' : ''}>
        <Button size="small" disabled={disabled} onClick={handleClick}>
          部署周期任务
        </Button>
      </Tooltip>
    </div>
  );
};

export class PeriodicTaskEntryView extends Model {
  constructor() {
    super();
    mainDag.requestService.onNodeStatusChanged(this.onNodeStatusChanged.bind(this));
    mainDag.requestService.onNodeChanged(this.onNodeChanged.bind(this));
  }

  disabled = true;

  nodes: IGraphNodeType[] = [];

  statusObj: API.GraphStatus = { nodes: [], finished: true };

  graphHistoryReadyTimer: ReturnType<typeof setTimeout> | undefined;

  onNodeStatusChanged = (statusObj: API.GraphStatus) => {
    this.statusObj = statusObj;
  };

  onNodeChanged = (data: IGraphNodeType[]) => {
    this.nodes = data;
  };

  getGraphHistoryReady = async (projectId: string, dagId: string) => {
    const { data, status } = await onceSuccess({
      projectId: projectId,
      graphId: dagId,
    });
    if (status && status.code === 0) {
      if (data) {
        this.disabled = false;
      } else {
        this.disabled = true;
        if (!this.statusObj.finished) {
          clearTimeout(this.graphHistoryReadyTimer);
          this.graphHistoryReadyTimer = setTimeout(() => {
            this.getGraphHistoryReady(projectId, dagId);
          }, 5000);
        } else {
          clearTimeout(this.graphHistoryReadyTimer);
        }
      }
    }
  };
}
