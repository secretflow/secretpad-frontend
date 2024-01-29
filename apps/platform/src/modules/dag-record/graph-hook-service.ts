import type { GraphNodeOutput, GraphPort } from '@secretflow/dag';
import { DefaultHookService } from '@secretflow/dag';
import { parse } from 'query-string';

import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import { getModel } from '@/util/valtio-helper';

import type { ComputeMode } from '../component-tree/component-protocol';

const DISTDATA_TYPE = {
  REPORT: 'sf.report',
  READ_DATA: 'sf.read_data',
};

export class GraphHookService extends DefaultHookService {
  componentService = getModel(DefaultComponentTreeService);

  async createResult(nodeId: string, codeName: string) {
    const [domain, name] = codeName.split('/');
    const { mode } = parse(window.location.search);
    const component = await this.componentService.getComponentConfig(
      {
        domain,
        name,
      },
      mode as ComputeMode,
    );

    if (component) {
      const results: GraphNodeOutput[] = [];
      const { outputs } = component;
      outputs.forEach((output, index) => {
        if (
          output.types &&
          output.types[0] &&
          [DISTDATA_TYPE.READ_DATA].includes(output.types[0])
        ) {
          return;
        }

        results.push({
          id: `${nodeId}-output-${index}`,
          name: output.name,
          type: output.types[0].split('.')[1],
        });
      });

      return results;
    }
    return [];
  }

  /**
   * Create input and output ports on graph nodes.
   * Node: When the output type is a report, the render of this port should be ignored
   * @param nodeId graphNode id
   * @param codeName the component name
   * @returns the ports list
   */
  async createPort(nodeId: string, codeName: string) {
    const [domain, name] = codeName.split('/');
    const { mode } = parse(window.location.search);

    const component = await this.componentService.getComponentConfig(
      {
        domain,
        name,
      },
      mode as ComputeMode,
    );

    if (component) {
      const ports: GraphPort[] = [];
      const { inputs, outputs } = component;
      inputs?.forEach((input, index) => {
        ports.push({
          id: `${nodeId}-input-${index}`,
          group: 'top',
          type: input.types[0],
          attrs: {
            circle: {
              magnet: false,
            },
          },
        });
      });

      outputs.forEach((output, index) => {
        // ignore the report output
        if (
          output.types &&
          output.types[0] &&
          [DISTDATA_TYPE.REPORT, DISTDATA_TYPE.READ_DATA].includes(output.types[0])
        ) {
          return;
        }

        ports.push({
          id: `${nodeId}-output-${index}`,
          group: 'bottom',
          type: output.types,
          attrs: {
            circle: {
              magnet: false,
            },
          },
        });
      });

      return ports;
    }
    return [];
  }
}
