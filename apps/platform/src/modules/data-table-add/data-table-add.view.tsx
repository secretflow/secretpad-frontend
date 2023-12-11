import { Button, Space } from 'antd';
import { Drawer } from 'antd';
import { debounce } from 'lodash';
import React, { useState } from 'react';

import { useModel } from '@/util/valtio-helper';

import {
  UploadTable,
  UploadTableView,
} from './component/upload-table/upload-table.view';
import styles from './index.less';

export const DataTableAddContent: React.FC<{
  onClose: () => void;
  visible: boolean;
}> = ({ visible, onClose }) => {
  const UploadInstance = useModel(UploadTableView);
  const [disabled, setDisabled] = useState(false);

  const closeHandler = () => {
    UploadInstance.reset();
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
              disabled={UploadInstance.step === 0 || disabled}
              type="primary"
              loading={UploadInstance.submitting}
              onClick={debounce(async () => {
                try {
                  await UploadInstance.submit();
                  onClose();
                } catch (e) {
                  return;
                }
                closeHandler();
              }, 1000)}
            >
              提交
            </Button>
          </Space>
        </div>
      }
    >
      <UploadTable setDisabled={setDisabled} />
    </Drawer>
  );
};
