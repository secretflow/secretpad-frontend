import DAGContext from '../context';
import type { GraphPort, GraphNodeOutput } from '../types';

import type { HookService } from './protocol';

export class DefaultHookService extends DAGContext implements HookService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createPort(nodeId: string, codeName: string): Promise<GraphPort[]> {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createResult(nodeId: string, codeName: string): Promise<GraphNodeOutput[]> {
    return [];
  }
}
