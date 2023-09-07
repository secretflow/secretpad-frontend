import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Input, message, Space, Table, Typography, Tag } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ColumnsType } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import type { ChangeEvent } from 'react';

import { confirmDeleteInput } from '@/components/comfirm-delete';
import { NodeService } from '@/modules/node';
import {
  page as requestList,
  deleteNode,
  refresh,
} from '@/services/secretpad/NodeController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { formatTimestamp } from '../dag-result/utils';

import { CreateNodeModal } from './create-node/create-node.view';
import styles from './index.less';
import { NodeInfoDrawer } from './node-info/node-info.view';

export const ManagedNodeListComponent = () => {
  const viewInstance = useModel(ManagedNodeView);
  const [messageApi, contextHolder] = message.useMessage();
  const { showCreateNode } = viewInstance;
  const columns: ColumnsType<API.NodeVO> = [
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      key: 'nodeName',
      width: '20%',
      render: (text: string, record) => {
        return (
          <>
            <Typography.Text
              onClick={() => viewInstance.showDrawer(record.nodeId as string)}
              style={{ color: '#1677ff', cursor: 'pointer' }}
              ellipsis={{
                tooltip: text,
              }}
            >
              {record.type === 'embedded' && <Tag color="cyan">内置</Tag>}
              {text}
            </Typography.Text>
            <div>
              <Typography.Text
                className={styles.idText}
                ellipsis={{
                  tooltip: record.nodeId,
                }}
              >
                {record.nodeId}
              </Typography.Text>
            </div>
          </>
        );
      },
    },
    {
      title: '节点状态',
      dataIndex: 'nodeStatus',
      key: 'nodeStatus',
      width: '15%',
      render: (nodeStatus: NodeState, record) => (
        <Space>
          <Badge
            status={NodeStateText[nodeStatus || NodeState.UNKNOWN].icon}
            text={NodeStateText[nodeStatus || NodeState.UNKNOWN].text}
          />
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={() => {
              viewInstance.refreshNodeStatus(
                messageApi,
                record.nodeId,
                record.nodeName,
              );
            }}
          >
            刷新
          </Button>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'gmtCreate',
      width: '15%',
      sorter: true,
      ellipsis: true,
      render: (gmtCreate: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: `${formatTimestamp(gmtCreate)}`,
          }}
        >
          {formatTimestamp(gmtCreate)}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_, record) => {
        return (
          <div className={styles.action}>
            <Button
              type="link"
              onClick={() => {
                const a = document.createElement('a');
                a.href = `/node?nodeId=${record.nodeId}`;
                a.target = '_blank';
                a.click();
              }}
            >
              进入节点
            </Button>
            {record.type !== 'embedded' && (
              <>
                {/* <Button
                  type="link"
                  onClick={() => viewInstance.showEditNode(record.nodeId as string)}
                >
                  编辑
                </Button> */}
                {/* // TODO: 判断删除显示 */}
                {/* <Tooltip title={'有正在运行中的任务，不可删除'} placement="left"> */}
                <Button
                  type="link"
                  disabled={false}
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
                {/* </Tooltip> */}
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleDelete = (record: API.NodeVO) => {
    confirmDeleteInput({
      name: record.nodeName || '',
      description: '',
      onOk: () => {
        viewInstance.deleteNode(record.nodeName || '', record.nodeId || '', messageApi);
      },
    });
  };

  return (
    <div className={styles.nodeList}>
      <div className={styles.nodeListHeader}>
        <Space size="middle">
          <Input
            placeholder="搜索节点名/ID/通讯地址"
            onChange={(e) => viewInstance.searchNode(e)}
            style={{ width: 200 }}
            suffix={
              <SearchOutlined
                style={{
                  color: '#aaa',
                }}
              />
            }
          />
        </Space>
        <div>
          <Button type="primary" onClick={showCreateNode}>
            注册新节点
          </Button>
          <Button
            type="link"
            onClick={() => {
              const url =
                'https://www.secretflow.org.cn/docs/quickstart/fn9h9yqoievouz2a';
              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.click();
            }}
          >
            操作手册
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <Table
          loading={viewInstance.loading}
          dataSource={viewInstance.nodeList}
          columns={columns}
          onChange={(pagination, filters, sorter) =>
            viewInstance.typeFilter(filters, sorter as { order: string; field: string })
          }
          pagination={{
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
            },
            size: 'default',
            showSizeChanger: true,
          }}
          size="small"
          rowKey={(record) => record.nodeId as string}
        />
      </div>
      <CreateNodeModal
        visible={viewInstance.showCreateNodeModel}
        close={() => (viewInstance.showCreateNodeModel = false)}
        onOk={() => viewInstance.getNodeList()}
      />
      <NodeInfoDrawer
        visible={viewInstance.showDetailDrawer}
        data={viewInstance.drawerId}
        close={() => (viewInstance.showDetailDrawer = false)}
        callBack={() => viewInstance.getNodeList()}
      />
      {contextHolder}
    </div>
  );
};

export class ManagedNodeView extends Model {
  nodeList: API.NodeVO[] = [];

  nodeListDisplay: API.NodeResultsVO[] = [];

  search = '';

  typesFilter: string[] = [];

  sortRule = {};

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  loading = false;

  searchDebounce: number | undefined = undefined;

  showDetailDrawer = false;
  drawerId = '';

  showCreateNodeModel = false;

  showEditNodeModel = false;

  nodeService = getModel(NodeService);

  onViewMount() {
    this.getNodeList();
  }

  async getNodeList() {
    this.loading = true;
    const list = await requestList({
      page: this.pageNumber,
      size: this.pageSize,
      search: this.search,
      sort: this.sortRule,
    });
    this.loading = false;
    this.totalNum = list?.data?.total || 0;
    this.nodeList = list?.data?.list || [];
    this.nodeListDisplay = this.nodeList;
  }

  searchNode = (e: ChangeEvent<HTMLInputElement>) => {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getNodeList();
    }, 300) as unknown as number;
  };

  typeFilter = (
    _: Record<string, FilterValue | null>,
    sort: { order: string; field: string },
  ) => {
    if (sort?.order) {
      this.sortRule = {
        [sort.field]: sort.order === 'ascend' ? 'ASC' : 'DESC',
      };
    } else {
      this.sortRule = {};
    }
    this.getNodeList();
  };

  showDrawer = (id: string) => {
    this.drawerId = id;
    this.showDetailDrawer = true;
  };

  showCreateNode = () => {
    this.showCreateNodeModel = true;
  };

  showEditNode = (id: string) => {
    this.drawerId = id;
    this.showEditNodeModel = true;
  };

  deleteNode = async (
    nodeName: string,
    nodeId: string,
    messageApi: MessageInstance,
  ) => {
    const { status } = await deleteNode({ nodeId });
    if (status && status.code !== 0) {
      messageApi.error(status.msg);
      return;
    }
    messageApi.success(`「${nodeName}」删除成功！`);
    this.getNodeList();
  };

  refreshNodeStatus = async (
    messageApi: MessageInstance,
    nodeId?: string,
    nodeName?: string,
  ) => {
    if (!nodeId || !nodeName) return;
    this.showDetailDrawer = false;
    await refresh({ nodeId });
    messageApi.success(`「${nodeName}」刷新成功！`);
    this.getNodeList();
  };
}

export enum NodeState {
  READY = 'Ready',
  NOTREADY = 'NotReady',
  PENDING = 'Pending',
  UNKNOWN = 'Unknown',
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
}

export type BadgeType = 'success' | 'error' | 'default';

export const NodeStateText: Record<NodeState, { icon: BadgeType; text: string }> = {
  [NodeState.READY]: {
    icon: 'success',
    text: '可用',
  },
  [NodeState.NOTREADY]: {
    icon: 'error',
    text: '不可用',
  },
  [NodeState.PENDING]: {
    icon: 'default',
    text: '创建中',
  },
  [NodeState.UNKNOWN]: {
    icon: 'error',
    text: '不可用',
  },
  [NodeState.SUCCEEDED]: {
    icon: 'success',
    text: '可用',
  },
  [NodeState.FAILED]: {
    icon: 'error',
    text: '不可用',
  },
};
