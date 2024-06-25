import { ArrowLeftOutlined } from '@ant-design/icons';
import { Breadcrumb, Divider } from 'antd';
import { parse, stringify } from 'query-string';
import { history } from 'umi';

import { PadMode, Platform, hasAccess } from '@/components/platform-wrapper';
import { ComponentConfigDrawer } from '@/modules/component-config/config-modal';
import { Log, LogLabel } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { SlsLog, SlsLogLabel } from '@/modules/dag-log/sls-log-viewer.view';
import { SlsService } from '@/modules/dag-log/sls-service';
import { RecordGraphComponent } from '@/modules/dag-record/graph';
import { PipelineTitleComponent } from '@/modules/dag-record/pipeline-title-view';
import { RecordResultComponent } from '@/modules/dag-record/record-result-view';
import { RecordGuideTourComponent } from '@/modules/dag-record-guide-tour/record-guide-tour.view';
import { ResultDrawer } from '@/modules/dag-result/result-modal';
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
  const slsLogService = useModel(SlsService);
  const searchDagParams = window.location.search;
  const { projectId, mode, type } = parse(searchDagParams);
  const goBack = async () => {
    const { pipelineName, pipelineId, origin } = (history.location.state || {}) as {
      pipelineId: string;
      pipelineName: string;
      origin: string;
    };
    if (!pipelineId || !projectId) return;
    const searchParams = {
      dagId: pipelineId,
      projectId,
      mode,
      type: hasAccess({ type: [Platform.AUTONOMY] }) ? type : undefined,
    };
    history.push(
      {
        pathname: '/dag',
        search: stringify(searchParams),
      },
      {
        pipelineName,
        pipelineId,
        origin,
      },
    );
  };

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
        <span className={styles.back} onClick={goBack}>
          <ArrowLeftOutlined />
        </span>
        <Divider type="vertical" />
        <Breadcrumb
          items={[
            {
              title: '项目空间',
            },
            {
              title: '记录与结果',
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
        <DagLog items={logItems} />
      </DagLogDrawer>
      <RecordGuideTourComponent />
    </div>
  );
};

export class RecordLayoutView extends Model {
  rightModalWidth = 320 - 42;
}
