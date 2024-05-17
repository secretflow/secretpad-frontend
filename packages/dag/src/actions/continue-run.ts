import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ContinueRunAction extends DAGContext implements ActionProtocol {
  type = ActionType.continueRun;
  label = '继续执行';

  handle = async (graph: Graph, dagId: string, nodeId: string) => {
    await this.context.requestService.continueRun(dagId, nodeId);
  };
}
