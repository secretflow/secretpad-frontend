import { DefaultDataService } from '@secretflow/dag';

export class SubmitGraphDataService extends DefaultDataService {
  getNode(nodeId: string) {
    return this.getNodes().find(({ id }) => id === nodeId);
  }
}
