import { DAG } from '@secretflow/dag';
import { ref } from 'valtio';

import { GraphDataService } from './graph-data-service';
import { GraphHookService } from './graph-hook-service';
import { GraphRequestService } from './graph-request-service';

class MainDag extends DAG {
  dataService: GraphDataService = new GraphDataService(this);
  requestService: GraphRequestService = new GraphRequestService(this);
  hookService: GraphHookService = new GraphHookService(this);
}

const mainDag = new MainDag();

export default ref(mainDag);
