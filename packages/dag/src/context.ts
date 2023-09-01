import type { DAGProtocol } from './protocol';

export default class DAGContext {
  context: DAGProtocol;

  constructor(context: DAGProtocol) {
    this.context = context;
  }
}
