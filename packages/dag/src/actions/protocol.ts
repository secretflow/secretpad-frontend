import type { Graph } from '@antv/x6';

import type { DAGProtocol } from '@/protocol';

export enum ActionType {
  render = 'render',
  addNode = 'addNode',
  addEdge = 'addEdge',
  moveNode = 'moveNode',
  removeCell = 'removeCell',
  dragNode = 'dragNode',
  updateEdge = 'updateEdge',

  clearStatus = 'clearStatus',
  queryStatus = 'queryStatus',

  runAll = 'runAll',
  runSingle = 'runSingle',
  runDown = 'runDown',
  runUp = 'runUp',
  stopRun = 'stopRun',
  stopAll = 'stopAll',
  continueRun = 'continueRun',

  copy = 'copy',
  paste = 'paste',

  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  zoomToFit = 'zoomToFit',
  zoomToOrigin = 'zoomToOrigin',
  zoomTo = 'zoomTo',

  selectNode = 'selectNode',
  toggleSelection = 'toggleSelection',
  centerNode = 'centerNode',
  showResult = 'showResult',

  changeStyles = 'changeStyles',
  changeNodeData = 'changeNodeData',
  tidyLayout = 'tidyLayout',

  changeStatus = 'changeStatus',
}

export type HotKey = { key: string | string[]; text: string };

export interface ActionFactory {
  new (context?: DAGProtocol): ActionProtocol;
}

export interface ActionProtocol {
  type: ActionType;
  label: string;
  hotKey?: HotKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle: (graph: Graph, dagId: string, ...args: any[]) => any;
  cancel?: () => void;
}

export type { DAGProtocol };
