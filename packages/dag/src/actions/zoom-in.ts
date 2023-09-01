import type { Graph } from '@antv/x6';

import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const zoomInActionHotKey = {
  key: isWindows ? 'ctrl+=' : 'cmd+=',
  text: isWindows ? 'Ctrl +' : '⌘ +',
};
export class ZoomInAction implements ActionProtocol {
  type = ActionType.zoomIn;
  label = '放大';
  hotKey = zoomInActionHotKey;

  handle(graph: Graph) {
    const zoom = graph.zoom();
    if (zoom < 1.5) {
      graph.zoom(0.25);
    }
    return graph.zoom();
  }
}
