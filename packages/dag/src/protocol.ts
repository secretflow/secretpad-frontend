import type { Graph } from '@antv/x6';

import type { DataService } from './data';
import type { HookService } from './hooks';
import type { GraphManager, GraphMode } from './manager';
import type { RequestService } from './request';
import type { Registry } from '@secretflow/utils';
import { GraphEventHandlerProtocol } from './types';
import { ActionProtocol } from './actions';

export interface DAGProtocol {
  dagId: string;
  requestService: RequestService;
  hookService: HookService;
  dataService: DataService;
  graphManager: GraphManager;

  EventHub: Registry<GraphEventHandlerProtocol>;
  ActionHub: Registry<ActionProtocol>;

  init: (dagId: string, graphConfig: Graph.Options, mode: GraphMode) => void;
}
