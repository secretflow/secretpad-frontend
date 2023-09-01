import type { Graph } from '@antv/x6';

import { isWindows } from '../utils/platform';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const zoomToFitActionHotKey = {
  key: isWindows ? 'ctrl+p' : 'cmd+p',
  text: isWindows ? 'Ctrl P' : '⌘ P',
};
export class ZoomToFitAction implements ActionProtocol {
  type = ActionType.zoomToFit;
  label = '自适应窗口大小';
  hotKey = zoomToFitActionHotKey;

  handle = (graph: Graph) => {
    graph.zoomToFit({ maxScale: 1 });
    return graph.zoom();
  };
}
