import { message } from 'antd';

import { get, update } from '@/services/secretpad/NodeController';
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
    await update({
      netAddress: value,
      nodeId,
    });
    this.getNodeInfo(nodeId);
    message.success('通讯地址更改成功');
  };
}
