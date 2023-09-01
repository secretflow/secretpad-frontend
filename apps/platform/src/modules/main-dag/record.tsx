import { FundProjectionScreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { parse } from 'query-string';
import React from 'react';
import { useLocation } from 'umi';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import {
  RecordListDrawer,
  RecordListDrawerItem,
} from '../pipeline-record-list/record-list-drawer-view';

import styles from './index.less';

export const RecordComponent: React.FC = () => {
  const viewInstance = useModel(RecordView);
  const { search } = useLocation();
  const dagId = parse(search)?.dagId as string;
  return (
    <div className={`${styles.toolbar} toolbar2-for-guide-tour`}>
      <Button
        icon={<FundProjectionScreenOutlined />}
        size="small"
        onClick={() => viewInstance.onClick(dagId)}
      >
        记录与结果
      </Button>
      <RecordListDrawer />
    </div>
  );
};

export class RecordView extends Model {
  showDrawer = false;

  modalManager = getModel(DefaultModalManager);

  onViewMount(): void {
    const { dagId } = parse(window.location.search);
    if (!dagId) return;
    if (window.location.pathname === '/record') {
      this.showDrawer = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick(dagId: string) {
    this.modalManager.openModal(RecordListDrawerItem.id);
  }

  closeDrawer() {
    this.showDrawer = false;
  }
}
