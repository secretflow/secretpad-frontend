/** DEPRECATED */
/** Data table will be added by dragging */
import { Button, Space } from 'antd';
import { Drawer } from 'antd';
import { debounce } from 'lodash';
import React from 'react';

import { useModel } from '@/util/valtio-helper';

import {
  AddDataTableForRegisteredNode,
  UploadTableViewByDataSource,
} from './component/upload-table/data-table-add-for-registerd-node';
import styles from './index.less';

export const DataTableAddContentBySource: React.FC<{
  onClose: () => void;
  visible: boolean;
  close: () => void;
}> = ({ visible, close, onClose }) => {
  const UploadInstance = useModel(UploadTableViewByDataSource);

  const closeHandler = () => {
    UploadInstance.reset();
    close();
    onClose();
  };

  return (
    <Drawer
      title="添加数据"
      width={700}
      open={visible}
      onClose={closeHandler}
      footer={
        <div className={styles.actions}>
          <Space>
            <Button onClick={closeHandler}>取消</Button>
            <Button
              type="primary"
              loading={UploadInstance.submitting}
              onClick={debounce(async () => {
                try {
                  await UploadInstance.submit();
                  closeHandler();
                } catch (e) {
                  return;
                }
              }, 1000)}
            >
              提交
            </Button>
          </Space>
        </div>
      }
    >
      <AddDataTableForRegisteredNode />
    </Drawer>
  );
};
