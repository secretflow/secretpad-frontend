import { CloseOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import recordLayoutStyle from '@/modules/layout/record-layout/index.less';
import { RecordListDrawerItem } from '@/modules/pipeline-record-list/record-list-drawer-view';
import { getModel, useModel } from '@/util/valtio-helper';

import { ConfigFormComponent } from './config-form-view';
import styles from './index.less';

const CONFIG_WIDTH = 300;

export const ComponentConfigDrawer: React.FC = () => {
  const modalManager = useModel(DefaultModalManager);

  const modal = modalManager.modals[componentConfigDrawer.id];

  const { data, visible } = modal || {};

  const { id, codeName, graphNode, upstreamNodes, inputNodes, label } = data || {};

  const [, idNum] = id?.match(/.*-([0-9]+)$/) || [];
  const [isRecordDrawerOpen, setRecordDrawerStatus] = useState<boolean>(false);

  const onClose = () => {
    modalManager.closeModal(componentConfigDrawer.id);
  };

  useEffect(() => {
    setRecordDrawerStatus(modalManager.modals[RecordListDrawerItem.id].visible);
  }, [modalManager.modals[RecordListDrawerItem.id]]);

  return (
    <Drawer
      title={label}
      placement="right"
      width={CONFIG_WIDTH}
      closable={false}
      onClose={onClose}
      open={visible}
      autoFocus={false}
      destroyOnClose
      rootClassName={classNames(
        styles.componentConfigDrawer,
        {
          [styles.float]: isRecordDrawerOpen,
        },
        'component-panel-for-tour',
      )}
      getContainer={() => {
        return (
          document.querySelector(`.${dagLayoutStyle.center}`) ||
          (document.querySelector(`.${recordLayoutStyle.center}`) as Element)
        );
      }}
      mask={false}
      extra={<CloseOutlined style={{ fontSize: 12 }} onClick={onClose} />}
    >
      <div className={styles.description}>
        <div>
          <span className={styles.label}>组件类型：</span>
          <span>纵向</span>
        </div>
        <div>
          <span className={styles.label}>组件 ID：</span>
          <span>{idNum}</span>
        </div>
      </div>

      {visible && (
        <ConfigFormComponent
          node={{ nodeId: id, name: codeName, upstreamNodes, graphNode, inputNodes }}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
};

export const componentConfigDrawer = {
  id: 'component-config',
  visible: false,
  data: {},
};

getModel(DefaultModalManager).registerModal(componentConfigDrawer);
