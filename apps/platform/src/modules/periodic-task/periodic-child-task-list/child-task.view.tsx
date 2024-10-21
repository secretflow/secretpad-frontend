import type { BadgeProps } from 'antd';
import { Badge, Button, Drawer, Popconfirm, Space, Table, Typography } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { history } from 'umi';

import { formatTimestamp } from '@/modules/dag-result/utils';
import { useModel } from '@/util/valtio-helper';

import type { PeriodicTaskInfo } from '../type';
import { PeriodicDetailType } from '../type';

import { renderOptionsTitle, TaskStatus } from './child-task.service';
import { PeriodicChildTaskService, TaskStatusText } from './child-task.service';
import styles from './index.less';

export const PeriodicChildTaskDrawer = (props: {
  visible: boolean;
  data?: PeriodicTaskInfo;
  close: () => void;
}) => {
  const { visible, data = {}, close } = props;

  const service = useModel(PeriodicChildTaskService);

  const popRef = useRef<{ closePopConfirm: VoidFunction }>(null);

  const queryChildTask = async (scheduleId: string) => {
    await service.getPeriodicTaskChildList(scheduleId);
  };

  useEffect(() => {
    if (!visible) return;
    if (data.scheduleId) {
      queryChildTask(data.scheduleId);
    }
    if (popRef.current) {
      popRef.current?.closePopConfirm();
    }
    return () => {
      popRef.current?.closePopConfirm();
    };
  }, [visible, data.scheduleId]);

  const goToPeriodicTaskChildDetail = async (record: API.TaskPageScheduledVO) => {
    if (!record.scheduleTaskId || !data.scheduleId) return;
    const { data: taskInfo } = await service.getJobId(
      data.scheduleId,
      record.scheduleTaskId,
    );
    const searchParams = new URL(window.location.toString()).searchParams;
    const currentDagId = searchParams?.get('dagId');
    searchParams.set('dagId', record.scheduleTaskId);
    history.push(
      {
        pathname: '/periodic-task-detail',
        search: searchParams.toString(),
      },
      {
        periodicType: PeriodicDetailType.CHILDTASK,
        scheduleId: data.scheduleId,
        scheduleTaskId: record.scheduleTaskId,
        historyDagId: currentDagId,
        periodicJobId: taskInfo?.jobId,
        periodicGraphId: taskInfo?.graph?.graphId,
      },
    );
    close();
  };

  const columns = [
    {
      title: '子任务ID',
      dataIndex: 'scheduleTaskId',
      key: 'scheduleTaskId',
      ellipsis: true,
      render: (text: string, record: API.TaskPageScheduledVO) => {
        return (
          <Typography.Text
            style={{
              color: '#1677FF',
              cursor: 'pointer',
            }}
            ellipsis={{
              tooltip: text,
            }}
            onClick={() => {
              goToPeriodicTaskChildDetail(record);
            }}
          >
            {text}
          </Typography.Text>
        );
      },
    },
    {
      title: '期望开始时间',
      dataIndex: 'scheduleTaskExpectStartTime',
      key: 'scheduleTaskExpectStartTime',
      ellipsis: true,
      width: 180,
      render: (scheduleTaskExpectStartTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: formatTimestamp(scheduleTaskExpectStartTime),
          }}
        >
          {formatTimestamp(scheduleTaskExpectStartTime as string) || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '实际开始时间',
      dataIndex: 'scheduleTaskStartTime',
      key: 'scheduleTaskStartTime',
      ellipsis: true,
      render: (scheduleTaskStartTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: formatTimestamp(scheduleTaskStartTime),
          }}
        >
          {formatTimestamp(scheduleTaskStartTime as string) || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '任务结束时间',
      dataIndex: 'scheduleTaskEndTime',
      key: 'scheduleTaskEndTime',
      width: 180,
      ellipsis: true,
      render: (scheduleTaskEndTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: formatTimestamp(scheduleTaskEndTime),
          }}
        >
          {formatTimestamp(scheduleTaskEndTime as string) || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'scheduleTaskStatus',
      key: 'scheduleTaskStatus',
      ellipsis: true,
      render: (status: TaskStatus) => {
        return (
          <Space>
            <Badge
              status={
                (TaskStatusText[status]?.iconColor || 'default') as BadgeProps['status']
              }
            />
            <span>{TaskStatusText[status]?.label || '-'}</span>
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: string, record: API.TaskPageScheduledVO) => {
        if (!data.showOptions) {
          return '-';
        }
        const { title, overThirtyTime } = renderOptionsTitle(record);
        // overThirtyTime false 没有大于三十天
        // 展示重跑失败
        const showReRunAll =
          (record.scheduleTaskStatus === TaskStatus.FAILED ||
            record.scheduleTaskStatus === TaskStatus.STOPPED) &&
          !overThirtyTime;

        return (
          <Space>
            {(record.scheduleTaskStatus === TaskStatus.COMMITTED ||
              record.scheduleTaskStatus === TaskStatus.STOPPING) &&
              '-'}
            {record.scheduleTaskStatus === TaskStatus.RUNNING && (
              <Popconfirm
                okText="停止"
                placement="topRight"
                overlayStyle={{
                  maxWidth: 300,
                }}
                title="确定要停止该任务吗？"
                cancelText="取消"
                onConfirm={async () => {
                  await service.stopChildTask(data.scheduleId, record.scheduleTaskId);
                  await service.getPeriodicTaskChildList(data.scheduleId, {
                    isRefresh: true,
                  });
                }}
              >
                <Typography.Link>停止</Typography.Link>
              </Popconfirm>
            )}
            {(record.scheduleTaskStatus === TaskStatus.SUCCESS ||
              record.scheduleTaskStatus === TaskStatus.FAILED ||
              record.scheduleTaskStatus === TaskStatus.STOPPED) && (
              <Popconfirm
                placement="topRight"
                overlayStyle={{
                  maxWidth: 300,
                }}
                okText={showReRunAll ? '重跑失败' : '重跑'}
                title={title}
                cancelText="取消"
                okButtonProps={{
                  loading: service.reRunLoading,
                  disabled: showReRunAll ? false : record?.allReRun, // 已经重跑后的任务不可再点击重跑
                }}
                cancelButtonProps={{
                  className: classNames('cancelText', {
                    [styles.showReRunBtn]: showReRunAll,
                    [styles.showReRunBtnLoading]: showReRunAll && service.reRunLoading,
                  }),
                }}
                description={
                  showReRunAll && (
                    <Button
                      className={classNames(styles.rerunBtn, {
                        [styles.rerunBtnLoading]: service.reRunLoading,
                      })}
                      size="small"
                      loading={service.reRunLoading}
                      disabled={record?.allReRun} // 已经重跑后的任务不可再点击重跑
                      onClick={async () => {
                        await service.reRunTask(
                          data.scheduleId,
                          record.scheduleTaskId,
                          0, // 重跑失败1 / 全部重跑 0
                        );
                        await service.getPeriodicTaskChildList(data.scheduleId, {
                          isRefresh: true,
                        });
                        setTimeout(() => {
                          const button = document.querySelector(
                            '.ant-btn.cancelText',
                          ) as HTMLButtonElement;
                          button?.click();
                        });
                      }}
                    >
                      重跑
                    </Button>
                  )
                }
                onConfirm={async () => {
                  await service.reRunTask(
                    data.scheduleId,
                    record.scheduleTaskId,
                    showReRunAll ? 1 : 0, // 重跑失败1 / 全部重跑 0
                  );
                  await service.getPeriodicTaskChildList(data.scheduleId, {
                    isRefresh: true,
                  });
                }}
              >
                <Typography.Link>重跑</Typography.Link>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Drawer
      title={`「${data.scheduleId}」 调度历史`}
      destroyOnClose
      open={visible}
      onClose={close}
      width={920}
    >
      <Table
        columns={columns}
        dataSource={service.periodicTaskChildList}
        loading={service.loading}
        pagination={{
          total: service.totalNum || 1,
          current: service.pageNumber,
          pageSize: service.pageSize,
          onChange: (page, pageSize) => {
            service.pageNumber = page;
            service.pageSize = pageSize;
          },
          size: 'default',
          showSizeChanger: false,
        }}
        rowKey={(record) => record.scheduleTaskId as string}
      />
    </Drawer>
  );
};
