import type { Graph } from '@antv/x6';

import DAGContext from '../context';
import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const runUpActionHotKey = {
  key: isWindows ? 'ctrl+up' : 'cmd+up',
  text: isWindows ? 'Ctrl ↑' : '⌘ ↑',
};
export class RunUpAction extends DAGContext implements ActionProtocol {
  type = ActionType.runUp;
  label = '执行到此';
  hotKey = runUpActionHotKey;

  handle = async (graph: Graph, dagId: string, nodeId: string[]) => {
    if (!nodeId || nodeId.length === 0) return;
    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onBlankClick) {
        event.onBlankClick();
      }
    }
    const nodeIds = this.getSuperGraph(graph, nodeId[0]);
    await this.context.requestService.startRun(dagId, Array.from(nodeIds));
  };

  getSuperGraph(graph: Graph, nodeId: string, nodeIds: Set<string> = new Set()) {
    nodeIds.add(nodeId);
    const incomingEdges = graph.getIncomingEdges(nodeId);
    incomingEdges?.forEach((edge) => {
      const data = edge.getData();
      const { source } = data;
      this.getSuperGraph(graph, source, nodeIds);
    });
    return nodeIds;
  }
}
