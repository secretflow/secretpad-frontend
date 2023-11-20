import { DefaultHookService } from '@secretflow/dag';
import type { GraphPort, GraphNodeOutput } from '@secretflow/dag';
import { parse } from 'query-string';

import { getModel } from '@/util/valtio-helper';

import type { ComputeMode } from '../component-tree/component-protocol';
import { DefaultComponentTreeService } from '../component-tree/component-tree-service';

export class GraphHookService extends DefaultHookService {
  componentService = getModel(DefaultComponentTreeService);

  async createResult(nodeId: string, codeName: string) {
    const [domain, name] = codeName.split('/');
    const { mode } = parse(window.location.search);
    if (!this.componentService.isLoaded) await this.componentService.getComponentList();
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
      outputs?.forEach((output, index) => {
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

  async createPort(nodeId: string, codeName: string) {
    const [domain, name] = codeName.split('/');
    const { mode } = parse(window.location.search);
    if (!this.componentService.isLoaded) await this.componentService.getComponentList();
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
          type: input.types,
        });
      });

      outputs?.forEach((output, index) => {
        ports.push({
          id: `${nodeId}-output-${index}`,
          group: 'bottom',
          type: output.types,
        });
      });

      return ports;
    }
    return [] as GraphPort[];
  }
}
