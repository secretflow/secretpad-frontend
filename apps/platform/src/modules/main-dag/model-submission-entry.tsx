import { Button, Tooltip } from 'antd';
import { useEffect } from 'react';
import { history } from 'umi';

import { Model, useModel } from '@/util/valtio-helper';

import mainDag from './dag';
import type { IGraphNodeType } from './graph.protocol';
import styles from './index.less';
import { Platform, hasAccess } from '@/components/platform-wrapper';
import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';

export const ModelSubmissionEntry = () => {
  const viewInstance = useModel(ModelSubmissionEntryView);
  const projectEditService = useModel(ProjectEditService);

  const { disabled } = viewInstance;

  useEffect(() => {
    const { nodes = [] } = viewInstance.statusObj;
    const modelNodes = (viewInstance.nodes || []).filter(
      (item) => item.nodeDef.domain === 'ml.train',
    );
    viewInstance.disabled = !modelNodes.some(
      (modelNode) =>
        nodes.find((n) => n.graphNodeId === modelNode.id)?.status === 'SUCCEED',
    );
  }, [viewInstance.nodes, viewInstance.statusObj]);

  const isP2P = hasAccess({ type: [Platform.AUTONOMY] });

  return (
    <div className={`${styles.toolbar} toolbar2-for-guide-tour`}>
      <Tooltip title={disabled ? '暂无可提交模型' : ''}>
        <Button
          size="small"
          disabled={
            isP2P
              ? disabled || projectEditService.canEdit.submitModelDisabled
              : disabled
          }
          onClick={() => {
            const { pipelineName } = (history.location.state || {}) as {
              pipelineName: string;
            };
            history.push(
              {
                pathname: '/model-submission',
                search: window.location.search,
              },
              { pipelineName },
            );
          }}
        >
          提交模型
        </Button>
      </Tooltip>
    </div>
  );
};

export class ModelSubmissionEntryView extends Model {
  constructor() {
    super();
    mainDag.requestService.onNodeStatusChanged(this.onNodeStatusChanged.bind(this));
    mainDag.requestService.onNodeChanged(this.onNodeChanged.bind(this));
  }

  disabled = true;

  nodes: IGraphNodeType[] = [];

  statusObj: API.GraphStatus = { nodes: [], finished: true };

  onNodeStatusChanged = (statusObj: API.GraphStatus) => {
    this.statusObj = statusObj;
  };

  onNodeChanged = (data: IGraphNodeType[]) => {
    this.nodes = data;
  };
}
