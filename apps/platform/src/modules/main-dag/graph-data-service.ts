import type { GraphNode } from '@secretflow/dag';
import { DefaultDataService } from '@secretflow/dag';

export class GraphDataService extends DefaultDataService {
  getNode(nodeId: string) {
    return this.getNodes().find(({ id }) => id === nodeId);
  }

  async getUpstreamNodes(nodeId: string) {
    await this.fetch();
    const currentNode = this.getNode(nodeId) as GraphNode & { inputs: string[] };
    if (!currentNode) return [];
    const { inputs } = currentNode;

    if (!inputs || inputs.length < 1) return [];

    const upstreamNodes: GraphNode[] = [];

    inputs.forEach((input, index) => {
      if (!input) return;
      const [, upstreamNodeId] = input.match(/(.*)-output-([0-9]+)$/) || [];

      const upstreamNode = this.getNode(upstreamNodeId) as GraphNode;

      upstreamNodes[index] = upstreamNode;
    });

    return upstreamNodes;
  }

  async getInputsNodes() {
    await this.fetch();
    return this.getNodes().filter(({ codeName }) => codeName === 'read_data/datatable');
  }

  /** 获取当前节点的所有上游节点id */
  async getUpstreamInputNodes(nodeId: string, acc: string[]) {
    const currentNode = this.getNode(nodeId);
    if (!currentNode) return [];
    const { inputs } = currentNode as GraphNode & { inputs?: string[] };
    if (!inputs || inputs.length < 1) return [];

    inputs.forEach((input) => {
      if (!input) return;
      const [, upstreamNodeId] = input.match(/(.*)-output-([0-9]+)$/) || [];
      if (upstreamNodeId) {
        acc.push(upstreamNodeId);
        this.getUpstreamInputNodes(upstreamNodeId, acc);
      }
    });
  }

  /** 根据上游所有节点id，获取上游样本表 */
  async getInputsSampleNodes(upstramNodeIds: string[]) {
    await this.fetch();
    return this.getNodes().filter(
      ({ codeName, id }) =>
        codeName === 'read_data/datatable' && upstramNodeIds.includes(id),
    );
  }
}
