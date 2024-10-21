import { ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import {
  Space,
  Input,
  Table,
  Badge,
  Typography,
  Popconfirm,
  Radio,
  Tooltip,
} from 'antd';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation, history } from 'umi';

import { formatTimestamp } from '@/modules/dag-result/utils';
import { Model, useModel } from '@/util/valtio-helper';

import { PeriodicChildTaskDrawer } from '../periodic-child-task-list/child-task.view';
import { PeriodicDetailType, PeriodicTaskInfo } from '../type';

import styles from './index.less';
import { TaskStatus } from './task.service';
import { PeriodicTaskListService, taskStatusText } from './task.service';
import { hasAccess, Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';

const { Link } = Typography;

export const PeriodicTaskComponent = () => {
  const viewInstance = useModel(PeriodicTaskView);
  const service = useModel(PeriodicTaskListService);
  const loginService = useModel(LoginService);

  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  const showOptions = (record: API.PageScheduledVO) => {
    const isAutonomyMode = hasAccess({ type: [Platform.AUTONOMY] });

    // p2p 模式下只有当前 owner 才可以操作
    if (isAutonomyMode) {
      const loginOwnerId = loginService?.userInfo?.ownerId;
      if (loginOwnerId === record.owner) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    if (projectId) {
      service.getPeriodicTaskList();
    }
  }, [projectId]);

  const goToPeriodicTaskDetail = async (record: API.PageScheduledVO) => {
    if (!record.scheduleId) return;
    const { data } = await service.getJobId(record.scheduleId);
    const searchParams = new URL(window.location.toString()).searchParams;
    const currentDagId = searchParams?.get('dagId');
    searchParams.set('dagId', record.scheduleId);
    history.push(
      {
        pathname: '/periodic-task-detail',
        search: searchParams.toString(),
      },
      {
        periodicType: PeriodicDetailType.TASK,
        scheduleId: record.scheduleId,
        historyDagId: currentDagId,
        periodicJobId: data?.jobId,
        periodicGraphId: data?.graph?.graphId,
      },
    );
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      ellipsis: true,
      render: (text: string, record: API.PageScheduledVO) => {
        return (
          <Link
            ellipsis
            onClick={() => {
              goToPeriodicTaskDetail(record);
            }}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'scheduleDesc',
      key: 'scheduleDesc',
      ellipsis: true,
      render: (text: string) => <span>{text || '-'}</span>,
    },

    {
      title: '状态',
      dataIndex: 'scheduleStats',
      key: 'scheduleStats',
      ellipsis: true,
      render(text: TaskStatus) {
        return (
          <Space>
            <Badge color={taskStatusText[text]?.iconColor} />
            <span>{taskStatusText[text]?.label}</span>
          </Space>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      ellipsis: true,
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      title: '创建方',
      dataIndex: 'ownerName',
      key: 'ownerName',
      ellipsis: true,
      render: (text: string) => <span>{text || '-'}</span>,
    },
    {
      title: '部署时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
      ellipsis: true,
      render: (createTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: formatTimestamp(createTime),
          }}
        >
          {formatTimestamp(createTime as string)}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render(_: string, record: API.PageScheduledVO) {
        return (
          <Space>
            <Link
              onClick={() => {
                viewInstance.setPeriodicTaskInfo({
                  ...record,
                  showOptions: showOptions(record),
                });
                viewInstance.setPeriodicChildTaskVisible(true);
              }}
            >
              调度历史
            </Link>
            {showOptions(record) && (
              <span>
                {record.scheduleStats === TaskStatus.UP ? (
                  <Popconfirm
                    placement="topRight"
                    title="下线后将不可再次上线！确定要下线该任务吗？"
                    overlayStyle={{
                      maxWidth: 300,
                    }}
                    onConfirm={async () => {
                      await service.offlineTask(record?.scheduleId || '');
                      await service.getPeriodicTaskList();
                    }}
                    okText="下线"
                    cancelText="取消"
                    disabled={record.taskRunning}
                  >
                    {!record.taskRunning ? (
                      <Link>下线</Link>
                    ) : (
                      <Tooltip
                        title="存在正在运行的周期任务，不可下线"
                        placement="left"
                      >
                        <Link disabled>下线</Link>
                      </Tooltip>
                    )}
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    placement="topRight"
                    title={`确认要删除「${record?.scheduleId}」吗？`}
                    icon={<ExclamationCircleFilled />}
                    description={'删除后已运行历史任务将不可查看'}
                    overlayStyle={{
                      maxWidth: 300,
                    }}
                    onConfirm={async () => {
                      await service.deleteTask(record.scheduleId!);
                      await service.getPeriodicTaskList();
                    }}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{
                      danger: true,
                      ghost: true,
                    }}
                  >
                    <Link>删除</Link>
                  </Popconfirm>
                )}
              </span>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.periodicTasksContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Space size="middle">
            <Input
              placeholder="搜索任务ID"
              onChange={(e) => service.searchTask(e)}
              style={{ width: 200 }}
              suffix={
                <SearchOutlined
                  style={{
                    color: '#aaa',
                  }}
                />
              }
            />

            <Radio.Group
              defaultValue={TaskStatus.ALL}
              onChange={(e: RadioChangeEvent) =>
                service.taskStatusFilter(e.target.value)
              }
            >
              <Radio.Button value={TaskStatus.ALL}>全部</Radio.Button>
              <Radio.Button value={TaskStatus.UP}>生效中</Radio.Button>
              <Radio.Button value={TaskStatus.DOWN}>已下线</Radio.Button>
            </Radio.Group>
          </Space>
        </div>
        <div className={styles.table}>
          <Table
            columns={columns}
            dataSource={service.periodicTaskList}
            loading={service.loading}
            onChange={(pagination, filters, sorter) =>
              service.deployTimeFilter(
                filters,
                sorter as { order: string; field: string },
              )
            }
            pagination={{
              total: service.totalNum || 1,
              current: service.pageNumber,
              pageSize: service.pageSize,
              onChange: (page, pageSize) => {
                service.pageNumber = page;
                service.pageSize = pageSize;
              },
              size: 'default',
              showSizeChanger: true,
            }}
            rowKey={(record) => record.scheduleId as string}
          />
        </div>
        {viewInstance.periodicChildTaskVisible && (
          <PeriodicChildTaskDrawer
            visible={viewInstance.periodicChildTaskVisible}
            close={() => {
              viewInstance.setPeriodicChildTaskVisible(false);
              service.getPeriodicTaskList();
            }}
            data={viewInstance.periodicTaskInfo}
          />
        )}
      </div>
    </div>
  );
};

export class PeriodicTaskView extends Model {
  periodicChildTaskVisible = false;

  periodicTaskInfo: PeriodicTaskInfo = {};

  setPeriodicTaskInfo = (record: PeriodicTaskInfo) => {
    this.periodicTaskInfo = record;
  };

  setPeriodicChildTaskVisible = (visible: boolean) => {
    this.periodicChildTaskVisible = visible;
  };
}
