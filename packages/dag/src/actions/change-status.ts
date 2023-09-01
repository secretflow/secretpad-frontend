import type { Graph } from '@antv/x6';

import type { NodeStatus } from '../..';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

// 直接改变单个节点状态, 不包括相关
export class ChangeStatusAction implements ActionProtocol {
  type = ActionType.changeStatus;
  label = '改变节点状态';

  handle(graph: Graph, dagId: string, node: { nodeId: string; status: NodeStatus }) {
    this.changeNodeStatus(node, graph);
  }

  changeNodeStatus(node: { nodeId: string; status: NodeStatus }, graph: Graph) {
    const { nodeId, status } = node;
    const graphNode = graph.getCellById(nodeId);
    if (node) {
      graphNode.setData({
        ...graphNode.getData(),
        status,
      });
    }
  }
}
