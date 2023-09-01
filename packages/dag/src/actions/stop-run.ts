import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class StopRunAction extends DAGContext implements ActionProtocol {
  type = ActionType.stopRun;
  label = '停止执行';

  handle = async (graph: Graph, dagId: string, nodeId: string) => {
    await this.context.requestService.stopRun(dagId, nodeId);
  };
}
