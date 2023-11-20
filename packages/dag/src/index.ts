/** 暴露接口和默认类方便继承 */
export * from './actions';
export * from './manager';
export * from './request';
export * from './hooks';
// export * from './vis';
export * from './data';
export * from './types';
export * from './utils';
export * from './shapes';

import type { Graph } from '@antv/x6';
import { Portal, register as ShapeRegister } from '@antv/x6-react-shape';
import { createRegistry, Registry } from '@secretflow/utils';

import type { ActionProtocol } from './actions';
import { Actions } from './actions';
import { createAction } from './actions';
import type { ActionFactory } from './actions/protocol';
import type { DataService } from './data';
import { DefaultDataService } from './data';
import type { HookService } from './hooks';
import { DefaultHookService } from './hooks';
import type { GraphManager, GraphMode } from './manager';
import { DefaultGraphManager } from './manager';
import type { DAGProtocol } from './protocol';
import type { RequestService } from './request';
import { DefaultRequestService } from './request';
import type { GraphEventHandlerProtocol } from './types';

export { Portal, ShapeRegister, Registry };

export type { RequestService, HookService, DataService, GraphManager };

export const DAGGlobalContainer = new WeakMap<Graph, DAG>();

export class DAG implements DAGProtocol {
  dagId = '';

  requestService: RequestService = new DefaultRequestService(this);
  hookService: HookService = new DefaultHookService(this);
  dataService: DataService = new DefaultDataService(this);
  graphManager: GraphManager = new DefaultGraphManager(this);

  ActionHub = createRegistry<ActionProtocol>();
  EventHub = createRegistry<GraphEventHandlerProtocol>();

  constructor() {
    Actions.forEach((Action) => {
      this.ActionHub.register(new Action(this));
    });
  }

  init(
    dagId: string,
    graphConfig: Graph.Options,
    mode: GraphMode = 'FULL',
    ...args: any[]
  ) {
    this.dagId = dagId;
    this.graphManager.init(dagId, graphConfig, mode, ...args);
    if (this.graphManager.graph) {
      DAGGlobalContainer.set(this.graphManager.graph, this);
    }
  }

  addActions(actions: ActionFactory[]) {
    actions.forEach((Action) => {
      this.ActionHub.register(createAction(Action, this));
    });
  }

  addGraphEvents(event: GraphEventHandlerProtocol) {
    this.EventHub.register(event);
  }

  dispose() {
    if (this.graphManager.graph) {
      DAGGlobalContainer.delete(this.graphManager.graph);
    }
    this.graphManager.dispose();
  }
}
