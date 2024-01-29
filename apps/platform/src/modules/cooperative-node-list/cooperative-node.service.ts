import { message } from 'antd';
import { parse } from 'query-string';

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
import { Model, getModel } from '@/util/valtio-helper';

export class CooperativeNodeService extends Model {
  nodeService = getModel(NodeService);
  currentNode: API.NodeVO | undefined = this.nodeService.currentNode;

  computeNodeList: API.NodeVO[] = [];

  cooperativeNodeDetail: API.NodeRouterVO = {};

  computeNodeLoading = false;

  cooperativeNodeLoading = false;

  // 本方节点信息
  nodeInfo: API.NodeVO = {};

  getNodeInfo = async () => {
    const { nodeId } = parse(window.location.search);
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
}
