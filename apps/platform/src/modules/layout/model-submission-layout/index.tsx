import { ArrowLeftOutlined } from '@ant-design/icons';
import { Divider, Button, Alert, Tooltip } from 'antd';
import classNames from 'classnames';
import { history } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { Log } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
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
import { LoginService } from '@/modules/login/login.service';
import { Model, useModel, getModel } from '@/util/valtio-helper';

import styles from './index.less';

const RIGHT_DIST = 20;

export const ModelSubmissionLayout = () => {
  const viewInstance = useModel(ModelSubmissionView);
  const loginService = useModel(LoginService);

  const goBack = async () => {
    viewInstance.submissionDrawerService.cancelSubmitTimer();
    const userInfo = await loginService.getUserInfo();
    if (userInfo.platformType === Platform.AUTONOMY) {
      history.push(`/edge?nodeId=${userInfo.ownerId}`);
    } else {
      history.push('/home?tab=project-management');
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.back} onClick={goBack}>
          <Tooltip title="退出模型提交则会中断提交进程，如需提交需重新发起">
            <ArrowLeftOutlined />
          </Tooltip>
        </span>
        <Divider type="vertical" />
        <span className={styles.title}>项目空间</span>
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
                <Button
                  type="link"
                  onClick={() => {
                    viewInstance.submissionDrawerService.cancelSubmitTimer();
                    history.push({
                      pathname: '/dag',
                      search: window.location.search,
                    });
                  }}
                >
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
        <DagLog>
          <Log />
        </DagLog>
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
