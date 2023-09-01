import type { Graph } from '@antv/x6';

import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const zoomToOriginActionHotKey = {
  key: isWindows ? 'ctrl+o' : 'cmd+o',
  text: isWindows ? 'Ctrl O' : '⌘ O',
};
export class ZoomToOriginAction implements ActionProtocol {
  type = ActionType.zoomToOrigin;
  label = '实际像素展示';
  hotKey = zoomToOriginActionHotKey;

  handle(graph: Graph) {
    graph.zoomTo(1);
    return graph.zoom();
  }
}
