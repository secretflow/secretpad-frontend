import type { Cell, Edge, GraphEventHandlerProtocol } from '@secretflow/dag';

import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import { getModel } from '@/util/valtio-helper';

import resultPreviewDag from './result-preview-dag';

export class PreviewGraphService implements GraphEventHandlerProtocol {
  graphManager = resultPreviewDag.graphManager;
  componentService = getModel(DefaultComponentTreeService);
  graphDataManager = resultPreviewDag.dataService;

  onGraphScale?: ((zoom: number) => void) | undefined;
  onSelectionChanged?: ((cells: Cell<Cell.Properties>[]) => void) | undefined;
  onEdgeRemoved?: ((edge: Edge) => void) | undefined;
  onResultClick?: (graphId: string, outputId: string, codeName: string) => void;
}

resultPreviewDag.EventHub.register(getModel(PreviewGraphService));
