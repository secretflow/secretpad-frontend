import type { Graph, Cell } from '@antv/x6';

import type { ActionType, HotKey } from '../actions';

export type GraphMode = 'LITE' | 'FULL';

export type GraphManager = {
  graph: Graph | null;
  init: (
    dagId: string,
    graphConfig: Graph.Options,
    mode?: GraphMode,
    ...args: any[]
  ) => void;
  executeAction: (type: ActionType | ActionType[], ...args: any[]) => any;
  cancelAction: (type: ActionType) => void;
  cancelAllAction: () => void;
  getActionInfo: (type: ActionType) => { label: string; hotKey?: HotKey } | null;
  getGraphInstance: () => Graph | null;
  getSelectedCells: () => Cell[];
  dispose: () => void;
};
