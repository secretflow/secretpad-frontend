import { Emitter } from '@secretflow/utils';

export class DatatableInfoService {
  eventEmitter: Emitter<any>;

  constructor() {
    this.eventEmitter = new Emitter();
  }
}
