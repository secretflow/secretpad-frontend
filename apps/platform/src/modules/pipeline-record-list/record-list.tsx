import {
  CopyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CheckOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { List, Popconfirm, Typography, Progress, message } from 'antd';
import classnames from 'classnames';
import { parse, stringify } from 'query-string';
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { history, useLocation } from 'umi';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { formatTimestamp } from '@/modules/dag-result/utils';
import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';
import { stopJob } from '@/services/secretpad/ProjectController';
import { useModel } from '@/util/valtio-helper';

import styles from './index.less';
import type { ExecutionRecord, ExecutionRecordData } from './record-protocol';
import { DefaultRecordService } from './record-service';

const { Paragraph } = Typography;

export const RecordListComponent = (props: {
  multiSelectEnabled: boolean;
  visible?: boolean;
}) => {
  const { multiSelectEnabled, visible } = props;
  const recordService = useModel(DefaultRecordService);
  const [recordList, setRecordList] = useState<ExecutionRecord>();
  const projectEditService = useModel(ProjectEditService);
  const [currentPage, setCurrentPage] = useState(
    (history.location.state as any)?.pageNum || 1,
  );

  const [isRefreshed, setIsRefreshed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { search, pathname } = useLocation();
  const { projectId, dagId } = parse(search) as {
    projectId: string;
    dagId: string;
  };

  let pollFlag: NodeJS.Timeout;

  useEffect(() => {
    const { pipelineId } = (history.location.state as any) || {};
    const fetchRecordList = async () => {
      if (!visible) return;
      const res = await recordService.getRecordList(
        projectId as string,
        pathname === '/dag' ? (dagId as string) : pipelineId,
        5,
        currentPage,
      );

      const data = res?.data.filter((item) => item.status === 'RUNNING');

      if (data.length) {
        // TODO
        pollFlag = setTimeout(() => {
          fetchRecordList();
        }, 5000);
      }

      setRecordList(res);
    };
    fetchRecordList();
    return () => {
      clearTimeout(pollFlag);
    };
  }, [visible, dagId, projectId, currentPage, pathname, isRefreshed]);

  useEffect(() => {
    if (pathname === '/dag') {
      setCurrentPage(1);
    }
    setSelectedItem(dagId);
  }, [dagId, projectId, pathname]);

  const Selectable: React.FC<{
    item: ReactNode;
    value: string;
    [k: string]: unknown;
  }> = (prop) => {
    const { item } = prop;
    return <>{item}</>;
  };

  const getTimeCost = (createTime: string, finishedTime: string) => {
    const start = new Date(createTime);
    const end = new Date(finishedTime);
    const timeDiff = end.getTime() - start.getTime();
    const hours = Math.floor(timeDiff / (3600 * 1000));
    const hourLeft = timeDiff % (3600 * 1000);
    const minutes = Math.floor(hourLeft / (60 * 1000));
    const minLeft = timeDiff % (60 * 1000);
    const seconds = Math.floor(minLeft / 1000);

    if (hours !== 0) return `${hours}h ${minutes}min ${seconds}s`;
    if (minutes !== 0) return `${minutes}min ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <List
      className={styles.recordList}
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: (page) => {
          setCurrentPage(page);
        },
        total:
          recordList?.pageTotal && recordList?.pageSize
            ? recordList?.pageTotal * recordList?.pageSize
            : 0,
        pageSize: recordList?.pageSize,
        current: currentPage,
        size: 'small',
        hideOnSinglePage: true,
      }}
      split={false}
      dataSource={recordList?.data as ExecutionRecordData[]}
      renderItem={(item: ExecutionRecordData) => (
        <List.Item
          className={classnames(selectedItem === item.jobId ? styles.selectedItem : '')}
          onClick={() => {
            setSelectedItem(item.jobId);
            const searchDagParams = window.location.search;
            const { projectId: id, mode, type } = parse(searchDagParams);
            const searchParams = {
              dagId: item.jobId,
              projectId: id,
              mode,
              type: hasAccess({ type: [Platform.AUTONOMY] }) ? type : undefined,
            };
            const { pipelineName, pipelineId, origin } =
              (history.location.state as {
                pipelineName: string;
                pipelineId: string;
                origin: string;
              }) || {};
            history.push(
              {
                pathname: '/record',
                search: stringify(searchParams),
              },
              { pipelineName, pipelineId, pageNum: currentPage, origin },
            );
          }}
        >
          <List.Item.Meta
            title={
              <div className={styles.itemTitle}>
                <div>
                  <Selectable
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                    }}
                    value={item.jobId}
                    item={
                      <div
                        className={classnames(
                          multiSelectEnabled ? '' : styles.statusIcon,
                        )}
                      >
                        {item.status === 'SUCCEED' && (
                          <CheckCircleFilled style={{ color: '#23B65F' }} />
                        )}
                        {item.status === 'FAILED' && (
                          <CloseCircleFilled style={{ color: '#FC7574' }} />
                        )}
                        {item.status === 'STOPPED' && (
                          <CloseCircleFilled style={{ color: '#FC7574' }} />
                        )}
                        {item.status === 'RUNNING' && (
                          <Progress
                            type="circle"
                            trailColor="#e6f4ff"
                            percent={Number(
                              (
                                Number(item.finishedTaskCount / item.taskCount) * 100
                              ).toFixed(0),
                            )}
                            strokeWidth={20}
                            size={14}
                          />
                        )}
                      </div>
                    }
                  />
                </div>

                <div className={styles.itemText}>{formatTimestamp(item.gmtCreate)}</div>
                <div className={styles.toolIcon} onClick={(e) => e.stopPropagation()}>
                  {item.status === 'RUNNING' &&
                    !projectEditService.canEdit.recordStoptaskDisabled && (
                      <Popconfirm
                        title="你确定要停止任务吗？"
                        onConfirm={async () => {
                          try {
                            const { status } = await stopJob({
                              projectId,
                              jobId: item.jobId,
                            });
                            if (status?.code === 0) {
                              setIsRefreshed(!isRefreshed);
                            } else {
                              message.error(status?.msg || '操作失败');
                            }
                          } catch (e) {
                            message.error('操作失败');
                          }
                        }}
                        okText="停止"
                        cancelText="取消"
                        okType="danger"
                      >
                        <PoweroffOutlined />
                      </Popconfirm>
                    )}
                </div>
              </div>
            }
            description={
              <div className={styles.itemText}>
                <Paragraph
                  className={styles.itemId}
                  copyable={{
                    tooltips: false,
                    icon: [
                      <CopyOutlined className={styles.toolIcon} key={'copy-icon'} />,
                      <CheckOutlined className={styles.toolIcon} key={'copied-icon'} />,
                    ],
                    text: item.jobId,
                  }}
                >
                  {`ID：${item.jobId}`}
                </Paragraph>
                {item.gmtCreate && item.gmtFinished && (
                  <div className={styles.itemTimeCost}>{`耗时：${getTimeCost(
                    item.gmtCreate,
                    item.gmtFinished,
                  )}`}</div>
                )}
              </div>
            }
          />
          <div className={styles.resultOrProgress}>
            {item.status !== 'RUNNING' && (
              <div className={styles.recordResult}>
                <div>
                  表：
                  <span className={styles.numResult}>
                    <span className={styles.num}>{item.tableCount}</span>个
                  </span>
                </div>

                <div>
                  模型：
                  <span className={styles.numResult}>
                    <span className={styles.num}>{item.modelCount}</span>个
                  </span>
                </div>

                <div>
                  规则：
                  <span className={styles.numResult}>
                    <span className={styles.num}>{item.ruleCount}</span>个
                  </span>
                </div>

                <div>
                  报告：
                  <span className={styles.numResult}>
                    <span className={styles.num}>{item.reportCount}</span>个
                  </span>
                </div>
              </div>
            )}

            {item.status === 'RUNNING' && (
              <Progress
                percent={Number(
                  (Number(item.finishedTaskCount / item.taskCount) * 100).toFixed(0),
                )}
                showInfo={false}
              />
            )}
          </div>
        </List.Item>
      )}
    />
  );
};
