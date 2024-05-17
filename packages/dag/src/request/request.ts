import DAGContext from '../context';
import type { GraphModel } from '../types';
import { NodeStatus } from '../types';

import type { RequestService } from './protocol';

export class DefaultRequestService extends DAGContext implements RequestService {
  async queryStatus(dagId: string) {
    return {
      nodeStatus: [
        {
          nodeId: 'test-node-1',
          status: NodeStatus.success,
        },
        {
          nodeId: 'test-node-2',
          status: NodeStatus.running,
        },
      ],
      finished: false,
    };
  }

  async queryDag(dagId: string) {
    return {
      nodes: [
        // {
        //   codeName: 'ss_sgd_train',
        //   id: 'test_node_1',
        //   label: '逻辑回归',
        //   x: 100,
        //   y: 100,
        //   status: 0,
        // },
        // {
        //   codeName: 'ss_sgd_predict',
        //   id: 'test_node_2',
        //   label: '模型预测',
        //   x: 300,
        //   y: 300,
        //   status: 2,
        // },
      ],
      edges: [
        // {
        //   id: 'test_node_1_output_0__test_node_2_input_0',
        //   source: 'test_node_1',
        //   sourceAnchor: 'test_node_1_output_0',
        //   target: 'test_node_2',
        //   targetAnchor: 'test_node_2_input_0',
        // },
      ],
    } as GraphModel;
  }

  async saveDag(dagId: string, model: GraphModel) {
    return;
  }

  async startRun(dagId: string, componentIds: string[]) {
    return;
  }

  async stopRun(dagId: string, componentId?: string) {
    return;
  }

  async continueRun(dagId: string, componentId?: string) {
    return;
  }

  async getMaxNodeIndex(dagId: string) {
    return 2;
  }
}
