import type { Graph } from '@antv/x6';

import type { ActionProtocol } from './protocol';
import { ActionType } from './protocol';

export const toggleSelectionActionHotKey = {
  key: '',
  text: 'Shift + 鼠标左键',
};
export class ToggleSelectionAction implements ActionProtocol {
  type = ActionType.toggleSelection;
  label = '切换框选状态';
  hotKey = toggleSelectionActionHotKey;

  rubberband = false;

  handle = (graph: Graph) => {
    return this.toggeleSelection(graph);
  };

  toggeleSelection(graph: Graph) {
    if (this.rubberband) {
      this.disableSelection(graph);
    } else {
      this.enableSelection(graph);
    }
    return this.rubberband;
  }

  enableSelection = (graph: Graph) => {
    graph.disablePanning();
    graph.setRubberbandModifiers(null);
    this.rubberband = true;
  };

  disableSelection = (graph: Graph) => {
    graph.enablePanning();
    graph.setRubberbandModifiers('shift');
    this.rubberband = false;
  };
}
