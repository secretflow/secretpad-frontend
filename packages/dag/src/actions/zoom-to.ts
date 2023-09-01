import type { Graph } from '@antv/x6';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ZoomToAction implements ActionProtocol {
  type = ActionType.zoomTo;
  label = '缩放至';

  handle(graph: Graph, dagId: string, zoom: number) {
    graph.zoomTo(zoom);
    return graph.zoom();
  }
}
