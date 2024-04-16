import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, Popconfirm, Space, Spin, message } from 'antd';
import { parse } from 'query-string';
import React from 'react';

import { EllipsisText } from '@/components/text-ellipsis.tsx';
import { useModel } from '@/util/valtio-helper';

import {
  ListItemTitleMap,
  MessageItemType,
  MessageStateTagWrap,
} from '../component/common';
import { MessageActiveTabType, MessageService, StatusEnum } from '../message.service';

import styles from './index.less';
import { NodeAuthInfo, ProjectInviteInfo, TeeDownloadInfo } from './info-content';

export const InfoContentRender = (props: { item: any }) => {
  const { item } = props;
  if (!item.type) return <>{'--'}</>;
  const ContentMap = React.useMemo(
    () => ({
      [MessageItemType.NODE_ROUTE]: <NodeAuthInfo info={item} />,
      [MessageItemType.TEE_DOWNLOAD]: <TeeDownloadInfo info={item} />,
      [MessageItemType.PROJECT_ARCHIVE]: <ProjectInviteInfo info={item} />,
      [MessageItemType.PROJECT_NODE_ADD]: <ProjectInviteInfo info={item} />,
    }),
    [item],
  );
  return ContentMap[item.type as MessageItemType];
};

export const MessageInfoModal = ({
  open,
  onClose,
  data,
  activeTab,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  data: API.MessageVO;
  activeTab: string;
  onOk?: () => void;
}) => {
  const service = useModel(MessageService);
  const { messageDetail, messageInfoLoading } = service;
  const [comment, setComment] = React.useState('');
  const { nodeId } = parse(window.location.search);

  const getMessageInfo = () => {
    if (!data.voteID || !nodeId) return;
    service.getMessageDetail({
      nodeID: nodeId as string,
      voteID: data.voteID,
      isInitiator: activeTab === MessageActiveTabType.APPLY ? true : false,
      voteType: data.type,
    });
  };

  React.useEffect(() => {
    if (open) {
      getMessageInfo();
    }
  }, [data.voteID, open]);

  const processMessage = async (action: StatusEnum) => {
    const { status } = await service.process({
      action,
      reason: comment,
      voteID: data.voteID,
      voteParticipantID: nodeId as string,
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      message.success('处理成功');
      onOk && onOk();
      onClose && onClose();
      // getMessageInfo();
    }
  };

  const itemObj = ListItemTitleMap[data?.type as MessageItemType];

  return (
    <Drawer
      title={
        <div style={{ width: 400 }}>
          <Space>
            <EllipsisText style={{ maxWidth: 180, width: '100% !important' }}>
              {data.messageName}
            </EllipsisText>
            <div>{itemObj.suffix}</div>
            <MessageStateTagWrap
              label={
                activeTab === MessageActiveTabType.PROCESS ? '本方状态' : '当前状态'
              }
              status={(data?.status as StatusEnum) || StatusEnum.PROCESS}
            />
          </Space>
        </div>
      }
      mask={false}
      placement="right"
      onClose={onClose}
      open={open}
      closable={false}
      getContainer={false}
      width={560}
      className={styles.messageInfDrawer}
      extra={
        <CloseOutlined
          style={{ fontSize: 12 }}
          onClick={() => {
            onClose();
          }}
        />
      }
      footer={
        activeTab === MessageActiveTabType.PROCESS &&
        messageDetail.status === StatusEnum.PROCESS ? (
          <Space style={{ float: 'right' }}>
            <Popconfirm
              title="你确定要拒绝吗？"
              placement="top"
              description={
                <Input.TextArea
                  maxLength={50}
                  placeholder="请输50字符以内的理由"
                  allowClear
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              }
              okText="拒绝"
              cancelText="取消"
              okButtonProps={{
                danger: true,
                ghost: true,
              }}
              onConfirm={async () => {
                processMessage(StatusEnum.REJECT);
                setComment('');
              }}
              onCancel={() => setComment('')}
            >
              <Button
                loading={service.processLoading.rejectLoading}
                disabled={service.processLoading.type === StatusEnum.AGREE}
              >
                拒绝
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={() => processMessage(StatusEnum.AGREE)}
              loading={service.processLoading.agreeLoading}
              disabled={service.processLoading.type === StatusEnum.REJECT}
            >
              同意
            </Button>
          </Space>
        ) : null
      }
    >
      <Spin spinning={messageInfoLoading}>
        <InfoContentRender item={messageDetail} />
      </Spin>
    </Drawer>
  );
};
