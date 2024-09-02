import { EyeOutlined, RedoOutlined } from '@ant-design/icons';
import { Alert, Popover, Space, Spin, Typography } from 'antd';

import styles from './index.less';
import { useModel } from '@/util/valtio-helper';
import { MyNodeService } from '../my-node.service';
import { useCallback, useEffect } from 'react';

const { Paragraph } = Typography;

export const RefreshToken = () => {
  const myNodeService = useModel(MyNodeService);

  const {
    nodeToken = '',
    getNodeToken,
    currentPageNodeId,
    nodeTokenLoading,
  } = myNodeService;

  const getToken = useCallback(
    async () => await getNodeToken(currentPageNodeId),
    [currentPageNodeId],
  );

  useEffect(() => {
    getToken();
  }, [currentPageNodeId]);

  return (
    <div className={styles.popoverCopy}>
      <Popover
        placement="left"
        title={
          <div className={styles.publicTitle}>
            <div>
              <span>token</span>
              <span className={styles.tokenTitleTip}>
                有效期30分钟，如超过30分钟请刷新使用最新token
              </span>
            </div>
            <Space>
              <span
                className={styles.refresh}
                onClick={() => {
                  myNodeService.refreshNodeToken(currentPageNodeId);
                }}
              >
                <RedoOutlined className={styles.refreshToken} />
                <span className={styles.refreshToken}>刷新</span>
              </span>
              <Paragraph
                copyable={{
                  icon: '复制token',
                  text: `${nodeToken || '暂无数据'}`,
                }}
                style={{ color: '#1677FF' }}
              ></Paragraph>
            </Space>
          </div>
        }
        overlayClassName={styles.publicKeyPopover}
        content={
          <Spin spinning={nodeTokenLoading}>
            <div className={styles.publicKey}>{nodeToken || '暂无数据'}</div>
          </Spin>
        }
        trigger="click"
      >
        <EyeOutlined className={styles.eyes} />
      </Popover>
      <Paragraph
        copyable={{
          text: nodeToken || '暂无数据',
        }}
      ></Paragraph>
    </div>
  );
};
