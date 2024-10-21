import { ArrowLeftOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Breadcrumb, Divider } from 'antd';
import { parse, stringify } from 'query-string';
import { useEffect } from 'react';
import { history } from 'umi';

import { PadMode } from '@/components/platform-wrapper';
import { ComponentConfigDrawer } from '@/modules/component-config/config-modal';
import { Log, LogLabel } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { SlsLog, SlsLogLabel } from '@/modules/dag-log/sls-log-viewer.view';
import { SlsService } from '@/modules/dag-log/sls-service';
import { RecordGraphComponent } from '@/modules/dag-record/graph';
import { RecordResultComponent } from '@/modules/dag-record/record-result-view';
import { ResultDrawer } from '@/modules/dag-result/result-modal';
import { PeriodicDetailType } from '@/modules/periodic-task/type';
import { DefaultRecordService } from '@/modules/pipeline-record-list/record-service';
import { useModel } from '@/util/valtio-helper';

import { DagLayoutMenu, DagLayoutView } from '../dag-layout';

import styles from './index.less';

export const PeriodicTaskDetailLayout = () => {
  const slsLogService = useModel(SlsService);
  const dagLayoutView = useModel(DagLayoutView);
  const recordService = useModel(DefaultRecordService);

  const searchDagParams = window.location.search;
  const { projectId, mode, type } = parse(searchDagParams);
  const { periodicType, scheduleId, scheduleTaskId, historyDagId, periodicGraphId } =
    (history.location.state || {}) as {
      periodicType: string;
      scheduleId: string;
      scheduleTaskId: string;
      historyDagId: string;
      periodicGraphId: string;
    };

  const goBack = async () => {
    if (!projectId) return;
    const searchParams = {
      dagId: historyDagId,
      projectId,
      mode,
      type,
    };
    history.push({
      pathname: '/dag',
      search: stringify(searchParams),
    });
    dagLayoutView.setInitActiveMenu(DagLayoutMenu.PERIODICTASK);
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

  const breadCrumbItem = [
    {
      title: scheduleId || '',
    },
  ];

  if (periodicType === PeriodicDetailType.CHILDTASK) {
    breadCrumbItem.push({
      title: scheduleTaskId || '',
    });
  }

  let pollFlag: NodeJS.Timeout;
  useEffect(() => {
    if (periodicType && periodicGraphId) {
      const fetchRecordList = async () => {
        const res = await recordService.getRecordList(
          projectId as string,
          periodicGraphId,
          100,
          1,
        );
        const data = res?.data.filter((item) => item.status === 'RUNNING');
        if (data.length) {
          pollFlag = setTimeout(() => {
            fetchRecordList();
          }, 5000);
        }
      };
      fetchRecordList();
    }
    return () => {
      clearTimeout(pollFlag);
    };
  }, [projectId, periodicGraphId]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.back} onClick={goBack}>
          <ArrowLeftOutlined />
        </span>
        <Divider type="vertical" />
        <Breadcrumb items={breadCrumbItem} />
        <span className={styles.slot}></span>
      </div>
      <div className={styles.content}>
        <div className={styles.center}>
          <div className={styles.header}>
            <div className={styles.left}>
              <NodeIndexOutlined />
              {`「${
                periodicType === PeriodicDetailType.CHILDTASK
                  ? scheduleTaskId
                  : scheduleId
              }」执行结果`}
            </div>
            <div className={styles.middle}>
              <RecordResultComponent />
            </div>
            <div></div>
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
    </div>
  );
};
