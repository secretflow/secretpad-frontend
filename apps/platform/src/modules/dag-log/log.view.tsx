import { DoubleRightOutlined } from '@ant-design/icons';
import { Tag, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';

import { useModel } from '@/util/valtio-helper';

import { LogTextMap } from './dag-log.service';
import { DagLogService } from './dag-log.service';
import styles from './index.less';

export enum DagLogContentArea {
  content = 'dag-log-content-slot',
}

export const DagLog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const viewInstance = useModel(DagLogService);
  const { unfold, logMainHeight, setLogMainMax, setLogMainMin, logTipContent } =
    viewInstance;

  React.useEffect(() => {
    return () => {
      viewInstance.setLogMainMin();
    };
  }, []);

  return (
    <div style={{ height: logMainHeight }}>
      <div
        className={classNames(styles.dagLogHeader, {
          [styles.activeTab]: !unfold,
        })}
      >
        <div
          className={classNames(styles.dagLogHeaderLeft, {
            [styles.isUnfoldTitle]: !unfold,
          })}
        >
          <Space className={styles.spaceText} align="center">
            <div
              className={styles.logText}
              onClick={() => {
                if (unfold) {
                  setLogMainMax();
                } else {
                  setLogMainMin();
                }
              }}
            >
              日志
            </div>

            <Tag color={LogTextMap[logTipContent.status]?.color}>
              {LogTextMap[logTipContent.status].text}
            </Tag>
          </Space>
        </div>
        <div className={styles.logHeaderIcon}>
          {unfold ? (
            <DoubleRightOutlined className={styles.close} onClick={setLogMainMax} />
          ) : (
            <DoubleRightOutlined className={styles.open} onClick={setLogMainMin} />
          )}
        </div>
      </div>
      <div className={styles.dagLogContent}>{children}</div>
    </div>
  );
};
