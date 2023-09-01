import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const runSingleActionHotKey = {
  key: 'enter',
  text: 'Enter',
};
export class RunSingleAction extends DAGContext implements ActionProtocol {
  type = ActionType.runSingle;
  label = '执行单节点';
  hotKey = runSingleActionHotKey;

  handle = async (graph: Graph, dagId: string, nodeIds: string[]) => {
    if (!nodeIds || nodeIds.length === 0) return;

    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onBlankClick) {
        event.onBlankClick();
      }
    }

    await this.context.requestService.startRun(dagId, nodeIds);
  };
}
