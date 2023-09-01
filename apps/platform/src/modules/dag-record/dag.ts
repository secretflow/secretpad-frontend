import { DAG } from '@secretflow/dag';
import { ref } from 'valtio';

import { RecordGraphDataService } from './graph-data-service';
import { GraphHookService } from './graph-hook-service';
import { GraphRecordRequestService } from './graph-request-service';

class MainDag extends DAG {
  dataService: RecordGraphDataService = new RecordGraphDataService(this);
  requestService: GraphRecordRequestService = new GraphRecordRequestService(this);
  hookService: GraphHookService = new GraphHookService(this);
}

const mainDag = new MainDag();

// 防止mainDag被valtio代理
export default ref(mainDag);
