import type { Graph } from '@antv/x6';

import DAGContext from '../context';
import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const runDownActionHotKey = {
  key: isWindows ? 'ctrl+down' : 'cmd+down',
  text: isWindows ? 'Ctrl ↓' : '⌘ ↓',
};

export class RunDownAction extends DAGContext implements ActionProtocol {
  type = ActionType.runDown;
  label = '开始执行';
  hotKey = runDownActionHotKey;

  handle = async (graph: Graph, dagId: string, nodeId: string[]) => {
    if (!nodeId || nodeId.length === 0) return;
    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onBlankClick) {
        event.onBlankClick();
      }
    }

    const nodeIds = this.getSubGraph(graph, nodeId[0]);
    this.context.requestService.startRun(dagId, Array.from(nodeIds));
  };

  getSubGraph(graph: Graph, nodeId: string, nodeIds: Set<string> = new Set()) {
    nodeIds.add(nodeId);
    const outgoingEdges = graph.getOutgoingEdges(nodeId);
    outgoingEdges?.forEach((edge) => {
      const data = edge.getData();
      const { target } = data;
      this.getSubGraph(graph, target, nodeIds);
    });
    return nodeIds;
  }
}
