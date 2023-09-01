import type { Graph, Node, Edge } from '@antv/x6';
import { message } from 'antd';

import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const copyActionHotKey = {
  key: isWindows ? 'ctrl+c' : 'cmd+c',
  text: isWindows ? 'Ctrl C' : '⌘ C',
};

const DAG_COPY_CONTENT = 'DAG_COPY_CONTENT';

export class CopyAction implements ActionProtocol {
  type = ActionType.copy;
  label = '复制';
  hotKey = copyActionHotKey;

  handle(graph: Graph, dagId: string, nodeIds: string[] = [], edgeIds: string[] = []) {
    const nodes: Node[] = nodeIds.map((id) => graph.getCellById(id) as Node);
    const edges: Edge[] = edgeIds.map((id) => graph.getCellById(id) as Edge);
    const data = {
      nodes: nodes.map((node) => node.toJSON()),
      edges: edges.map((edge) => edge.toJSON()),
    };
    localStorage.setItem(DAG_COPY_CONTENT, JSON.stringify(data));

    message.success('复制成功');
  }
}
