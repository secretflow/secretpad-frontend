import type { Graph } from '@antv/x6';
import type { GraphMode } from '@secretflow/dag';
import { ActionType, DefaultGraphManager } from '@secretflow/dag';

import type { ComputeMode } from '../component-tree/component-protocol';

export class GraphManager extends DefaultGraphManager {
  init = (
    dagId: string,
    graphConfig: Graph.Options,
    mode: GraphMode = 'FULL',
    highlightNodeId: string | string[],
    nodes: API.GraphNodeDetail[] = [],
    edges: API.GraphEdge[] = [],
    computeMode: ComputeMode,
  ) => {
    this.dagId = dagId;

    if (this.context.dataService.setGraphInfo) {
      this.context.dataService.setGraphInfo({
        nodes,
        edges,
        highlightNodeId,
        mode: computeMode,
      });
    }

    if (!this.graph) {
      this.initGraph(graphConfig);
      if (mode === 'FULL') {
        this.initPlugins();
        this.initHotKeys();
      }
      this.initEvents(mode);

      this.executeAction([ActionType.render, ActionType.queryStatus]);
    }
  };
}
