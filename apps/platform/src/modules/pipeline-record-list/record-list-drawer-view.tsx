import { CloseOutlined } from '@ant-design/icons';
import { Drawer, Button } from 'antd';
import { parse, stringify } from 'query-string';
import { useMemo, useState, useEffect } from 'react';
import { history, useLocation } from 'umi';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import recordLayoutStyle from '@/modules/layout/record-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { RecordListComponent } from './record-list';
import { DefaultRecordService } from './record-service';

const DRAWER_WIDTH = 320;
export const RecordListDrawer = () => {
  const recordService = useModel(DefaultRecordService);
  const modalManager = useModel(DefaultModalManager);

  const { visible } = modalManager.modals[RecordListDrawerItem.id];

  const onClose = () => {
    modalManager.closeModal(RecordListDrawerItem.id);
  };

  useEffect(() => {
    return () => {
      modalManager.closeModal(RecordListDrawerItem.id);
    };
  }, []);

  const { pathname } = useLocation();

  // const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);

  const recordList = useMemo(
    () => <RecordListComponent visible={visible} multiSelectEnabled={false} />,
    [visible],
  );

  const closeComponent = useMemo(() => {
    return pathname === '/dag' ? (
      <CloseOutlined
        style={{ fontSize: 12 }}
        onClick={() => {
          recordService.changeRecordDrawer(false);
          onClose();
          goToDag();
        }}
      />
    ) : (
      <Button
        className={styles.exitButton}
        type="link"
        onClick={() => {
          recordService.changeRecordDrawer(false);
          onClose();
          goToDag();
        }}
      >
        退出
      </Button>
    );
  }, [pathname]);

  const goToDag = () => {
    const searchDagParams = window.location.search;
    const { projectId, mode, type } = parse(searchDagParams);
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
      { pipelineName, pipelineId, origin },
    );
  };

  useEffect(() => {
    recordService.changeRecordDrawer(true);
  }, [visible]);

  return (
    <Drawer
      title={
        <div className={styles.headerContainer}>
          <div className={styles.headerText}>记录与结果</div>
        </div>
      }
      placement="right"
      width={DRAWER_WIDTH}
      closable={false}
      onClose={onClose}
      open={visible}
      rootClassName={styles.recordDrawer}
      getContainer={() => {
        return (
          document.querySelector(`.${dagLayoutStyle.center}`) ||
          (document.querySelector(`.${recordLayoutStyle.center}`) as Element)
        );
      }}
      mask={false}
      extra={closeComponent}
    >
      {recordList}
    </Drawer>
  );
};

export const RecordListDrawerItem = {
  id: 'RecordListDrawer',
  visible: false,
};

getModel(DefaultModalManager).registerModal(RecordListDrawerItem);
