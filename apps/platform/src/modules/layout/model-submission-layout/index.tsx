import { ArrowLeftOutlined } from '@ant-design/icons';
import { Divider, Button, Alert, Tooltip, Breadcrumb, Popconfirm } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { history } from 'umi';

import { PadMode } from '@/components/platform-wrapper';
import { Log, LogLabel } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { SlsLog, SlsLogLabel } from '@/modules/dag-log/sls-log-viewer.view';
import { SlsService } from '@/modules/dag-log/sls-service';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { ModalWidth } from '@/modules/dag-modal-manager/modal-manger-protocol';
import {
  PipelineTitleComponent,
  SubmissionDrawer,
} from '@/modules/dag-model-submission';
import { ModelSubmissionDrawerItem } from '@/modules/dag-model-submission/submission-drawer';
import { SubmissionDrawerService } from '@/modules/dag-model-submission/submission-service';
import { SubmitGraphComponent } from '@/modules/dag-submit/graph';
import { ToolbuttonComponent } from '@/modules/dag-submit/toolbutton';
import { Model, useModel, getModel } from '@/util/valtio-helper';

import styles from './index.less';

const RIGHT_DIST = 20;

export const ModelSubmissionLayout = () => {
  const viewInstance = useModel(ModelSubmissionView);
  const slsLogService = useModel(SlsService);

  const goBack = async () => {
    viewInstance.submissionDrawerService.cancelSubmitTimer();
    history.push({
      pathname: '/dag',
      search: window.location.search,
    });
  };

  const searchDagParams = window.location.search;
  const { mode } = parse(searchDagParams);

  const logItems = [
    {
      key: '1',
      label: <LogLabel />,
      children: <Log />,
      disabled: false,
    },
  ];

  if (mode === PadMode.MPC) {
    logItems.push({
      key: '2',
      label: <SlsLogLabel />,
      disabled: !slsLogService.slsLogIsConfig,
      children: <SlsLog />,
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Popconfirm
          placement="right"
          title="退出模型提交则会中断提交进程"
          description="如需提交需重新发起"
          okText="确认"
          cancelText="取消"
          onConfirm={goBack}
        >
          <span className={styles.back}>
            <ArrowLeftOutlined />
          </span>
        </Popconfirm>
        <Divider type="vertical" />
        <Breadcrumb
          items={[
            {
              title: '项目空间',
            },
            {
              title: '模型提交',
            },
          ]}
        />
        <span className={styles.slot}></span>
      </div>
      <div className={styles.content}>
        <div className={styles.center}>
          <div className={styles.header}>
            <div className={styles.left}>
              <PipelineTitleComponent />
              <Alert
                className={styles.alert}
                message={
                  <>
                    点击画布中的<b>模型组件</b>可提交模型，再次点击<b>模型组件</b>
                    后取消选择
                  </>
                }
                closable
                type="info"
                showIcon
              />
            </div>
            <div className={styles.right}>
              <Tooltip title="退出模型提交则会中断提交进程，如需提交需重新发起">
                <Button type="link" onClick={goBack}>
                  退出模型提交
                </Button>
              </Tooltip>
            </div>
          </div>
          <div
            className={classNames(styles.graph, {
              [styles.graphContent]: viewInstance.rightModalVisible,
            })}
          >
            <SubmitGraphComponent />
          </div>
          <div
            className={styles.toolbutton}
            style={{ right: viewInstance.rightModalSize }}
          >
            <ToolbuttonComponent />
          </div>
        </div>
      </div>
      <SubmissionDrawer />
      <DagLogDrawer>
        <DagLog items={logItems} />
      </DagLogDrawer>
    </div>
  );
};

export class ModelSubmissionView extends Model {
  modalManager = getModel(DefaultModalManager);
  submissionDrawerService = getModel(SubmissionDrawerService);

  constructor() {
    super();
    this.modalManager.onModalsChanged(() => {
      const status = this.modalManager.modals;
      if (status[ModelSubmissionDrawerItem.id].visible) {
        return (this.rightModalSize =
          RIGHT_DIST + ModalWidth[ModelSubmissionDrawerItem.id]);
      }
      if (!status[ModelSubmissionDrawerItem.id].visible) {
        return (this.rightModalSize = RIGHT_DIST);
      }
    });
  }

  rightModalWidth = 320 - 42;
  rightModalVisible = false;

  rightModalSize = RIGHT_DIST;

  openSubmissionDrawer = () => {
    this.rightModalVisible = true;
    this.modalManager.openModal(ModelSubmissionDrawerItem.id);
  };

  closeSubmissionDrawer() {
    this.modalManager.closeModal(ModelSubmissionDrawerItem.id);
    this.rightModalVisible = false;
  }
}
