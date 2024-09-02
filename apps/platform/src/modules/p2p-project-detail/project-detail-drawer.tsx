import { CloseOutlined } from '@ant-design/icons';
import { ShowMenuContext, Portal } from '@secretflow/dag';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Pagination,
  Popconfirm,
  Space,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { TabsProps } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import { parse } from 'query-string';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import { memo, useEffect, useState } from 'react';

import { ReactComponent as PipelineIcon } from '@/assets/pipeline.icon.svg';
import { VoteInstNodesGraph } from '@/components/vote-insts-graph';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import { formatTimestamp } from '../dag-result/utils';
import { StatusEnum } from '../p2p-project-list/components/auth-project-tag';
import {
  P2pProjectButtons,
  ProjectStatus,
} from '../p2p-project-list/components/common';
import { ProjectTypeTag } from '../p2p-project-list/components/project-type-tag';
import { P2pProjectListService } from '../p2p-project-list/p2p-project-list.service';
import { ComputeModeType, computeModeText } from '../project-list';
import { mapStatusToBadge } from '../project-list/components/popover';

import { convertToNodeData } from './helper';
import styles from './index.less';
import { P2pProjectDetailService } from './project-detail-service';

const PipelinesComponent: React.FC = () => {
  const p2pProjectDetailService = useModel(P2pProjectDetailService);

  return (
    <div>
      {p2pProjectDetailService.pipelineList.length > 0 ? (
        p2pProjectDetailService.pipelineList.map((pipeline) => {
          return (
            <div className={styles.pipelineItem} key={pipeline.name}>
              {' '}
              <PipelineIcon />
              <Paragraph
                style={{ marginLeft: 4, width: 510, marginBottom: 0 }}
                ellipsis={{ rows: 1, tooltip: pipeline.name }}
              >
                {pipeline.name}
              </Paragraph>
            </div>
          );
        })
      ) : (
        <Empty description="暂无训练流数据" />
      )}
    </div>
  );
};

interface IJobComponent {
  jobCount: number;
  projectId: string;
  setTabKey: Dispatch<SetStateAction<string>>;
}

const JobsComponent: React.FC<IJobComponent> = (props: IJobComponent) => {
  const { jobCount, projectId, setTabKey } = props;
  const p2pProjectDetailService = useModel(P2pProjectDetailService);

  const handlePageChange = (_page: number) => {
    (async () => {
      await p2pProjectDetailService.getJobs({
        projectId: projectId,
        pageNum: _page,
        pageSize: 10,
      });
      setTabKey('tasks');
      p2pProjectDetailService.setJobCurrPage(_page);
    })();
  };

  return (
    <div>
      {p2pProjectDetailService.jobList.length > 0 ? (
        p2pProjectDetailService.jobList.map((job) => {
          return (
            <React.Fragment key={job.jobId}>
              <div className={styles.jobItem}>
                <Badge
                  status={mapStatusToBadge(job.status as API.GraphJobStatus)}
                  text=""
                />
                <span className={styles.jobTime}>
                  {formatTimestamp(job.gmtCreate as string)}
                </span>
                <div className={styles.jobId}>ID: {job.jobId}</div>
              </div>
            </React.Fragment>
          );
        })
      ) : (
        <Empty description="暂无任务数据" />
      )}
      <Pagination
        style={{ marginTop: 12, textAlign: 'right' }}
        defaultCurrent={p2pProjectDetailService.jobCurrPage}
        total={jobCount}
        onChange={handlePageChange}
        showSizeChanger={false}
      />
    </div>
  );
};

interface IVoteInstsNodesComponent {
  voteInstNodeList: API.ProjectParticipantsDetailVO[];
}

const VoteInstsNodesComponent: React.FC<IVoteInstsNodesComponent> = memo(
  ({ voteInstNodeList }: IVoteInstsNodesComponent) => {
    const { nodeData, edgeData, groupNodeIds } = convertToNodeData(voteInstNodeList);

    const [graphHeight, setGraphHeight] = useState(window.innerHeight - 210);

    return (
      <div style={{ height: graphHeight }}>
        <VoteInstNodesGraph
          nodes={nodeData}
          edges={edgeData}
          groupNodeIds={groupNodeIds}
          setGraphHeight={setGraphHeight}
        />
      </div>
    );
  },
);

VoteInstsNodesComponent.displayName = 'VoteInstsNodesComponent';

interface IProjectDetailTabs {
  onChange: (activeKey: string) => void;
  tabKey: string;
  items: TabsProps['items'];
}

const ProjectDetailTabs: React.FC<IProjectDetailTabs> = (props: IProjectDetailTabs) => {
  const { onChange, tabKey, items } = props;
  return (
    <Tabs
      className={styles.tabs}
      activeKey={tabKey}
      animated={false}
      items={items}
      onChange={onChange}
    />
  );
};

export const P2pProjectDetailDrawer = memo(() => {
  const modalManager = useModel(DefaultModalManager);
  const p2pProjectDetailService = useModel(P2pProjectDetailService);
  const p2pProjectService = useModel(P2pProjectListService);

  const { visible, data } = modalManager.modals[p2pProjectDetailDrawer.id];
  const { ownerId } = parse(window.location.search);
  const [tabKey, setTabKey] = useState('parties');

  const selfParty = data.partyVoteInfos?.find((party) => party.partyId === ownerId);
  const [comment, setComment] = useState('');

  const items: TabsProps['items'] = [
    {
      key: 'parties',
      label: `参与机构（${p2pProjectDetailService.voteInstNodeList.partyVoteStatuses?.length}）`,
      children: (
        <VoteInstsNodesComponent
          voteInstNodeList={p2pProjectDetailService.voteInstNodeList}
        />
      ),
    },
    {
      key: 'pipelines',
      label: `训练流（${p2pProjectDetailService.pipelineList.length}）`,
      children: <PipelinesComponent />,
    },
    {
      key: 'tasks',
      label: `任务数（${data.jobCount}）`,
      children: (
        <JobsComponent
          jobCount={data.jobCount}
          projectId={data.projectId}
          setTabKey={setTabKey}
        />
      ),
    },
  ];

  const onClose = () => {
    modalManager.closeModal(p2pProjectDetailDrawer.id);
  };

  useEffect(() => {
    if (data.voteId && data.projectId)
      p2pProjectDetailService.initData(data.voteId, data.projectId);
  }, [data.projectId, data.voteId]);

  useEffect(() => {
    setTabKey(data.tabKey || 'parties');
  }, [data]);

  const handleTabChange = (_tabKey: string) => {
    setTabKey(_tabKey);
  };

  const processMessage = async (action: StatusEnum) => {
    const { status } = await p2pProjectDetailService.process({
      action,
      reason: comment,
      voteId: data.voteId,
      voteParticipantId: ownerId as string,
    });

    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      message.success('处理成功');

      onClose && onClose();

      await p2pProjectService.getListProject();
    }
  };

  return (
    <Drawer
      title={
        <div className={styles.title}>
          <Tag className={styles.computeModeTag}>
            {computeModeText[data.computeMode as keyof typeof computeModeText] ||
              computeModeText[ComputeModeType.MPC]}
          </Tag>
          <ProjectTypeTag type={data.computeFunc || 'DAG'} />
          <Paragraph
            style={{ fontSize: 16, marginLeft: 8, width: 400, marginBottom: 0 }}
            ellipsis={{ rows: 1, tooltip: data.projectName }}
          >
            {data.projectName}
          </Paragraph>
        </div>
      }
      placement="right"
      width={600}
      destroyOnClose
      closable={false}
      onClose={onClose}
      open={visible}
      getContainer={() => {
        return document.querySelector(`.${dagLayoutStyle.center}`) as Element;
      }}
      mask={false}
      style={{ padding: 0 }}
      extra={
        <CloseOutlined
          style={{ fontSize: 12 }}
          onClick={() => {
            onClose();
          }}
        />
      }
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space size={8}>
            {/* 当前节点是本方节点，当前项目是待审批状态，本方节点是待处理状态 */}
            {data.status === ProjectStatus.REVIEWING &&
            selfParty?.action === StatusEnum.PROCESS ? (
              <>
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
                    loading={p2pProjectDetailService.processLoading.rejectLoading}
                    disabled={
                      p2pProjectDetailService.processLoading.type === StatusEnum.AGREE
                    }
                  >
                    拒绝
                  </Button>
                </Popconfirm>
                <Button
                  type="primary"
                  onClick={() => processMessage(StatusEnum.AGREE)}
                  loading={p2pProjectDetailService.processLoading.agreeLoading}
                  disabled={
                    p2pProjectDetailService.processLoading.type === StatusEnum.REJECT
                  }
                >
                  同意
                </Button>
              </>
            ) : (
              <P2pProjectButtons project={data} inDrawer={true} />
            )}
          </Space>
        </div>
      }
    >
      {data.status === ProjectStatus.REVIEWING ? (
        <VoteInstsNodesComponent
          voteInstNodeList={p2pProjectDetailService.voteInstNodeList}
        />
      ) : (
        <ProjectDetailTabs tabKey={tabKey} onChange={handleTabChange} items={items} />
      )}
    </Drawer>
  );
});

P2pProjectDetailDrawer.displayName = 'P2pProjectDetailDrawer';

export const p2pProjectDetailDrawer = {
  id: 'project-detail',
  visible: false,
  data: {},
};

getModel(DefaultModalManager).registerModal(p2pProjectDetailDrawer);
