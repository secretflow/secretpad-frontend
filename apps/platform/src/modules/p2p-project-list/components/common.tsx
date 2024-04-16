import { ExclamationCircleFilled } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Select, Radio, Modal, Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import React from 'react';
import { history, useLocation } from 'umi';

import { getPadMode, isP2PWorkbench } from '@/components/platform-wrapper';
import { useModel } from '@/util/valtio-helper';

import { P2pProjectListService } from '../p2p-project-list.service';

import { StatusEnum } from './auth-project-tag';
import styles from './index.less';

export enum ComputeModeType {
  'ALL' = 'all',
  'MPC' = 'MPC',
  'TEE' = 'TEE',
}

export const computeModeText = {
  [ComputeModeType.MPC]: '管道',
  [ComputeModeType.TEE]: '枢纽',
};

export enum RadioGroupState {
  ALL = '',
  APPLY = 'APPLY',
  PROCESS = 'PROCESS',
}

export enum SelectProjectState {
  'ALL' = 'all',
  'REVIEWING' = 'REVIEWING',
  'ARCHIVED' = 'ARCHIVED',
}

export enum ProjectStatus {
  'REVIEWING' = 'REVIEWING',
  'APPROVED' = 'APPROVED',
  'ARCHIVED' = 'ARCHIVED',
}

export const RadioGroup = (props: {
  value: RadioGroupState;
  onChange: (e: RadioGroupState) => void;
}) => {
  const { value, onChange } = props;
  return (
    <Radio.Group
      defaultValue={RadioGroupState.ALL}
      onChange={(e: RadioChangeEvent) => {
        onChange(e.target.value);
      }}
      value={value}
    >
      <Radio.Button value={RadioGroupState.ALL}>全部</Radio.Button>
      <Radio.Button value={RadioGroupState.APPLY}>我发起</Radio.Button>
      <Radio.Button value={RadioGroupState.PROCESS}>我受邀</Radio.Button>
    </Radio.Group>
  );
};

const selectOptions = [
  { value: SelectProjectState.ALL, label: '全部状态' },
  { value: SelectProjectState.REVIEWING, label: '进行中' },
  { value: SelectProjectState.ARCHIVED, label: '已归档' },
];

export const ProjectStateSelect = (props: {
  onChange: (e: SelectProjectState) => void;
  value: SelectProjectState;
}) => {
  return (
    <Select
      style={{ width: 180 }}
      defaultValue={SelectProjectState.ALL}
      value={props.value}
      onChange={(e: SelectProjectState) => props.onChange(e)}
      options={selectOptions}
    />
  );
};

const computeModeSelectOptions = [
  { value: ComputeModeType.ALL, label: '全部计算模式' },
  { value: ComputeModeType.MPC, label: '管道模式' },
  { value: ComputeModeType.TEE, label: '枢纽模式' },
];
const ModeSelect = {
  TEE: computeModeSelectOptions.filter((item) => item.value !== ComputeModeType.MPC),
  MPC: computeModeSelectOptions.filter((item) => item.value !== ComputeModeType.TEE),
  'ALL-IN-ONE': computeModeSelectOptions,
};

export const ProjectComputeModeSelect = (props: {
  onChange: (e: ComputeModeType) => void;
  value: ComputeModeType;
}) => {
  return (
    <Select
      style={{ width: 180 }}
      value={props.value}
      defaultValue={ComputeModeType.ALL}
      onChange={(e: ComputeModeType) => props.onChange(e)}
      options={ModeSelect[getPadMode() || ('MPC' as keyof typeof ModeSelect)]}
    />
  );
};

export const confirmArchive = (props: {
  title: string;
  description: string;
  onOk: () => void;
}) => {
  const { title, description, onOk } = props;
  Modal.confirm({
    title: title,
    icon: <ExclamationCircleFilled />,
    centered: true,
    okButtonProps: {
      danger: true,
      type: 'default',
    },
    content: (
      <div>
        <p>{description}</p>
      </div>
    ),
    okText: '归档',
    cancelText: '取消',
    onOk(close) {
      onOk();
      return close(Promise.resolve);
    },
  });
};

export const P2pProjectButtons = (props: { project: API.ProjectVO }) => {
  const { project } = props;
  const { nodeId } = parse(window.location.search);
  const { pathname } = useLocation();

  const p2pProjectService = useModel(P2pProjectListService);

  const handleArchiveProject = (projectInfo: API.ProjectVO) => {
    // 未达成合作的项目以及达成合作的项目点击归档，需要发起审批进行归档
    confirmArchive({
      title: `确认要将「${projectInfo.projectName}」归档吗？`,
      description: checkAllApproved(projectInfo)
        ? '归档后会向合作节点发出归档申请，所有合作节点同意后才可归档，归档后，正在运行的任务和发布的模型服务不受影响，但不可新建任务和服务'
        : '',
      onOk: () => {
        if (checkAllApproved(projectInfo)) {
          p2pProjectService.ArchiveProject(
            true,
            projectInfo.projectId,
            projectInfo.projectName,
          );
        } else {
          p2pProjectService.ArchiveProject(
            false,
            projectInfo.projectId,
            projectInfo.projectName,
          );
        }
      },
    });
  };

  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState<API.ProjectVO | undefined>();

  const handleUpdate = () => {
    setVisible(true);
    setData(project);
  };

  return (
    <>
      <Tooltip
        placement="top"
        title={checkAllApproved(project) ? '' : '未达成合作暂不可进入'}
      >
        <Button
          disabled={!checkAllApproved(project)}
          className={classNames({
            [styles.intoProjectDisabled]: !checkAllApproved(project),
          })}
          type="primary"
          size="small"
          style={{ flex: 1 }}
          onClick={() => {
            history.push(
              {
                pathname: '/dag',
                search: `projectId=${project.projectId}&mode=${
                  project.computeMode || 'MPC'
                }&type=${project.computeFunc || 'DAG'}`,
              },
              {
                origin: isP2PWorkbench(pathname) ? 'workbench' : 'my-project',
              },
            );
          }}
        >
          进入项目
        </Button>
      </Tooltip>
      {/* 全家桶无升级入口 */}
      {/* 项目发起方才可以操作项目 发起id 与当前nodeId判断 */}
      {/* 功能升级隐藏 */}
      {/* {project.computeFunc !== ProjectType.ALL && (
        <>
          <Button size="small" onClick={handleUpdate} style={{ flex: 1 }}>
            功能升级
          </Button>
          <UpdateFuncModal
            open={visible}
            onClose={() => setVisible(false)}
            data={data}
            onOk={projectListModel.getProjectList}
          />
        </>
      )} */}
      {/* 只有审批成功才发起归档审批 */}
      {/* 待审批状态只有发起者才能发起审批 */}
      {projectCanArchived(project, nodeId as string) && (
        <Button
          size="small"
          onClick={() => handleArchiveProject(project)}
          style={{ flex: 1 }}
        >
          归档
        </Button>
      )}
    </>
  );
};

const projectCanArchived = (project: API.ProjectVO, nodeId: string) => {
  if (project.status === ProjectStatus.ARCHIVED) return false;
  if (checkAllApproved(project)) return true;
  if (checkProjectIsReviewing(project)) {
    if (!nodeId) return false;
    if (project.initiator === nodeId) return true;
    return false;
  }
};

/**
 * 判断所有受邀方是否通过
 * @param project
 * @returns boolean
 */
export const checkAllApproved = (project: API.ProjectVO) => {
  const { partyVoteInfos } = project;
  return (partyVoteInfos || []).every((node) => node.action === StatusEnum.AGREE);
};

/**
 * project.status 服务端状态同步慢，所以优化通过 partyVoteInfos 来判断
 * 根据 partyVoteInfos 判断当前项目是不是 REVIEWING 状态
 * @param project
 * @returns boolean
 */
export const checkProjectIsReviewing = (project: API.ProjectVO) => {
  const { partyVoteInfos } = project;
  return (
    (partyVoteInfos || []).some((node) => node.action === StatusEnum.PROCESS) &&
    !(partyVoteInfos || []).some((node) => node.action === StatusEnum.REJECT)
  );
};
