import { Divider, Space, Tag, Tooltip } from 'antd';
import React from 'react';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { formatTimestamp } from '@/modules/dag-result/utils';

import type { NodeStatusList } from '../message.service';
import { MessageActiveTabType, MessageState, StatusEnum } from '../message.service';
import { StatusTextObj } from '../message.service';

import {
  GetReasonTooltip,
  ListItemTitleMap,
  MessageItemType,
  MessageStateTagWrap,
} from './common';
import styles from './index.less';

export const ListItemTitleRender = (props: {
  item: API.MessageVO;
  activeTab: MessageActiveTabType;
  showInfoDrawer: (item: API.MessageVO) => void;
  filterState: MessageState;
}) => {
  const { item, showInfoDrawer, activeTab, filterState } = props;
  if (!item.type) return <>{'--'}</>;
  const itemObj = ListItemTitleMap[item?.type as MessageItemType];
  if (!itemObj) return <>{'--'}</>;
  return (
    <Space>
      <Tag
        className={styles.listItemTitleTypeTag}
        color={itemObj.tagColor}
        icon={itemObj.tagIcon}
        style={itemObj.style}
      >
        {itemObj.tagText}
      </Tag>
      <Space className={styles.listItemTitleName} onClick={() => showInfoDrawer(item)}>
        {item.type === MessageItemType.PROJECT_NODE_ADD ? (
          <>
            {item.initiatingTypeMessage?.initiatorNodeName && (
              <div>
                来自
                {`${item.initiatingTypeMessage.initiatorNodeName}`}
                机构的
              </div>
            )}
            {item.messageName}
            <div>{itemObj.suffix}</div>
          </>
        ) : (
          <>
            <div>{item.messageName}</div>
            <div>{itemObj.suffix}</div>
          </>
        )}
      </Space>
      {activeTab === MessageActiveTabType.PROCESS &&
      filterState === MessageState.PENDING ? null : (
        <Tooltip
          title={
            item.status === StatusEnum.REJECT
              ? GetReasonTooltip(item.initiatingTypeMessage?.partyVoteStatuses)
              : null
          }
        >
          <div>
            <MessageStateTagWrap
              label={
                activeTab === MessageActiveTabType.PROCESS ? '本方状态' : '当前状态'
              }
              status={item.status as StatusEnum}
            />
          </div>
        </Tooltip>
      )}
    </Space>
  );
};

export const ListItemDescRender = (props: {
  item: API.MessageVO;
  activeTab: MessageActiveTabType;
}) => {
  const { item, activeTab } = props;
  if (!item.type) return <>{'--'}</>;
  const PopoverMap = React.useMemo(
    () => ({
      [MessageItemType.TEE_DOWNLOAD]: (
        <DownloadDesc item={item} activeTab={activeTab} />
      ),
      [MessageItemType.NODE_ROUTE]: <CommonDesc item={item} />,
      [MessageItemType.PROJECT_NODE_ADD]: (
        <DownloadDesc item={item} activeTab={activeTab} />
      ),
      [MessageItemType.PROJECT_ARCHIVE]: (
        <DownloadDesc item={item} activeTab={activeTab} />
      ),
    }),
    [item],
  );
  return PopoverMap[item.type as MessageItemType];
};

export const DownloadDesc = (props: {
  item: API.MessageVO;
  activeTab?: MessageActiveTabType;
}) => {
  const isP2p = hasAccess({ type: [Platform.AUTONOMY] });
  const { item, activeTab = MessageActiveTabType.PROCESS } = props;
  return (
    <Space>
      <span className={styles.listItemDescText}>
        {formatTimestamp(item?.createTime || '')}
      </span>
      {activeTab === MessageActiveTabType.APPLY && (
        <>
          <Divider
            type="vertical"
            style={{ borderInlineStart: '1px solid rgba(5, 5, 5, 0.2)' }}
          />

          <span className={styles.listItemDescText}>
            {isP2p ? `合作机构` : `合作节点`} :{' '}
          </span>
          {(item?.initiatingTypeMessage?.partyVoteStatuses || []).map(
            (node: NodeStatusList, index: number) => (
              <span key={node.nodeID} className={styles.listItemDescText}>{`${
                index !== 0 ? '、' : ''
              } ${isP2p ? node.participantName : node.nodeName}  (${
                StatusTextObj[node.action as keyof typeof StatusTextObj]?.text
              })`}</span>
            ),
          )}
        </>
      )}
    </Space>
  );
};

export const CommonDesc = (props: { item: API.MessageVO }) => {
  const { item } = props;
  return (
    <Space>
      <span className={styles.listItemDescText}>
        {formatTimestamp(item?.createTime || '')}
      </span>
    </Space>
  );
};
