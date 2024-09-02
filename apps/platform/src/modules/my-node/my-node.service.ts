import { message } from 'antd';
import sha256 from 'crypto-js/sha256';

import { get, update } from '@/services/secretpad/NodeController';
import {
  listNode,
  createNode,
  deleteNode,
  newToken,
  token,
} from '@/services/secretpad/InstController';
import { resetPwd } from '@/services/secretpad/RemoteUserController';
import { Model } from '@/util/valtio-helper';

export class MyNodeService extends Model {
  /** 当前页面节点 */
  currentPageNodeId: string | undefined = undefined;

  /** 节点 token */
  nodeToken = '';

  /** 获取 token loading */
  nodeTokenLoading = false;

  /** AUTONOMY 模式 - 机构下的所有节点 */
  autonomyNodeList: API.NodeVO[] = [];

  /** 新增节点弹框visible */
  addNodeModelVisible = false;

  nodeInfoLoading = false;

  nodeInfo: API.NodeVO = {};

  enableInstance = 0;

  allInstance = 0;

  nodeInstances: Array<API.NodeInstanceDTO> = [];

  getNodeInfo = async (nodeId: string) => {
    if (!nodeId) return;
    this.nodeInfoLoading = true;
    const info = await get({
      nodeId,
    });
    if (info.data) {
      this.nodeInfo = info.data;
      this.nodeInstances = info.data?.nodeInstances || [];
      this.allInstance = this.nodeInstances.length;
      this.enableInstance = this.nodeInstances.filter(
        (item) => item.status === 'Ready',
      ).length;
    } else {
      this.currentPageNodeId = undefined;
    }
    this.nodeInfoLoading = false;
  };

  /** 查看节点token */
  getNodeToken = async (nodeId?: string) => {
    if (!nodeId) return;
    this.nodeTokenLoading = true;
    const res = await token({
      nodeId,
    });
    this.nodeTokenLoading = false;
    if (res.status?.code == 0) {
      this.nodeToken = res.data?.instToken || '';
    } else {
      message.error(res.status?.msg);
    }
  };

  /** 刷新节点token */
  refreshNodeToken = async (nodeId?: string) => {
    if (!nodeId) return;
    this.nodeTokenLoading = true;
    const res = await newToken({
      nodeId,
    });
    this.nodeTokenLoading = false;
    if (res.status?.code == 0) {
      this.nodeToken = res.data?.instToken || '';
    } else {
      message.error(res.status?.msg);
    }
  };

  changeCommonNetAddress = async (value: string, nodeId: string) => {
    if (!nodeId) return;
    const res = await update({
      netAddress: value,
      nodeId,
    });
    if (res.status?.code == 0) {
      this.getNodeInfo(nodeId);
      message.success('通讯地址更改成功');
    } else {
      message.error(res.status?.msg);
    }
  };

  resetEdgeNodePwd = async (
    nodeId: string,
    name: string,
    pwd: string,
    newPwd: string,
  ) => {
    const res = await resetPwd({
      nodeId,
      name,
      passwordHash: sha256(pwd).toString(),
      newPasswordHash: sha256(newPwd).toString(),
    });
    if (res.status?.code == 0) {
      message.success('密码设置成功');
      return true;
    } else if (res.status?.code === 202011100) {
      message.error('原密码错误');
    } else {
      message.error(res.status?.msg);
    }
    return false;
  };

  /** AUTONOMY 模式下获取机构下所有节点列表 */
  getAutonomyNodeList = async () => {
    const { status, data } = await listNode();
    if (status && status.code === 0) {
      this.autonomyNodeList = data || [];
    } else {
      message.error(status?.msg);
    }
    // 默认设置主节点
    if (!this.currentPageNodeId) {
      this.setCurrentPageMainNodeId();
    }
  };

  /** AUTONOMY 模式下设置 currentPageNodeId 为主节点Id */
  setCurrentPageMainNodeId = () => {
    this.currentPageNodeId = (this.autonomyNodeList || []).find(
      (item) => item.isMainNode,
    ).nodeId;
  };

  /** AUTONOMY 模式下删除节点 */
  delAutonomyNode = async (nodeId: string) => {
    return deleteNode({
      nodeId: nodeId,
    });
  };

  /** AUTONOMY 模式下新增节点 */
  addAutonomyNode = async (calcNodeName: string) => {
    return createNode({
      name: calcNodeName,
      mode: 1, // AUTONOMY 模式下固定设置
    });
  };
}
