import { ArrowLeftOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { history } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { ComponentConfigDrawer } from '@/modules/component-config/config-modal';
import { Log } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { RecordGraphComponent } from '@/modules/dag-record/graph';
import { PipelineTitleComponent } from '@/modules/dag-record/pipeline-title-view';
import { RecordResultComponent } from '@/modules/dag-record/record-result-view';
import { RecordGuideTourComponent } from '@/modules/dag-record-guide-tour/record-guide-tour.view';
import { ResultDrawer } from '@/modules/dag-result/result-modal';
import { LoginService } from '@/modules/login/login.service';
import { RecordComponent } from '@/modules/main-dag/record';
import { Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';

export enum RecordArea {
  header = 'record-header',
  title = 'record-title',
  result = 'result',
  graph = 'graph',
  toolbutton = 'toolbutton',
  recordArea = 'record-area',
  tour = 'tour',
}

export const RecordLayout = () => {
  const loginService = useModel(LoginService);

  const goBack = async () => {
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
          <ArrowLeftOutlined />
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
            </div>
            <div className={styles.middle}>
              <RecordResultComponent />
            </div>
            <div
              className={styles.right}
              // style={{ paddingLeft: viewInstance.rightModalWidth }}
            >
              <RecordComponent />
            </div>
          </div>
          <div className={styles.graph}>
            <RecordGraphComponent />
          </div>
        </div>
      </div>
      <ResultDrawer />
      <ComponentConfigDrawer />
      <DagLogDrawer>
        <DagLog>
          <Log />
        </DagLog>
      </DagLogDrawer>
      <RecordGuideTourComponent />
    </div>
  );
};

export class RecordLayoutView extends Model {
  rightModalWidth = 320 - 42;
}
