import type { Graph, Node, Edge } from '@antv/x6';

import DAGContext from '../context';
import { NodeStatus } from '../types';
import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const pasteActionHotKey = {
  key: isWindows ? 'ctrl+v' : 'cmd+v',
  text: isWindows ? 'Ctrl V' : '⌘ V',
};

const DAG_COPY_CONTENT = 'DAG_COPY_CONTENT';

export class PasteAction extends DAGContext implements ActionProtocol {
  type = ActionType.paste;
  label = '粘贴';
  hotKey = pasteActionHotKey;

  async handle(graph: Graph, dagId: string) {
    const strDta = localStorage.getItem(DAG_COPY_CONTENT);
    if (!strDta) {
      return;
    }

    const data: {
      nodes: Node.Properties[];
      edges: Edge.Properties[];
    } = JSON.parse(strDta);

    const maxNodeIndex = await this.context.requestService.getMaxNodeIndex(dagId);

    const fixNodeIds: Record<string, string> = {};
    data.nodes.forEach((node, index) => {
      const nextNodeId = `${dagId}-node-${maxNodeIndex + index + 1}`;
      fixNodeIds[node.id!] = nextNodeId;
      node.data.status =
        node.data.status === NodeStatus.unfinished
          ? NodeStatus.unfinished
          : NodeStatus.default;
      const { x, y } = node.position!;
      node.position = { x: x + 32, y: y + 32 };
    });

    let str = JSON.stringify(data);
    Object.keys(fixNodeIds).forEach((nodeId) => {
      str = str.replace(new RegExp(`"${nodeId}"`, 'g'), `"${fixNodeIds[nodeId]}"`);
      str = str.replace(new RegExp(`${nodeId}-`, 'g'), `${fixNodeIds[nodeId]}-`);
    });

    const fixedData: {
      nodes: Node.Properties[];
      edges: Edge.Properties[];
    } = JSON.parse(str);
    graph.addNodes(fixedData.nodes, { dry: true });
    graph.addEdges(fixedData.edges, { dry: true });
    graph.resetSelection(fixedData.nodes.map((n) => n.id!));

    const nodes = fixedData.nodes.map((node) => ({
      id: node.data.id,
      codeName: node.data.codeName,
      label: node.data.label,
      x: node.position!.x,
      y: node.position!.y,
      status:
        node.data.status === NodeStatus.unfinished
          ? NodeStatus.default
          : node.data.status,
      nodeDef: node.data.nodeDef,
    }));
    await this.context.dataService.addNodes(nodes);

    await this.context.dataService.addEdges(
      fixedData.edges.map((edge) => ({
        id: edge.data.id,
        source: edge.data.source,
        target: edge.data.target,
        sourceAnchor: edge.data.sourceAnchor,
        targetAnchor: edge.data.targetAnchor,
      })),
    );

    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onNodesPasted) {
        event.onNodesPasted(nodes);
      }
    }
  }
}
