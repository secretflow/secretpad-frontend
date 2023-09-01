import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class StopAllAction extends DAGContext implements ActionProtocol {
  type = ActionType.stopAll;
  label = '停止全部';

  handle = async (graph: Graph, dagId: string, nodeId: string[]) => {
    return await this.context.requestService.stopRun(dagId);
  };
}
