import { DatabaseOutlined } from '@ant-design/icons';
import { Divider, Input, Popconfirm, Space, Tag, Tooltip } from 'antd';
import React from 'react';

import { useModel } from '@/util/valtio-helper';

import { P2pProjectListService } from '../p2p-project-list.service';

import styles from './auth-project-tag.less';
import { ProjectStatus } from './common';
import { useLocation } from 'umi';

interface IProps {
  currentNode: {
    id: string;
    name?: string;
  };
  project: API.ProjectVO;
  simple?: boolean;
}

export enum StatusEnum {
  PROCESS = 'REVIEWING',
  AGREE = 'APPROVED',
  REJECT = 'REJECTED',
}

export const StatusObj = {
  [StatusEnum.AGREE]: '已同意',
  [StatusEnum.PROCESS]: '待同意',
  [StatusEnum.REJECT]: '已拒绝',
};

export const moveItemToFrontById = (array: API.PartyVoteInfoVO[], id: string) => {
  const index = array.findIndex((item) => item.nodeId === id);
  if (index > -1) {
    const [item] = array.splice(index, 1);
    array.unshift(item);
  }
  return array;
};

export const AuthProjectTag = (props: IProps) => {
  const { currentNode, project, simple } = props;
  const { partyVoteInfos = [], initiatorName, initiator, voteId } = project;
  const { pathname } = useLocation();
  const applyList = [
    {
      name: initiatorName,
      id: initiator,
    },
  ];
  const processList = React.useMemo(() => {
    return moveItemToFrontById(partyVoteInfos, currentNode.id).map((item) => ({
      name: item.nodeName,
      id: item.nodeId,
      status: item.action,
      reason: item.reason,
    }));
  }, [project]);

  const currentProcessList = simple ? processList.slice(0, 1) : processList;

  const viewInstance = useModel(P2pProjectListService);

  return (
    <div className={styles.content}>
      <div className={styles.applyContent}>
        <Space>
          <Tag className={styles.tagApply}>发起</Tag>
          <div className={styles.nodeName}>
            <DatabaseOutlined />
            {applyList[0].name}
          </div>
          {currentNode.id === applyList[0].id && <div>(我的)</div>}
        </Space>
      </div>
      <div>
        {currentProcessList.map((item) => {
          return (
            <div className={styles.processContent} key={item.id}>
              <Space>
                <Tag className={styles.tagProcess}>受邀</Tag>
                <div className={styles.nodeName}>
                  <DatabaseOutlined />
                  {item.name}
                </div>
                {/* 当前项目是待审批状态，且当前节点是本方节点，并且本方节点是待处理状态 */}
                {project.status === ProjectStatus.REVIEWING &&
                currentNode.id === item.id &&
                item.status === StatusEnum.PROCESS ? (
                  <Space>
                    <div
                      className={styles.agree}
                      onClick={() =>
                        viewInstance.process(StatusEnum.AGREE, voteId, pathname)
                      }
                    >
                      同意
                    </div>
                    <Popconfirm
                      title="你确定要拒绝吗？"
                      placement="left"
                      destroyTooltipOnHide
                      onOpenChange={(open) => {
                        if (!open) {
                          viewInstance.setComment('');
                        }
                      }}
                      description={
                        <Input.TextArea
                          maxLength={50}
                          placeholder="请输50字符以内的理由"
                          allowClear
                          onChange={(e) => viewInstance.setComment(e.target.value)}
                        />
                      }
                      okText="拒绝"
                      cancelText="取消"
                      okButtonProps={{
                        danger: true,
                        ghost: true,
                      }}
                      onConfirm={() =>
                        viewInstance.process(StatusEnum.REJECT, voteId, pathname)
                      }
                    >
                      <div className={styles.reject}>拒绝</div>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <div>{`共${processList.length}方节点`}</div>
                  </Space>
                ) : (
                  <Space>
                    <Tooltip
                      title={
                        item.status === StatusEnum.REJECT
                          ? item.reason || '暂无原因'
                          : ''
                      }
                    >
                      <div>{`(${
                        StatusObj[item.status as keyof typeof StatusObj]
                      })`}</div>
                    </Tooltip>
                    {currentNode.id === item.id && <div>(我的)</div>}
                  </Space>
                )}
              </Space>
            </div>
          );
        })}
      </div>
    </div>
  );
};
