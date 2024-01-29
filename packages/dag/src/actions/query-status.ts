import type { Graph } from '@antv/x6';

import DAGContext from '../context';
import { NodeStatus } from '../types';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class QueryStatusAction extends DAGContext implements ActionProtocol {
  type = ActionType.queryStatus;
  label = '查询运行状态';

  timer = 0;

  async handle(graph: Graph, dagId: string) {
    await this.queryStatus(graph, dagId);
  }

  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  async queryStatus(graph: Graph, dagId: string) {
    const events = this.context.EventHub.getData();

    const { nodeStatus, finished } = await this.context.requestService.queryStatus(
      dagId,
    );

    this.changeNodesStatus(nodeStatus, graph);

    const isRunning = !finished;
    // for (let i = 0, len = nodeStatus.length; i < len; i += 1) {
    //   const { status } = nodeStatus[i];
    //   if (status === NodeStatus.running || status === NodeStatus.pending) {
    //     isRunning = true;
    //     break;
    //   }
    // }

    if (isRunning) {
      this.timer = window.setTimeout(() => {
        this.queryStatus(graph, dagId);
      }, 2000);

      for (const event of events) {
        if (event.onNodeRunning) {
          event.onNodeRunning(true);
        }

        if (event.onNodeStatusChanged) {
          event.onNodeStatusChanged(nodeStatus);
        }
      }
    } else {
      for (const event of events) {
        if (event.onNodeRunning) {
          event.onNodeRunning(false);
        }

        if (event.onNodeStatusChanged) {
          event.onNodeStatusChanged(nodeStatus);
        }
      }
    }
  }

  changeNodesStatus(
    nodeStatus: { nodeId: string; status: NodeStatus }[],
    graph: Graph,
  ) {
    nodeStatus.forEach(({ nodeId, status }) => {
      const node = graph.getCellById(nodeId);
      if (node) {
        node.setData({
          ...node.getData(),
          status,
        });
        const edges = graph.getIncomingEdges(nodeId);
        edges?.forEach((edge) => {
          const sourceNodeId = edge.getSourceCellId();
          if (sourceNodeId) {
            const sourceNode = nodeStatus.find((item) => item.nodeId === sourceNodeId);
            if (sourceNode && sourceNode.status === NodeStatus.success) {
              this.changeEdgeStatus(graph, edge.id, status);
            }
          }
        });
      }
    });
  }

  changeEdgeStatus(graph: Graph, edgeId: string, status: NodeStatus) {
    const edge = graph.getCellById(edgeId);
    if (edge) {
      if (status === NodeStatus.running) {
        edge.attr('line/strokeDasharray', 5);
        edge.attr('line/stroke', '#1890ff');
        edge.attr('line/strokeWidth', '2');
        edge.attr('line/style/animation', 'ant-line 30s infinite linear');
      } else if (status === NodeStatus.success || status === NodeStatus.failed) {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/style/animation', '');
        edge.attr('line/strokeWidth', '1.5');
        edge.attr('line/stroke', '#c2c8d5');
      } else {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/style/animation', '');
        edge.attr('line/strokeWidth', '1');
        edge.attr('line/stroke', '#c2c8d5');
      }
    }
  }
}
