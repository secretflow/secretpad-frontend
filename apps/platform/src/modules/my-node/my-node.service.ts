import { message } from 'antd';
import sha256 from 'crypto-js/sha256';

import { get, update } from '@/services/secretpad/NodeController';
import { resetPwd } from '@/services/secretpad/RemoteUserController';
import { Model } from '@/util/valtio-helper';

export class MyNodeService extends Model {
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
        // TODO: status service
        (item) => item.status === 'Ready',
      ).length;
    }
    this.nodeInfoLoading = false;
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
}
