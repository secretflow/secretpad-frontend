import { SearchOutlined } from '@ant-design/icons';
import {
  Space,
  Input,
  Select,
  Button,
  Table,
  Badge,
  Typography,
  Popconfirm,
  BadgeProps,
} from 'antd';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { formatTimestamp } from '@/modules/dag-result/utils';
import { Model, useModel } from '@/util/valtio-helper';

import { ModelReleaseInfoModal } from './model-info/model-info.view';
import { ModelReleaseModal } from './model-release/model-release.view';
import { ModelService } from './model-service';
import { ModelStatus } from './types';
import { ModelStatusSelectOptions } from './actions';

import styles from './index.less';
import { Platform, hasAccess } from '@/components/platform-wrapper';
import { ModelDetailModal } from './model-detail/model-detail.view';
import { LoginService } from '@/modules/login/login.service';

const statusMap = {
  [ModelStatus.PENDING]: { status: 'warning', text: '待发布' },
  [ModelStatus.PUBLISHED]: { status: 'success', text: '已发布' },
  [ModelStatus.OFFLINE]: { status: 'default', text: '已下线' },
  [ModelStatus.DISCARDED]: { status: 'default', text: '已废弃' },
  [ModelStatus.FAILED]: { status: 'error', text: '发布失败' },
  [ModelStatus.PUBLISHING]: { status: 'processing', text: '发布中' },
};

const showReleaseBtn = [ModelStatus.PENDING, ModelStatus.OFFLINE, ModelStatus.FAILED];
const showDiscardBtn = [ModelStatus.PENDING, ModelStatus.OFFLINE, ModelStatus.FAILED];
const showOfflineBtn = [ModelStatus.PUBLISHED, ModelStatus.PUBLISHING];
const showDeleteBtn = [ModelStatus.DISCARDED];
const showServiceBtn = [ModelStatus.PUBLISHED, ModelStatus.OFFLINE];
const showNotBtn: ModelStatus[] = [];

const { Link } = Typography;

export const ModelListComponent = () => {
  const viewInstance = useModel(ModelListView);
  const modelService = useModel(ModelService);
  const loginService = useModel(LoginService);

  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };
  const isP2p = hasAccess({ type: [Platform.AUTONOMY] });

  const isOwner = (ownerId: string) => {
    return ownerId === loginService.userInfo?.ownerId;
  };

  useEffect(() => {
    if (projectId) {
      modelService.getModelList();
      modelService.getListProject(projectId, isP2p);
    }
  }, [projectId]);

  const renderButtons = (record: API.ModelPackVO) => {
    return (
      <Space size="small" className={styles.optionsBtns}>
        {showReleaseBtn.includes(record.modelStats as ModelStatus) && (
          <Button
            type="link"
            onClick={() => {
              viewInstance.setModelId(record.modelId);
              viewInstance.setVisible(true);
            }}
            // P2P模式下，已经归档项目不允许发布
            disabled={
              (isP2p && modelService.isProjectArchive) ||
              (isP2p && !isOwner(record.ownerId))
            }
          >
            发布
          </Button>
        )}
        {showDiscardBtn.includes(record.modelStats as ModelStatus) && (
          <Popconfirm
            placement="topRight"
            title={`确定要废弃吗？`}
            onConfirm={async () => {
              await modelService.discard(record.modelId!);
              await modelService.getModelList();
            }}
            okText="废弃"
            cancelText="取消"
          >
            <Button type="link" disabled={isP2p && !isOwner(record.ownerId)}>
              废弃
            </Button>
          </Popconfirm>
        )}
        {showOfflineBtn.includes(record.modelStats as ModelStatus) && (
          <Popconfirm
            placement="topRight"
            title={`确定要下线吗？`}
            onConfirm={async () => {
              await modelService.setOffline(record.servingId!);
              await modelService.getModelList();
            }}
            okText="下线"
            cancelText="取消"
          >
            <Button type="link" disabled={isP2p && !isOwner(record.ownerId)}>
              下线
            </Button>
          </Popconfirm>
        )}
        {showDeleteBtn.includes(record.modelStats as ModelStatus) && (
          <Popconfirm
            placement="topRight"
            title={`确定要删除吗？`}
            onConfirm={async () => {
              await modelService.delete(record.modelId!);
              await modelService.getModelList();
            }}
            okText="删除"
            cancelText="取消"
            okButtonProps={{
              danger: true,
              ghost: true,
            }}
          >
            <Button type="link" disabled={isP2p && !isOwner(record.ownerId)}>
              删除
            </Button>
          </Popconfirm>
        )}
        {showServiceBtn.includes(record.modelStats as ModelStatus) && (
          <Button
            type="link"
            onClick={() => {
              viewInstance.setModelReleaseInfo(record);
              viewInstance.setModelReleaseInfoVisible(true);
            }}
          >
            查看服务
          </Button>
        )}
        {showNotBtn.includes(record.modelStats as ModelStatus) && (
          <Button type="link" disabled>
            -
          </Button>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
      render: (text: string, record: API.ModelPackVO) => {
        return (
          <Link
            ellipsis
            onClick={() => {
              viewInstance.setModelReleaseInfo(record);
              viewInstance.setModelDetailVisible(true);
            }}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: '模型ID',
      dataIndex: 'modelId',
      key: 'modelId',
      ellipsis: true,
    },
    {
      title: '模型描述',
      dataIndex: 'modelDesc',
      key: 'modelDesc',
      ellipsis: true,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '发布状态',
      dataIndex: 'modelStats',
      key: 'modelStats',
      ellipsis: true,
      render: (text: string, record: API.ModelPackVO) => (
        <Badge {...(statusMap[text as ModelStatus] as BadgeProps)}></Badge>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      sorter: true,
      ellipsis: true,
      render: (gmtCreate: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: gmtCreate,
          }}
        >
          {formatTimestamp(gmtCreate as string)}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: string, record: API.ModelPackVO) => {
        return renderButtons(record);
      },
    },
  ];

  return (
    <div className={styles.modelListContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Space size="middle">
            <Input
              placeholder="搜索模型名称/ID"
              onChange={(e) => modelService.searchModel(e)}
              style={{ width: 200 }}
              suffix={
                <SearchOutlined
                  style={{
                    color: '#aaa',
                  }}
                />
              }
            />

            <Select
              style={{ width: 180 }}
              defaultValue=""
              onChange={(value) => modelService.modelStatusFilter(value)}
              options={ModelStatusSelectOptions}
            />
          </Space>
          <div>
            <Button
              type="primary"
              onClick={() => {
                viewInstance.setVisible(true);
                viewInstance.setModelId();
              }}
              disabled={isP2p && modelService.isProjectArchive}
            >
              新建模型发布
            </Button>
          </div>
        </div>
        <div className={styles.table}>
          <Table
            columns={columns}
            dataSource={modelService.modelList}
            loading={modelService.loading}
            onChange={(pagination, filters, sorter) =>
              modelService.modelTimeFilter(
                filters,
                sorter as { order: string; field: string },
              )
            }
            pagination={{
              total: modelService.totalNum || 1,
              current: modelService.pageNumber,
              pageSize: modelService.pageSize,
              onChange: (page, pageSize) => {
                modelService.pageNumber = page;
                modelService.pageSize = pageSize;
              },
              size: 'default',
              showSizeChanger: true,
            }}
            rowKey={(record) => record.modelId as string}
          />
        </div>
        <ModelReleaseModal
          visible={viewInstance.visible}
          close={() => {
            viewInstance.setVisible(false);
          }}
          modelId={viewInstance.modelId}
        />
        <ModelReleaseInfoModal
          visible={viewInstance.modelReleaseInfoVisible}
          close={() => {
            viewInstance.setModelReleaseInfoVisible(false);
          }}
          data={viewInstance.modelReleaseInfo}
        />
        <ModelDetailModal
          visible={viewInstance.modelDetailVisible}
          close={() => {
            viewInstance.setModelDetailVisible(false);
          }}
          data={{
            ...viewInstance.modelReleaseInfo,
            projectId: projectId,
            projectMode: modelService.projectList.find(
              (item) => item.projectId === projectId,
            )?.computeMode,
          }}
        />
      </div>
    </div>
  );
};

export class ModelListView extends Model {
  visible = false;

  modelReleaseInfoVisible = false;

  modelDetailVisible = false;

  modelId: string | undefined = undefined;

  modelReleaseInfo: API.ModelPackVO = {};

  setVisible = (visible: boolean) => {
    this.visible = visible;
  };

  setModelReleaseInfoVisible = (visible: boolean) => {
    this.modelReleaseInfoVisible = visible;
  };

  setModelDetailVisible = (visible: boolean) => {
    this.modelDetailVisible = visible;
  };

  setModelId = (modelId?: string) => {
    this.modelId = modelId;
  };

  setModelReleaseInfo = (record: API.ModelPackVO) => {
    this.modelReleaseInfo = record;
  };
}
