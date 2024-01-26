import Icon, {
  DownloadOutlined,
  HddOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';

import { ReactComponent as projectManager } from '@/assets/project-manager.svg';
import { EllipsisText } from '@/components/text-ellipsis.tsx';

import { StatusTextObj } from '../message.service';
import type { StatusEnum } from '../message.service';

import styles from './index.less';

export enum MessageItemType {
  // TEE结果下载
  TEE_DOWNLOAD = 'TEE_DOWNLOAD',
  // 节点授权邀约
  NODE_ROUTE = 'NODE_ROUTE',
  // 项目归档
  PROJECT_ARCHIVE = 'PROJECT_ARCHIVE',
  // 项目邀约
  PROJECT_NODE_ADD = 'PROJECT_CREATE',
}

export const ListItemTitleMap = {
  [MessageItemType.TEE_DOWNLOAD]: {
    // tagColor: 'orange',
    tagIcon: <DownloadOutlined style={{ color: '#FF4D4F' }} />,
    tagText: '结果下载',
    suffix: '下载申请',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FFF 0%, #FEFFE6 98%)',
    },
  },
  [MessageItemType.NODE_ROUTE]: {
    // tagColor: 'cyan',
    tagIcon: <HddOutlined style={{ color: '#13A8A8' }} />,
    tagText: '节点合作',
    suffix: '授权邀约',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FDFFFF 0%, #E6FFFB 100%)',
    },
  },
  [MessageItemType.PROJECT_NODE_ADD]: {
    // tagColor: 'orange',
    tagIcon: <Icon component={projectManager} style={{ color: '#1677ff' }} />,
    tagText: '项目邀约',
    suffix: '邀约',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FCFEFF 0%, #E6F4FF 100%)',
    },
  },
  [MessageItemType.PROJECT_ARCHIVE]: {
    // tagColor: 'orange',
    tagIcon: <PoweroffOutlined style={{ color: '#FF4D4F' }} />,
    tagText: '项目归档',
    suffix: '归档',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F0 100%)',
    },
  },
};

export const MessageTypeTag = ({ type }: { type: MessageItemType }) => {
  const itemObj = ListItemTitleMap[type];
  if (!type) return <>{'--'}</>;
  if (!itemObj) return <>{'--'}</>;
  return (
    <Tag
      className={styles.listItemTitleTypeTag}
      // color={itemObj.tagColor}
      icon={itemObj.tagIcon}
      style={itemObj.style}
    >
      {itemObj.tagText}
    </Tag>
  );
};

export const MessageStateTag = ({
  label,
  text,
  labelStyle,
  textStyle,
}: {
  label: string;
  text: string;
  labelStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
}) => {
  return (
    <div className={styles.messageStateTagContent}>
      <Tag className={styles.label} style={labelStyle}>
        {label}
      </Tag>
      <Tag className={styles.statusText} style={textStyle}>
        {text}
      </Tag>
    </div>
  );
};

export const MessageStateTagWrap = ({
  status,
  label,
}: {
  label: string;
  status: keyof typeof StatusTextObj;
}) => {
  return (
    <MessageStateTag
      label={label}
      text={StatusTextObj[status]?.text}
      labelStyle={StatusTextObj[status]?.labelStyle}
      textStyle={StatusTextObj[status]?.textStyle}
    />
  );
};

export const NodeStatusList = ({ list }: { list: NodeStatusList[] }) => {
  const { nodeId: userID } = parse(window.location.search);
  return (
    <>
      {list.map((item) => (
        <div className={styles.nodeStatusListContent} key={item.nodeID}>
          <EllipsisText
            style={{ minWidth: 40, maxWidth: 100, width: '100% !important' }}
          >
            {item.nodeName}
          </EllipsisText>
          {userID === item.nodeID ? (
            <MessageStateTagWrap label={'本方状态'} status={item.action} />
          ) : (
            <span className={classNames(styles.text, styles.action)}>{`(${
              StatusTextObj[item.action]?.text
            })`}</span>
          )}
          {item.reason && <span className={styles.text}>拒绝原因：{item.reason}</span>}
        </div>
      ))}
    </>
  );
};

export const GetReasonTooltip = (list: NodeStatusList[] = []) => {
  if (list.every((item) => !item.reason)) return '';
  return (
    <>
      {list.map((item) => {
        if (item.reason) {
          return (
            <div className={styles.reasonTooltipContent} key={item.nodeID}>
              {item.nodeName}拒绝原因:{item.reason}
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

export interface NodeStatusList {
  nodeID: string;
  nodeName: string;
  action: StatusEnum;
  reason: string;
}
