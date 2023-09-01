import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ShowResultAction extends DAGContext implements ActionProtocol {
  type = ActionType.showResult;
  label = '展示结果';

  async handle(graph: Graph, dagId: string, outputId: string, codeName: string) {
    const events = this.context.EventHub.getData();
    for (const event of events) {
      if (event.onResultClick) {
        event.onResultClick(dagId, outputId, codeName);
      }
    }
  }
}
