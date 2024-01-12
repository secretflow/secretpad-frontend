import { ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import {
  Typography,
  Drawer,
  Button,
  Space,
  message,
  Tooltip,
  Descriptions,
  Spin,
  Popover,
  Tag,
  Badge,
} from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import React from 'react';

import { confirmDeleteInput } from '@/components/comfirm-delete';
import { EllipsisText } from '@/components/text-ellipsis.tsx';
import { formatTimestamp } from '@/modules/dag-result/utils';
import {
  get,
  deleteNode,
  refresh,
  token,
  newToken,
} from '@/services/secretpad/NodeController';
import { Model, useModel } from '@/util/valtio-helper';

import type { BadgeType } from '../index';
import { NodeState, NodeStateText } from '../index';

import styles from './index.less';

const { Paragraph } = Typography;

enum DomainCertConfigEnum {
  // configured
  configured = 'configured',
  // unConfigured
  unconfirmed = 'unconfirmed',
}

interface ICreateProjectModal {
  visible: boolean;
  close: () => void;
  data?: string;
  callBack?: () => void;
}

export const NodeInfoDrawer = ({
  visible,
  data,
  close,
  callBack,
}: ICreateProjectModal) => {
  const [messageApi, contextHolder] = message.useMessage();
  const viewInstance = useModel(NodeInfoModel);

  const { nodeInfo, nodeInfoLoading, refreshStatus, tokenInfo } = viewInstance;

  React.useEffect(() => {
    if (visible) {
      if (!data) return;
      viewInstance.getNodeInfo(data);
    }
  }, [data, visible]);

  const handleDelete = () => {
    confirmDeleteInput({
      name: nodeInfo.nodeName || '',
      description: '',
      onOk: () => {
        viewInstance.deleteNode(messageApi);
        close();
        callBack && callBack();
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Drawer
        closeIcon={false}
        className={styles.nodeDrawer}
        title={
          <div className={styles.drawerTitle}>
            <div className={styles.drawerTitleName}>
              <span className={styles.title}>
                <div>「</div>
                <div style={{ flex: 1 }}>
                  <EllipsisText style={{ maxWidth: 200, width: '100%' }}>{`${
                    nodeInfo?.nodeName || ''
                  }`}</EllipsisText>
                </div>
                <div>」详情</div>
              </span>
              <Badge
                status={
                  NodeStateText[
                    (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN
                  ].icon
                }
                text={
                  NodeStateText[
                    (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN
                  ].text
                }
                className={styles.badge}
              />
            </div>
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={() => {
                refreshStatus(messageApi);
                callBack && callBack();
              }}
              style={{ marginRight: 9 }}
            >
              刷新
            </Button>
          </div>
        }
        extra={<CloseOutlined onClick={() => close()} style={{ fontSize: 12 }} />}
        destroyOnClose
        open={visible}
        onClose={close}
        mask={false}
        footer={
          <Space style={{ float: 'right' }}>
            {/* {nodeInfo?.type !== 'embedded' && (
              <Button onClick={viewInstance.showEditNode} disabled={nodeInfoLoading}>
                编辑
              </Button>
            )} */}
            {nodeInfo?.nodeStatus !== NodeState.READY &&
              nodeInfo?.type !== 'embedded' && (
                <Button danger disabled={nodeInfoLoading} onClick={handleDelete}>
                  删除
                </Button>
              )}
          </Space>
        }
        width={560}
      >
        <Spin spinning={nodeInfoLoading}>
          <div className={styles.baseTitle}>基本信息</div>
          <div className={styles.baseContent}>
            <Descriptions column={1}>
              <Descriptions.Item label="计算节点名">
                {nodeInfo.nodeName}
              </Descriptions.Item>
              <Descriptions.Item label="计算节点ID">
                <EllipsisText>{nodeInfo.nodeId}</EllipsisText>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                <EllipsisText>{formatTimestamp(nodeInfo.gmtCreate || '')}</EllipsisText>
              </Descriptions.Item>
            </Descriptions>
          </div>
          <Descriptions column={1}>
            <Descriptions.Item label="部署令牌">
              <Popover
                placement="topLeft"
                title="部署令牌"
                onOpenChange={() => viewInstance.getToken()}
                overlayClassName={styles.tokenPopover}
                content={
                  <Spin spinning={viewInstance.tokenLoading}>
                    <div className={styles.contentName}>
                      <Tooltip title={tokenInfo?.token}>
                        <span className={styles.name}>{tokenInfo?.token}</span>
                      </Tooltip>
                      {/* TODO: tokenInfo 判断 */}
                      <Tag
                        color={
                          tokenInfo.tokenStatus === TokenStatus.USED
                            ? 'default'
                            : 'processing'
                        }
                      >
                        {tokenInfo.tokenStatus === TokenStatus.USED
                          ? '已使用'
                          : '未使用'}
                      </Tag>
                    </div>
                    <div className={styles.tokenContent}>
                      <Paragraph
                        copyable={{
                          icon: '复制',
                          text: `${tokenInfo.token}`,
                        }}
                      />
                      <div
                        className={styles.spanClick}
                        onClick={viewInstance.getNewToken}
                      >
                        重新生成
                      </div>
                    </div>
                  </Spin>
                }
                // trigger="click"
              >
                <span className={styles.spanClick}>查看</span>
              </Popover>
            </Descriptions.Item>
            {/* <Descriptions.Item label="节点公钥">
              {!nodeInfo.publicKey ? (
                <Tooltip title="节点部署成功后自动获取" placement="right">
                  <span className={styles.disableText}>查看</span>
                </Tooltip>
              ) : (
                <Popover
                  placement="left"
                  overlayClassName={styles.publicKeyPopover}
                  title={
                    <div className={styles.publicTitle}>
                      <span>节点公钥</span>
                      <Paragraph
                        copyable={{
                          icon: '复制公钥',
                          text: `${nodeInfo.publicKey}`,
                        }}
                        style={{ color: '#1677FF' }}
                      ></Paragraph>
                    </div>
                  }
                  content={
                    <>
                      <div className={styles.publicKey}>{nodeInfo.publicKey}</div>
                    </>
                  }
                  trigger="click"
                >
                  <span className={styles.spanClick}>查看</span>
                </Popover>
              )}
            </Descriptions.Item> */}
            <Descriptions.Item label="节点证书">
              {nodeInfo.cert && nodeInfo.cert === DomainCertConfigEnum.configured ? (
                '已配置'
              ) : (
                <Tooltip title="节点部署成功后即可配置完成" placement="right">
                  <span className={styles.disableText}>待配置</span>
                </Tooltip>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      </Drawer>
    </>
  );
};

export class NodeInfoModel extends Model {
  nodeInfoLoading = false;

  showEditNodeModal = false;

  tokenLoading = true;

  nodeInfo: API.NodeVO = {};

  tokenInfo: API.NodeTokenVO = {};

  showEditNode = () => {
    this.showEditNodeModal = true;
  };

  getNodeInfo = async (nodeId: string) => {
    this.nodeInfoLoading = true;
    const info = await get({
      nodeId,
    });
    if (info.data) {
      this.nodeInfo = info.data;
    }
    this.nodeInfoLoading = false;
  };

  refreshNodeInfo = async () => {
    if (!this.nodeInfo.nodeId) return;
    this.getNodeInfo(this.nodeInfo.nodeId);
  };

  deleteNode = async (messageApi: MessageInstance) => {
    if (!this.nodeInfo.nodeId) return;
    this.nodeInfoLoading = true;
    const { status } = await deleteNode({
      nodeId: this.nodeInfo.nodeId,
    });
    if (status && status.code !== 0) {
      messageApi.error(status.msg);
      return;
    }
    messageApi.success(`「${this.nodeInfo?.nodeName}」删除成功！`);
    this.nodeInfoLoading = false;
  };

  refreshStatus = async (messageApi: MessageInstance) => {
    if (!this.nodeInfo.nodeId) return;
    await refresh({
      nodeId: this.nodeInfo.nodeId,
    });
    messageApi.success(`「${this.nodeInfo?.nodeName}」刷新成功！`);
    this.refreshNodeInfo();
  };

  getToken = async () => {
    if (!this.nodeInfo.nodeId) return;
    this.tokenLoading = true;
    const tokenInfo = await token({
      nodeId: this.nodeInfo.nodeId,
    });
    this.tokenLoading = false;
    this.tokenInfo = tokenInfo?.data || {};
  };

  getNewToken = async () => {
    if (!this.nodeInfo.nodeId) return;
    this.tokenLoading = true;
    const tokenInfo = await newToken({
      nodeId: this.nodeInfo.nodeId,
    });
    this.tokenLoading = false;
    this.tokenInfo = tokenInfo?.data || {};
  };

  editNode = async () => {
    this.showEditNodeModal = false;
  };
}

export enum TokenStatus {
  'USED' = 'used',
  'UNUSED' = 'unused',
}

export enum RouteStatus {
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
  PENDING = 'Pending',
  UNKNOWN = 'Unknown',
}

export const RouteStateText: Record<RouteStatus, { icon: BadgeType; text: string }> = {
  [RouteStatus.SUCCEEDED]: {
    icon: 'success',
    text: '可用',
  },
  [RouteStatus.FAILED]: {
    icon: 'error',
    text: '不可用',
  },
  [RouteStatus.PENDING]: {
    icon: 'default',
    text: '创建中',
  },
  [RouteStatus.UNKNOWN]: {
    icon: 'error',
    text: '未知状态',
  },
};
