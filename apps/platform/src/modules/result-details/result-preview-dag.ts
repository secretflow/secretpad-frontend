import { DAG } from '@secretflow/dag';
import type {
  DataService,
  HookService,
  GraphManager as IGraphManager,
} from '@secretflow/dag';
import { ref } from 'valtio';

import { GraphDataService } from './graph-data-service';
import { GraphHookService } from './graph-hook-service';
import { GraphManager } from './graph-manager';

class ResultPreviewDag extends DAG {
  dataService: DataService = new GraphDataService(this);
  hookService: HookService = new GraphHookService(this);
  graphManager: IGraphManager = new GraphManager(this);
}

const resultPreviewDag = new ResultPreviewDag();

export default ref(resultPreviewDag);
