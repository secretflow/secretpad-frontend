import { message } from 'antd';
import { NodeService } from '@/modules/node';
import { create as createAudit } from '@/services/secretpad/ApprovalController';
import { get as getSelfNodeInfo } from '@/services/secretpad/NodeController';
import {
  deleteUsingPOST,
  refresh,
  update,
  listNode,
  get,
} from '@/services/secretpad/NodeRouteController';
import { createP2pNode, deleteP2pNode } from '@/services/secretpad/P2pNodeController';
import { listNode as instListNode } from '@/services/secretpad/InstController';
import { Model, getModel } from '@/util/valtio-helper';
import { NodeState } from '../managed-node-list';

export class CooperativeNodeService extends Model {
  nodeService = getModel(NodeService);
  currentNode: API.NodeVO | undefined = this.nodeService.currentNode;

  computeNodeList: API.NodeVO[] = [];

  cooperativeNodeDetail: API.NodeRouterVO = {};

  computeNodeLoading = false;

  cooperativeNodeLoading = false;

  // 本方节点信息
  nodeInfo: API.NodeVO = {};

  /**
   * AUTONOMY 模式 - 机构下的所有节点
   */
  autonomyNodeList: API.NodeVO[] = [];

  /**
   * AUTONOMY 模式 - 是否可以点击添加合作节点
   * 只有当前机构下存在可用节点的时候才可点击
   */
  autonomyAddDisabled = false;

  getNodeInfo = async (nodeId: string) => {
    if (!nodeId) return;
    const info = await getSelfNodeInfo({
      nodeId: nodeId as string,
    });
    if (info.data) {
      this.nodeInfo = info.data;
    }
  };

  async deleteCooperativeNode(routerId: string) {
    return await deleteUsingPOST({ routerId });
  }

  async editCooperativeNode(value: API.UpdateNodeRouterRequest) {
    return await update(value);
  }

  getCooperativeNodeDetail = async (routerId: string) => {
    if (!routerId) return;
    this.cooperativeNodeLoading = true;
    const info = await get({
      routerId,
    });
    if (info.data) {
      this.cooperativeNodeDetail = info.data;
    }
    this.cooperativeNodeLoading = false;
  };

  // addCooperativeNode = async (info: API.CreateNodeRouterRequest) => {
  //   return await create(info);
  // };

  addApprovalAudit = async (params: API.CreateApprovalRequest) => {
    return await createAudit(params);
  };

  refreshNode = async (routerId: string) => {
    if (!routerId) return;
    try {
      await refresh({ routerId });
      message.success('状态刷新成功');
    } catch (error) {
      message.error('状态刷新失败');
    }
  };

  getComputeNodeList = async () => {
    this.computeNodeLoading = true;
    const list = await listNode();
    this.computeNodeLoading = false;
    if (list.data) {
      this.computeNodeList = list.data;
    }
  };

  /**
   *
   * @param p2p 模式下删除路由
   * @returns
   */
  p2pDeleteCooperativeNode = async (routerId: string) => {
    return await deleteP2pNode({ routerId });
  };

  /**
   *
   * @param info p2p 模式下创建路由
   * @returns
   */
  addCooperativeNode = async (info: API.P2pCreateNodeRequest) => {
    return await createP2pNode(info);
  };

  /** AUTONOMY 模式下获取机构下所有节点列表 */
  getAutonomyNodeList = async () => {
    const { status, data } = await instListNode();
    if (status && status.code === 0) {
      this.autonomyNodeList = data || [];
    } else {
      message.error(status?.msg);
    }
    this.autonomyAddDisabled = !this.autonomyNodeList.some(
      (item) => item.nodeStatus === NodeState.READY,
    );
  };
}
