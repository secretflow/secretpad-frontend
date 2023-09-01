import type { Graph } from '@antv/x6';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export class ChangeStylesAction implements ActionProtocol {
  type = ActionType.changeStyles;
  label = '改变样式';

  timer = 0;

  handle(
    graph: Graph,
    dagId: string,
    nodeStyles: { nodeId: string; styles: { isOpaque: boolean } }[],
  ) {
    this.changeNodesStyle(nodeStyles, graph);
  }

  changeNodesStyle(
    nodeStyles: { nodeId: string; styles: { isOpaque: boolean } }[],
    graph: Graph,
  ) {
    nodeStyles?.forEach(({ nodeId, styles }) => {
      const node = graph.getCellById(nodeId);
      if (node) {
        node.setData({
          ...node.getData(),
          styles,
        });
      }
    });
  }
}
