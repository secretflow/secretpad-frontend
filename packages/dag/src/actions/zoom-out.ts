import type { Graph } from '@antv/x6';

import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const zoomOutActionHotKey = {
  key: isWindows ? 'ctrl+-' : 'cmd+-',
  text: isWindows ? 'Ctrl -' : '⌘ -',
};

export class ZoomOutAction implements ActionProtocol {
  type = ActionType.zoomOut;
  label = '缩小';
  hotKey = zoomOutActionHotKey;

  handle(graph: Graph) {
    const zoom = graph.zoom();
    if (zoom > 0.5) {
      graph.zoom(-0.25);
    }
    return graph.zoom();
  }
}
