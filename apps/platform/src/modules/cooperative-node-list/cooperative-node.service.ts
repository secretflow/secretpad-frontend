import { parse } from 'query-string';

import { NodeService } from '@/modules/node';
import { get as getSelfNodeInfo } from '@/services/secretpad/NodeController';
import {
  deleteUsingPOST,
  refresh,
  create,
  update,
  listNode,
  get,
} from '@/services/secretpad/NodeRouteController';
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

  addCooperativeNode = async (info: API.CreateNodeRouterRequest) => {
    return await create(info);
  };

  refreshNode = async (routerId: string) => {
    if (!routerId) return;
    await refresh({ routerId });
  };

  getComputeNodeList = async () => {
    this.computeNodeLoading = true;
    const list = await listNode();
    this.computeNodeLoading = false;
    if (list.data) {
      this.computeNodeList = list.data;
    }
  };
}
