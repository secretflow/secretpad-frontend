import { message } from 'antd';

import { listGraph } from '@/services/secretpad/GraphController';
import { reply } from '@/services/secretpad/MessageController';
import { projectParticipants } from '@/services/secretpad/P2PProjectController';
import { listJob } from '@/services/secretpad/ProjectController';
import { Model } from '@/util/valtio-helper';

import { StatusEnum } from '../message-center/message.service';

// 仅 p2p 项目支持
export class P2pProjectDetailService extends Model {
  loading = false;

  projectDetail = null;

  voteInstNodeList: API.ProjectParticipantsDetailVO[] = [];
  pipelineList: API.GraphMetaVO[] = [];
  jobList: API.ProjectJobSummaryVO[] = [];

  jobCurrPage = 1;

  processLoading: {
    rejectLoading: boolean;
    agreeLoading: boolean;
    type: string | undefined;
  } = {
    rejectLoading: false,
    agreeLoading: false,
    type: undefined,
  };

  initData = async (voteId: string, projectId: string) => {
    await this.getVoteInstsNodes(voteId);
    await this.getPipelines(projectId);
    await this.getJobs({
      projectId: projectId,
      pageNum: 1,
      pageSize: 10,
    });
  };

  setJobCurrPage = (jobCurrPage: number) => {
    this.jobCurrPage = jobCurrPage;
  };

  getVoteInstsNodes = async (voteId: string) => {
    try {
      const { status, data } = await projectParticipants({ voteId });
      if (status?.code !== 0) {
        message.error(status?.message);
        this.voteInstNodeList = [];
        return this.voteInstNodeList;
      }
      this.voteInstNodeList = data || [];
      return this.voteInstNodeList;
    } catch (e) {
      message.error(e);
      this.voteInstNodeList = [];
      return this.voteInstNodeList;
    }
  };

  getPipelines = async (projectId: string) => {
    const pipelineList = await listGraph({
      projectId,
    });

    this.pipelineList = pipelineList.data || [];

    return this.pipelineList;
  };

  getJobs = async (params: {
    projectId: string;
    pageNum: number;
    pageSize: number;
  }) => {
    const jobsList = await listJob({
      projectId: params.projectId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    this.jobList = jobsList?.data?.data || [];

    return this.jobList;
  };

  /**
   * Process messages
   *
   * @param Agree or reject
   */
  process = async (params: API.VoteReplyRequest) => {
    this.processLoading = {
      type: params.action,
      rejectLoading: params.action === StatusEnum.REJECT ? true : false,
      agreeLoading: params.action === StatusEnum.AGREE ? true : false,
    };
    const res = await reply(params);
    this.processLoading = {
      rejectLoading: false,
      agreeLoading: false,
      type: undefined,
    };
    return res;
  };
}
