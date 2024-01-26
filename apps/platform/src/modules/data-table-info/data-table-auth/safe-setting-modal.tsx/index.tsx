import { CopyOutlined } from '@ant-design/icons';
import { Modal, Table, Typography } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import ReactHightLighter from '@/components/react-hight-lighter';

import styles from './index.less';
import { KeyTypes, QuerySql, SafeConfigTableData, safeConfigData } from './safe-data';

export const SafeSettingModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [checkReady, setCheckReady] = useState(0);

  const columns = [
    {
      title: 'Owned By',
      dataIndex: 'ownedBy',
      width: 90,
      className: 'highlight-col',
      onCell: (_: string, index: number) => {
        if (index === 0 || index === 2) {
          return { rowSpan: 2 };
        }
        if (index === 1 || index === 3) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
    {
      title: 'Table',
      dataIndex: 'Table',
      className: 'highlight-col',
      onCell: (_: string, index: number) => {
        if (index === 0 || index === 2) {
          return { rowSpan: 2 };
        }
        if (index === 1 || index === 3) {
          return { colSpan: 0 };
        }
      },
    },
    {
      title: 'Column',
      dataIndex: 'column',
    },
    {
      title: 'Type',
      dataIndex: 'Type',
    },
    {
      title: '关联键',
      dataIndex: 'correlationKey',
      width: 60,
    },
    {
      title: '分组列',
      dataIndex: 'groupKey',
      width: 60,
    },
    {
      title: '保护开关',
      dataIndex: 'auth',
      width: 75,
    },
    {
      title: '保护意图',
      dataIndex: 'desc',
      width: 180,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="安全配置说明"
      width={'1100px'}
      footer={null}
      rootClassName={styles.safeSettingModal}
    >
      <div className={styles.content}>
        <div className={styles.left}>
          {safeConfigData.map((item: { [key: string]: any }, index) => {
            return (
              <div
                className={classNames(styles.checkBox, {
                  [styles.checkReady]: index === checkReady,
                })}
                onClick={() => setCheckReady(index)}
                key={item.key}
              >
                {KeyTypes.map((keyItem: { label: string; keys: string }) => (
                  <div className={styles.box} key={keyItem.label}>
                    <div>{keyItem.label}</div>
                    <span>{item[keyItem.keys]}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className={styles.right}>
          <div className={styles.desc}>
            {safeConfigData[checkReady].desclist.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <div className={styles.table}>
            {checkReady !== 3 && (
              <Table
                size="small"
                bordered
                dataSource={SafeConfigTableData}
                columns={columns}
                rowKey={(record) => record.key}
                pagination={false}
                rowClassName={(record) => {
                  return record.highlight === checkReady ? 'highlight-row' : '';
                }}
                className={styles.safeConfigTable}
              />
            )}
          </div>
          <div className={styles.code}>
            {QuerySql[safeConfigData[checkReady].key] && (
              <div className={styles.codeTitle}>
                <div>SQL</div>
                <Typography.Paragraph
                  copyable={{
                    text: QuerySql[safeConfigData[checkReady].key],
                    icon: [
                      <span
                        className={styles.copy}
                        key={QuerySql[safeConfigData[checkReady].key]}
                      >
                        <CopyOutlined />
                        复制代码
                      </span>,
                    ],
                  }}
                />
              </div>
            )}
            {QuerySql[safeConfigData[checkReady].key] && (
              <ReactHightLighter
                type="sql"
                codeString={QuerySql[safeConfigData[checkReady].key]}
                className={styles.codeContent}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
