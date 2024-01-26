import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Descriptions, Drawer, Space, Spin, Tooltip } from 'antd';
import { useState } from 'react';
import React from 'react';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { PopoverCopy } from '@/components/popover-copy';
import { EllipsisText } from '@/components/text-ellipsis.tsx';
import { EllipsisMiddle } from '@/components/text-ellipsis.tsx';
import { useModel } from '@/util/valtio-helper';

import { formatTimestamp } from '../dag-result/utils';
import { NodeState } from '../managed-node-list';
import { NodeStateText } from '../managed-node-list';

import { CooperativeNodeService } from './cooperative-node.service';
import { DeleteCooperativeNodeModal } from './delete-modal';
import { EditCooperativeNodeModal } from './edit-modal';
import styles from './index.less';

export const CooperativeNodeDetailDrawer = ({
  open,
  onClose,
  data,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  data: API.NodeRouterVO;
  onOk: () => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const service = useModel(CooperativeNodeService);

  const { cooperativeNodeDetail, cooperativeNodeLoading } = service;

  React.useEffect(() => {
    if (open) {
      if (!data.routeId) return;
      service.getCooperativeNodeDetail(data.routeId);
    }
  }, [data.routeId, open]);

  return (
    <Drawer
      title={
        <div style={{ width: 400 }}>
          <EllipsisMiddle suffixCount={12}>{`「 ${
            cooperativeNodeDetail?.srcNode?.nodeName || ''
          } 」 详情`}</EllipsisMiddle>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      closable={false}
      width={560}
      className={styles.cooperativeNodeDetailDrawer}
      extra={
        <CloseOutlined
          style={{ fontSize: 12 }}
          onClick={() => {
            onClose();
          }}
        />
      }
      footer={
        <Space style={{ float: 'right' }}>
          {cooperativeNodeDetail?.dstNode?.type === 'embedded' &&
          cooperativeNodeDetail?.srcNode?.type === 'embedded' ? null : (
            <Button
              onClick={() => {
                setShowEditModal(true);
              }}
            >
              编辑
            </Button>
          )}
          {cooperativeNodeDetail?.dstNode?.type === 'embedded' &&
          cooperativeNodeDetail?.srcNode?.type === 'embedded' ? null : (
            <Tooltip
              title={
                cooperativeNodeDetail.isProjectJobRunning &&
                hasAccess({ type: [Platform.AUTONOMY] })
                  ? '有正在运行中的任务,不可删除'
                  : ''
              }
            >
              <Button
                danger
                onClick={() => {
                  setShowDeleteModal(true);
                }}
                disabled={
                  hasAccess({ type: [Platform.AUTONOMY] })
                    ? cooperativeNodeDetail.isProjectJobRunning
                    : false
                }
              >
                删除
              </Button>
            </Tooltip>
          )}
        </Space>
      }
    >
      <Spin spinning={cooperativeNodeLoading}>
        <div className={styles.baseTitle}>合作节点基本信息</div>
        <div className={styles.baseContent}>
          <Descriptions column={1} className={styles.descriptionClass}>
            {hasAccess({ type: [Platform.AUTONOMY] }) && (
              <Descriptions.Item label="管控节点ID">
                <EllipsisText>
                  {cooperativeNodeDetail?.srcNode?.masterNodeId}
                </EllipsisText>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="计算节点名">
              <EllipsisText>{cooperativeNodeDetail?.srcNode?.nodeName}</EllipsisText>
            </Descriptions.Item>
            <Descriptions.Item label="计算节点ID">
              <EllipsisText>{cooperativeNodeDetail?.srcNode?.nodeId}</EllipsisText>
            </Descriptions.Item>
            <Descriptions.Item label="节点通讯地址">
              <EllipsisText>{cooperativeNodeDetail?.srcNode?.netAddress}</EllipsisText>
            </Descriptions.Item>
            {hasAccess({ type: [Platform.AUTONOMY] }) && (
              <>
                <Descriptions.Item label="公钥">
                  <PopoverCopy
                    title="节点公钥"
                    icon="复制公钥"
                    copyText={cooperativeNodeDetail?.srcNode?.certText}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="节点认证码">
                  <PopoverCopy
                    title="节点认证码"
                    icon="复制认证码"
                    copyText={cooperativeNodeDetail?.srcNode?.nodeAuthenticationCode}
                  />
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </div>
        <Descriptions column={1} className={styles.descriptionClass}>
          <Descriptions.Item label="本方通讯地址">
            <EllipsisText>{cooperativeNodeDetail.dstNetAddress}</EllipsisText>
          </Descriptions.Item>
          <Descriptions.Item label="发起合作节点">
            <EllipsisText>{cooperativeNodeDetail.srcNode?.nodeName}</EllipsisText>
          </Descriptions.Item>
          <Descriptions.Item label="通讯状态">
            <div>
              <Badge
                status={
                  NodeStateText[
                    (cooperativeNodeDetail?.status as NodeState) || NodeState.UNKNOWN
                  ].icon
                }
                text={
                  NodeStateText[
                    (cooperativeNodeDetail?.status as NodeState) || NodeState.UNKNOWN
                  ].text
                }
              />
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={async () => {
                  await service.refreshNode(data.routeId || '');
                  service.getCooperativeNodeDetail(data.routeId || '');
                  onOk();
                }}
                style={{
                  height: 22,
                  padding: '0 16px',
                }}
              >
                刷新
              </Button>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="合作时间">
            <EllipsisText>
              {formatTimestamp(cooperativeNodeDetail.gmtCreate || '')}
            </EllipsisText>
          </Descriptions.Item>
          <Descriptions.Item label="编辑时间">
            <EllipsisText>
              {formatTimestamp(cooperativeNodeDetail.gmtModified || '')}
            </EllipsisText>
          </Descriptions.Item>
        </Descriptions>
      </Spin>
      <EditCooperativeNodeModal
        open={showEditModal}
        data={data}
        onClose={() => setShowEditModal(false)}
        onOk={() => service.getCooperativeNodeDetail(data.routeId || '')}
      />
      <DeleteCooperativeNodeModal
        open={showDeleteModal}
        data={data}
        onClose={() => setShowDeleteModal(false)}
        onOk={() => {
          onOk();
          onClose();
        }}
      />
    </Drawer>
  );
};

const RouteTypeText = {
  FullDuplex: '双向',
  HalfDuplex: '单向',
};
