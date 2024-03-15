import { DAG } from '@secretflow/dag';
import { ref } from 'valtio';

import { SubmitGraphDataService } from './graph-data-service';
import { GraphHookService } from './graph-hook-service';
import { GraphSubmitRequestService } from './graph-request-service';

class MainDag extends DAG {
  dataService: SubmitGraphDataService = new SubmitGraphDataService(this);
  requestService: GraphSubmitRequestService = new GraphSubmitRequestService(this);
  hookService: GraphHookService = new GraphHookService(this);
}

const mainDag = new MainDag();

// 防止mainDag被valtio代理
export default ref(mainDag);
