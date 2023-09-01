import type { Graph } from '@antv/x6';

import DAGContext from '../context';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class RunAllAction extends DAGContext implements ActionProtocol {
  type = ActionType.runAll;
  label = '全部运行';

  handle = async (graph: Graph, dagId: string) => {
    const nodeIds = graph.getNodes().map((node) => node.id);
    return await this.context.requestService.startRun(dagId, nodeIds);
  };
}
