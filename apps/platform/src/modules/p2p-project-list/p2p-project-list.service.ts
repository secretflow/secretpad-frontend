import { message } from 'antd';
import { parse } from 'query-string';

import { isP2PWorkbench } from '@/components/platform-wrapper';
import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

import type { StatusEnum } from './components/auth-project-tag';

export class P2pProjectListService extends Model {
  projectList: API.ProjectVO[] = [];
  displayProjectList: API.ProjectVO[] = [];
  projectListLoading = false;

  messageGetList: null | (() => Promise<void>) = null;

  comment = '';

  nodeId: string | undefined = undefined;

  onViewMount() {
    const { nodeId } = parse(window.location.search);
    if (nodeId) {
      this.nodeId = nodeId as string;
    }
  }

  setComment = (value: string) => {
    this.comment = value;
  };

  getListProject = async () => {
    this.projectListLoading = true;
    const { data } = await API.P2PProjectController.listP2PProject();
    this.projectList = (data || []) as API.ProjectVO[];
    this.projectListLoading = false;
    this.displayProjectList = this.projectList.reverse();
    return this.projectList.reverse();
  };
  /**
   * 编辑项目
   */
  projectEdit = async (item: API.ProjectVO, projectId: string) => {
    const params = {
      projectId,
      name: item.projectName as string,
      description: item.description as string,
    };
    message.loading({ content: '更新中', key: item.projectId });
    const { status } = await API.P2PProjectController.updateProject(params);
    if (status && status.code === 0) {
      await this.getListProject();
      message.success('项目名称修改成功');
    }
    message.destroy(item.projectId);
  };

  /**
   * 处理审批
   * @param action c
   * @param id
   */
  process = async (action: StatusEnum, id: string, pathname: string) => {
    const { status } = await API.MessageController.reply({
      action,
      reason: this.comment,
      voteID: id,
      voteParticipantID: this.nodeId,
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      message.success('处理成功');
      this.getListProject();
      if (isP2PWorkbench(pathname)) {
        if (this.messageGetList) {
          await this.messageGetList();
        }
      }
    }
  };

  // 归档项目  isVote ? 发起审批 : 直接归档
  ArchiveProject = async (
    isVote: boolean,
    projectId?: string,
    projectName?: string,
  ) => {
    if (!projectId || !projectName) return;
    const { status } = await (isVote
      ? API.ApprovalController.create({
          nodeID: this.nodeId,
          voteType: 'PROJECT_ARCHIVE',
          voteConfig: {
            projectId: projectId,
          },
        })
      : API.P2PProjectController.projectArchive({
          projectId: projectId,
        }));
    if (status && status.code !== 0) {
      message.error(status.msg);
      return;
    }
    message.success(`「${projectName}」申请归档成功！`);
    this.getListProject();
  };

  // 消息中心传递的callback
  P2pProjectCallBack = (func: () => Promise<void>) => {
    this.messageGetList = func;
  };
}
