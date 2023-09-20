import type { Graph, Node, Edge } from '@antv/x6';
import { message } from 'antd';

import DAGContext from '../context';
import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const copyActionHotKey = {
  key: isWindows ? 'ctrl+c' : 'cmd+c',
  text: isWindows ? 'Ctrl C' : '⌘ C',
};

const DAG_COPY_CONTENT = 'DAG_COPY_CONTENT';

export class CopyAction extends DAGContext implements ActionProtocol {
  type = ActionType.copy;
  label = '复制';
  hotKey = copyActionHotKey;

  handle(graph: Graph, dagId: string, nodeIds: string[] = [], edgeIds: string[] = []) {
    const nodes: Node[] = nodeIds.map((id) => graph.getCellById(id) as Node);
    const edges: Edge[] = edgeIds.map((id) => graph.getCellById(id) as Edge);

    const nodesData = nodes.map((node) => node.getData());

    // filter unconnected edges
    const edgesData = edges.filter((edge) => {
      const edgeData = edge.getData();
      return (
        nodesData.find((node) => node.id === edgeData.source) &&
        nodesData.find((node) => node.id === edgeData.target)
      );
    });

    const data = {
      nodes: nodes.map((node) => node.toJSON()),
      edges: edgesData.map((edge) => edge.toJSON()),
    };
    localStorage.setItem(DAG_COPY_CONTENT, JSON.stringify(data));
    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onCopyActionChange) {
        event.onCopyActionChange(true);
      }
    }
    message.success('复制成功');
  }
}
