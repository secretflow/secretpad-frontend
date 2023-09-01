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
}
