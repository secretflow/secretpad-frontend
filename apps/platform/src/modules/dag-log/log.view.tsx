import { DoubleRightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { parse } from 'query-string';
import React, { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { DagLogService } from './dag-log.service';
import styles from './index.less';

export enum DagLogContentArea {
  content = 'dag-log-content-slot',
}

interface IProps {
  items: {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
  }[];
}

export const DagLog: React.FC<IProps> = ({ items }) => {
  const viewInstance = useModel(DagLogService);
  const { search } = window.location;
  const { dagId } = parse(search);
  const { unfold, logMainHeight, setLogMainMax, setLogMainMin } = viewInstance;

  const [activeKey, setActiveKey] = React.useState(items[0]?.key);

  useEffect(() => {
    setActiveKey(items[0]?.key);
    return () => {
      viewInstance.setLogMainMin();
    };
  }, [dagId]);

  return (
    <div style={{ height: logMainHeight }}>
      <div
        className={classNames(styles.dagLogHeader, {
          [styles.activeTab]: !unfold,
        })}
      >
        <div className={styles.dagLogHeaderLeft}>
          <div className={styles.spaceText}>
            {items.map((item) => {
              return (
                <div
                  key={item.key}
                  className={classNames(styles.logLabelTitle, {
                    [styles.isUnfoldTitle]: !unfold && item.key === activeKey,
                  })}
                >
                  <div
                    className={classNames(styles.logText, {
                      [styles.logTextDisabled]: item.disabled,
                    })}
                    onClick={() => {
                      if (item.disabled) return;
                      setActiveKey(item.key);
                      if (unfold) {
                        setLogMainMax();
                      }
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.logHeaderIcon}>
          {unfold ? (
            <DoubleRightOutlined className={styles.close} onClick={setLogMainMax} />
          ) : (
            <DoubleRightOutlined className={styles.open} onClick={setLogMainMin} />
          )}
        </div>
      </div>
      <div className={styles.dagLogContent}>
        {items.find((i) => i.key === activeKey)?.children}
      </div>
    </div>
  );
};
