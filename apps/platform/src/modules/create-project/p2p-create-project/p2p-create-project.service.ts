import { message } from 'antd';
import { parse } from 'query-string';

import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

/**
 * P2P模式
 */
export class P2PCreateProjectService extends Model {
  /**
   * 创建项目loading
   */
  loading = false;

  /**
   * 和本方节点已建立好授权的节点列表
   */
  nodeList: API.NodeVO[] = [];

  /**
   * 本方节点下的数据表
   */
  nodeDataSheet: { label: string; id: string }[] = [];

  /**
   * 获取已建立好授权的节点列表
   * @param nodeId
   */
  getNodeList = async (nodeId: string) => {
    const { data } = await API.NodeRouteController.page({
      page: 1,
      size: 1000,
      search: '',
      sort: {},
      nodeId: nodeId as string,
    });
    this.nodeList = (data?.list || [])
      .filter((item) => item.status === 'Succeeded')
      .map((item: API.NodeRouterVO) => ({
        nodeId: item.srcNode!.nodeId,
        nodeName: item.srcNode!.nodeName,
      }));
  };

  /**
   * 获取当前节点的数据
   */
  getNodeData = async (nodeId: string) => {
    const { data } = await API.DatatableController.listDatatables({
      nodeId,
      pageNumber: 1,
      pageSize: 1000,
      statusFilter: '',
      datatableNameFilter: '',
    });
    this.nodeDataSheet = (data?.datatableVOList || []).map((item: API.DatatableVO) => ({
      label: item?.datatableName || '',
      id: item?.datatableId || '',
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
    nodes: string[];
    dataSheet?: string[];
  }) => {
    const { projectName, description, computeFunc, computeMode, nodes } = value;
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
    const { nodeId } = parse(window.location.search);
    // 发起审批
    const { status } = await API.ApprovalController.create({
      nodeID: nodeId as string,
      voteType: 'PROJECT_CREATE',
      voteConfig: {
        projectId: data?.projectId,
        nodes: [nodeId, ...nodes],
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
