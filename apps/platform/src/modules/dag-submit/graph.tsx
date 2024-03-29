import type { GraphManager } from '@secretflow/dag';
import { splitPortId } from '@secretflow/dag';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { GraphComponents, GraphView } from '@/modules/main-dag/graph';
import { createPortTooltip } from '@/modules/main-dag/util';
import { getModel, useModel } from '@/util/valtio-helper';

import type { ComputeMode } from '../component-tree/component-protocol';

import mainDag from './dag';
import { SubmitGraphService } from './graph-service';

export function SubmitGraphComponent() {
  return (
    <GraphComponents viewInstance={useModel(SubmitGraphView)} dagInstatnce={mainDag} />
  );
}

export class SubmitGraphView extends GraphView {
  graphManager: GraphManager = mainDag.graphManager;
  modelManager = getModel(DefaultModalManager);
  graphService = getModel(SubmitGraphService);

  onViewUnMount() {
    mainDag.dispose();
  }

  initGraph(dagId: string, container: HTMLDivElement, mode: ComputeMode) {
    if (container) {
      const { clientWidth, clientHeight } = container;
      mainDag.init(
        dagId,
        {
          container: container,
          width: clientWidth,
          height: clientHeight,
          onPortRendered: async ({ contentContainer, port, node }) => {
            const { codeName } = node.getData();
            const [domain, name] = codeName.split('/');
            const { type, index } = splitPortId(port.id);
            const component = await this.componentService.getComponentConfig(
              {
                domain,
                name,
              },
              mode,
            );
            if (component) {
              const interpretion = this.componentInterpreter.getComponentTranslationMap(
                {
                  domain,
                  name,
                  version: component.version,
                },
                mode,
              );
              const ioType = type === 'input' ? 'inputs' : 'outputs';
              const des = component[ioType][index].desc;
              createPortTooltip(
                contentContainer,
                (interpretion ? interpretion[des] : undefined) || des,
                'main-widget-tooltip',
              );
            }
          },
        },
        'LITE',
      );
    }
  }
}
