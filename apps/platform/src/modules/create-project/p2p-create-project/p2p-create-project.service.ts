import { message } from 'antd';
import { parse } from 'query-string';
import { listNode } from '@/services/secretpad/InstController';
import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

export type Options = {
  value: string;
  label: string;
};

/**
 * P2P模式
 */
export class P2PCreateProjectService extends Model {
  /**
   * 创建项目loading
   */
  loading = false;

  /** 本方机构下的所有可用节点 */
  nodeListOptions: Options[] = [];

  /** 本方节点与之授权的节点 */
  nodeVotersMaps: Record<
    string,
    {
      nodeId: string;
      nodeName: string;
      instId: string;
      instName: string;
    }[]
  > = {};

  /** 获取本方机构下的所有可用节点 */
  getNodeList = async () => {
    const { status, data } = await listNode();
    if (status && status.code === 0) {
      this.nodeListOptions =
        (data || [])
          .filter((node) => node.nodeStatus === 'Ready')
          .map((item) => ({
            label: item.nodeName || '',
            value: item.nodeId || '',
          })) || [];
    } else {
      message.error(status?.msg);
    }
  };

  /** 获取本方机构与之授权成功的节点 且合作节点路由是可用状态 */
  getNodeVoters = async (dstNodeId: string) => {
    const { ownerId } = parse(window.location.search);
    const { data } = await API.NodeRouteController.page({
      page: 1,
      size: 1000,
      search: '',
      sort: {},
      ownerId: ownerId as string,
    });
    this.nodeVotersMaps[dstNodeId] = (data?.list || [])
      .filter(
        (router) => router.dstNodeId === dstNodeId && router.status === 'Succeeded',
      )
      .map((item: API.NodeRouterVO) => ({
        nodeId: item.srcNode?.nodeId || '',
        nodeName: item.srcNode?.nodeName || '',
        instId: item.srcNode?.instId || '',
        instName: item.srcNode?.instName || '',
      }));
  };

  /**
   * P2P创建项目,发起审批
   */
  createProject = async (value: {
    projectName: string;
    description: string;
    computeFunc: string;
    computeMode: string;
    nodeVoters: { nodes: string[]; nodeId: string }[];
    dataSheet?: string[];
  }) => {
    const { ownerId } = parse(window.location.search);
    const { projectName, description, computeFunc, computeMode, nodeVoters } = value;
    const participants = [ownerId]; // 参与方机构
    const participantNodeInstVOS = (nodeVoters || []).map(
      (item: { nodes: string[]; nodeId: string }) => {
        const currentNodeVotersList = this.nodeVotersMaps[item.nodeId];
        const invitees = (item?.nodes || []).map((id: string) => {
          const findInstId = currentNodeVotersList?.find(
            (nodes) => nodes.nodeId === id,
          )?.instId;
          if (findInstId) {
            participants.push(findInstId);
          }
          return {
            inviteeId: id,
          };
        });
        return {
          initiatorNodeId: item.nodeId,
          invitees: invitees,
        };
      },
    );
    this.loading = true;
    //  创建项目
    const { data, status: createProjectStatus } =
      await API.P2PProjectController.createP2PProject({
        name: projectName,
        description,
        computeMode,
        computeFunc,
      });
    if (createProjectStatus?.code && createProjectStatus.code !== 0) {
      this.loading = false;
      throw new Error(createProjectStatus.msg || '创建失败');
    }
    // 发起审批
    const { status } = await API.ApprovalController.create({
      initiatorId: ownerId as string,
      voteType: 'PROJECT_CREATE',
      voteConfig: {
        projectId: data?.projectId,
        participants: [...new Set(participants)], // 机构ID
        participantNodeInstVOS: participantNodeInstVOS,
      },
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      message.success('申请成功');
    }
    this.loading = false;
  };
}
